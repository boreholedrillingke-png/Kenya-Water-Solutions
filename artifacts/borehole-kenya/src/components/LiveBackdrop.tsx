import { useEffect, useRef } from "react";
import { IMAGES } from "@/lib/images";

interface Clip { file: string; title: string }

/** Pages listen for this to show the name of the clip that is playing. */
export const LIVE_TITLE_EVENT = "live-title";

const CLIP_SECONDS = 9; // how long each clip plays before the next fades in
const MAX_CLIPS = 8;
const ROOT_CLASS = "live-on"; // while set on <html>, page photo backdrops turn clear so the video shows through
const START_DELAY_MS = 900; // wait until the page has settled so the first paint stays instant

/** Skip the live video when the visitor asked for less motion or is saving data. The photo stays instead. */
function shouldPlay() {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (c?.saveData) return false;
    if (c?.effectiveType && /^(slow-2g|2g|3g)$/.test(c.effectiveType)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Silent, looping "live channel" background for the whole site. Two stacked <video> elements take turns: the next
 * clip loads in the hidden one and only fades in once it is really playing, so the picture never goes blank or stutters.
 * Small clips (about 1 MB each) are used so it stays light on mobile data.
 */
export default function LiveBackdrop() {
  const onTitle = (title: string) => window.dispatchEvent(new CustomEvent(LIVE_TITLE_EVENT, { detail: title }));
  const box = useRef<HTMLDivElement>(null);
  const v0 = useRef<HTMLVideoElement>(null);
  const v1 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!shouldPlay()) return;
    const els = [v0.current, v1.current];
    if (!els[0] || !els[1] || !box.current) return;
    const vids = els as HTMLVideoElement[];
    vids.forEach((v) => { v.muted = true; v.defaultMuted = true; v.playsInline = true; });

    let dead = false;
    let clips: Clip[] = [];
    let idx = 0; // index of the clip on the visible element
    let cur = 0; // which element is visible
    let timer: ReturnType<typeof setTimeout> | undefined;
    let fails = 0;
    let inView = true;
    let tabVisible = !document.hidden;
    const base = import.meta.env.BASE_URL;

    const clipAt = (i: number) => clips[i % clips.length];
    const load = (el: HTMLVideoElement, clip: Clip) => {
      el.preload = "auto";
      el.src = `${base}videos/${clip.file}`;
      el.load();
    };
    const running = () => inView && tabVisible;

    const schedule = () => {
      clearTimeout(timer);
      if (dead || !running()) return;
      timer = setTimeout(advance, CLIP_SECONDS * 1000);
    };

    const root = document.documentElement;
    const stopAfterFailures = () => {
      root.classList.remove(ROOT_CLASS);
      dead = true;
      clearTimeout(timer);
      vids.forEach((v) => { v.style.opacity = "0"; v.pause(); });
    };

    function advance() {
      if (dead) return;
      if (!running()) return; // resumes from the observers below
      const out = vids[cur];
      const inc = vids[1 - cur];
      const nextIdx = idx + 1;
      let settled = false;

      const fail = () => {
        if (settled || dead) return;
        settled = true;
        fails += 1;
        if (fails >= 3) { stopAfterFailures(); return; }
        idx = nextIdx; // skip the clip that would not play
        load(inc, clipAt(idx + 1));
        timer = setTimeout(advance, 1500);
      };
      const guard = setTimeout(fail, 8000);

      const onPlaying = () => {
        if (settled || dead) return;
        settled = true;
        clearTimeout(guard);
        fails = 0;
        inc.style.opacity = "1";
        out.style.opacity = "0";
        idx = nextIdx;
        cur = 1 - cur;
        onTitle(clipAt(idx).title);
        // After the fade, park the old element and get the following clip ready in it.
        setTimeout(() => {
          if (dead) return;
          out.pause();
          load(out, clipAt(idx + 1));
        }, 1200);
        schedule();
      };

      inc.addEventListener("playing", onPlaying, { once: true });
      inc.currentTime = 0;
      inc.play().catch(() => { clearTimeout(guard); fail(); });
    }

    const start = async () => {
      try {
        const res = await fetch(`${base}videos/live/live.json`);
        const list = (await res.json()) as Clip[];
        clips = list.filter((c) => c && c.file).slice(0, MAX_CLIPS);
      } catch { return; }
      if (dead || clips.length === 0) return;

      const first = vids[0];
      first.addEventListener("playing", () => {
        if (dead) return;
        first.style.opacity = "1";
        root.classList.add(ROOT_CLASS);
        onTitle(clipAt(0).title);
        if (clips.length > 1) { load(vids[1], clipAt(1)); schedule(); }
        else first.loop = true; // a single clip just repeats
      }, { once: true });
      load(first, clipAt(0));
      first.play().catch(() => { /* autoplay refused: the photo stays */ });
    };

    // Short clips: move on as soon as one finishes
    const onEnded = (e: Event) => { if (e.target === vids[cur] && clips.length > 1) { clearTimeout(timer); advance(); } };
    vids.forEach((v) => v.addEventListener("ended", onEnded));

    // Pause (and save data) while the hero is off-screen or the tab is hidden
    const pauseResume = () => {
      if (dead || !clips.length) return;
      if (running()) { vids[cur].play().catch(() => {}); schedule(); }
      else { vids[cur].pause(); clearTimeout(timer); }
    };
    const io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; pauseResume(); }, { threshold: 0.05 });
    io.observe(box.current);
    const onVis = () => { tabVisible = !document.hidden; pauseResume(); };
    document.addEventListener("visibilitychange", onVis);

    let begin: ReturnType<typeof setTimeout> | undefined;
    const go = () => { begin = setTimeout(start, START_DELAY_MS); };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });

    return () => {
      dead = true;
      root.classList.remove(ROOT_CLASS);
      clearTimeout(timer);
      clearTimeout(begin);
      window.removeEventListener("load", go);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      vids.forEach((v) => { v.removeEventListener("ended", onEnded); v.pause(); v.removeAttribute("src"); v.load(); });
    };
  }, []);

  const cls = "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out";
  return (
    <div
      ref={box}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: `hsl(215 70% 8%) url(${IMAGES.rig}) center 60% / cover` }}
      aria-hidden="true"
    >
      <video ref={v0} className={cls} style={{ objectPosition: "center 45%" }} muted playsInline preload="none" tabIndex={-1} disablePictureInPicture />
      <video ref={v1} className={cls} style={{ objectPosition: "center 45%" }} muted playsInline preload="none" tabIndex={-1} disablePictureInPicture />
      {/* Dark blue wash keeps every page easy to read over moving pictures */}
      <div className="absolute inset-0" style={{ background: "hsl(215 70% 8% / .42)" }} />
    </div>
  );
}
