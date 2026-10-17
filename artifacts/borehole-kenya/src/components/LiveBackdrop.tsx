import { useEffect, useRef } from "react";
import { IMAGES } from "@/lib/images";

interface Clip { file: string; title: string; url?: string }

/** Pages listen for this to show the name of the clip that is playing. */
export const LIVE_TITLE_EVENT = "live-title";

const MIN_CLIP_MS = 4000; // each clip plays for a random 4 to 5 seconds before the next fades in
const MAX_CLIP_MS = 5000;
const MAX_CONSECUTIVE_FAILS = 6;
const ROOT_CLASS = "live-on"; // while set on <html>, page photo backdrops turn clear so the video shows through
const START_DELAY_MS = 900; // wait until the page has settled so the first paint stays instant
const API = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");

/**
 * Videos posted from /admin on Cloudinary are asked for as a clean H.264 MP4 at their own quality (no sound, first 10 seconds),
 * so any phone format (such as iPhone .mov) plays. GitHub and other files play as they are.
 */
function cloudinaryClip(url: string): string | null {
  if (!/^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url)) return null;
  return url.replace("/video/upload/", "/video/upload/q_auto:good,vc_h264,f_mp4,ac_none,so_0,du_10/").replace(/\.\w+$/, ".mp4");
}

/**
 * Skip the live video only when the visitor has asked their device for less motion or turned on data saver.
 * Connection speed is not checked: most visitors are on Wi-Fi. The photo stays when the video is skipped.
 * Opening the site with ?live=1 forces the video on (handy for testing on a phone).
 */
function shouldPlay() {
  try {
    if (new URLSearchParams(window.location.search).get("live") === "1") return true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (c?.saveData) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Silent, looping "live channel" background for the whole site. Two stacked <video> elements take turns: the next
 * clip loads in the hidden one and only fades in once it is really playing, so the picture never goes blank or stutters.
 * Full-quality videos are used: the 22 on the site plus everything posted from /admin.
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

    // Random order: clips are shuffled, and a new shuffle is chained on when the list runs out, never repeating back to back.
    let order: number[] = [];
    const extendOrder = () => {
      const bag = clips.map((_, i) => i);
      for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
      if (order.length && bag.length > 1 && bag[0] === order[order.length - 1]) bag.push(bag.shift() as number);
      order = order.concat(bag);
    };
    const clipAt = (i: number) => {
      while (order.length <= i) extendOrder();
      return clips[order[i]];
    };
    const load = (el: HTMLVideoElement, clip: Clip) => {
      el.preload = "auto";
      el.src = clip.url ?? `${base}videos/${clip.file}`;
      el.load();
    };
    const running = () => inView && tabVisible;

    const schedule = () => {
      clearTimeout(timer);
      if (dead || !running()) return;
      timer = setTimeout(advance, MIN_CLIP_MS + Math.random() * (MAX_CLIP_MS - MIN_CLIP_MS));
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
        if (fails >= MAX_CONSECUTIVE_FAILS) { stopAfterFailures(); return; }
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
        const res = await fetch(`${base}videos/feed.json`);
        const list = (await res.json()) as Clip[];
        clips = list.filter((c) => c && c.file);
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
      // Videos posted from /admin join the mix as soon as the server answers (it can take a while to wake up).
      fetch(`${API}/api/feed-videos`)
        .then((r) => r.json())
        .then((d: { url?: string; title?: string; source?: string; createdAt?: string }[]) => {
          if (dead || !Array.isArray(d)) return;
          const known = new Set(clips.map((c) => c.url ?? c.file));
          const fresh: Clip[] = [];
          for (const v of d) {
            if (!v?.url) continue;
            const title = v.title ?? "Successful Borehole";
            const light = cloudinaryClip(v.url);
            let clip: Clip | null = null;
            if (light) clip = { file: light, url: light, title };
            else if (v.source === "github") {
              // a GitHub upload goes live after the site rebuilds (about 4 minutes)
              const readyAt = v.createdAt ? new Date(v.createdAt + "Z").getTime() + 4 * 60_000 : 0;
              if (Date.now() > readyAt) { const u = `${base}${v.url}`; clip = { file: u, url: u, title }; }
            } else { clip = { file: v.url, url: v.url, title }; }
            if (clip && !known.has(clip.url as string)) { known.add(clip.url as string); fresh.push(clip); }
          }
          if (!fresh.length) return;
          const startAt = clips.length;
          clips.push(...fresh);
          // play the new ones within the next few clips, in random places, then they join every shuffle
          fresh.forEach((_, k) => {
            const at = idx + 2 + Math.floor(Math.random() * Math.max(3, fresh.length * 2));
            while (order.length < at) extendOrder();
            order.splice(at, 0, startAt + k);
          });
        })
        .catch(() => {});
      load(first, clipAt(0));
      // If the browser refuses to autoplay (battery saver, strict phone settings), try again on the first touch, click or scroll.
      first.play().catch(() => {
        const retry = () => {
          ["pointerdown", "keydown", "scroll", "touchstart"].forEach((t) => window.removeEventListener(t, retry));
          if (!dead) first.play().catch(() => {});
        };
        ["pointerdown", "keydown", "scroll", "touchstart"].forEach((t) => window.addEventListener(t, retry, { passive: true }));
      });
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
