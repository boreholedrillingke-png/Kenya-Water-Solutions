import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, MapPin, Volume2, VolumeX, X, Send, Trash2, Play, Pause, ShieldCheck, Heart, Share2, Eye, Plus, UploadCloud, ChevronsDown } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export interface FeedVideo {
  key: string; // id used for likes, comments and share links
  src: string;
  poster?: string;
  title: string;
  location?: string;
  dbId?: number; // set for videos uploaded from the website (admin can delete these)
  publishingUntil?: number; // GitHub uploads take ~2 minutes to appear on the site
}
interface Comment { id: number; name: string; body: string; createdAt: string }
interface Stat { likes: number; views: number; shares: number; comments: number }
const ZERO: Stat = { likes: 0, views: 0, shares: 0, comments: 0 };

const base = import.meta.env.BASE_URL;
export const API = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");
export const api = (path: string) => `${API}/api/video-comments${path}`;
const statsApi = (path: string) => `${API}/api/video-stats${path}`;

export const store = {
  get: (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } },
  set: (k: string, v: string) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* ignore */ } },
};
// anonymous id so one visitor = one like per video
const clientId = (() => {
  let id = store.get("kws_client");
  if (!id) { id = (crypto?.randomUUID?.() ?? String(Math.random()).slice(2) + Date.now()); store.set("kws_client", id); }
  return id;
})();

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

const ago = (iso: string) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso + (iso.endsWith("Z") ? "" : "Z")).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export default function Feed() {
  const [videos, setVideos] = useState<FeedVideo[] | null>(null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(() => store.get("kws_feed_muted") === "1"); // sound is ON unless the visitor muted it
  const [blocked, setBlocked] = useState(false); // the browser refused sound until the first tap
  const [auto, setAuto] = useState(() => store.get("kws_feed_auto") !== "0"); // auto-scroll to the next video when one ends
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; slide: number }[]>([]);
  const [flash, setFlash] = useState<{ slide: number; paused: boolean; n: number } | null>(null);
    const [toast, setToast] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState(() => store.get("kws_admin"));
  const [uploading, setUploading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLVideoElement | null)[]>([]);
  const mutedRef = useRef(muted);
  const autoRef = useRef(auto);
  const unlockedAt = useRef(0);
  const bars = useRef<(HTMLDivElement | null)[]>([]);
  const lastTap = useRef({ t: 0, i: -1 });
  const tapTimer = useRef<number | undefined>(undefined);
  const viewed = useRef<Set<string>>(new Set());
  const likedRef = useRef(liked);
  mutedRef.current = muted;
  autoRef.current = auto;
  likedRef.current = liked;

  const stat = (id: string) => stats[id] ?? ZERO;
  const bump = useCallback((id: string, key: keyof Stat, d: number) =>
    setStats((s) => ({ ...s, [id]: { ...(s[id] ?? ZERO), [key]: Math.max(0, (s[id]?.[key] ?? 0) + d) } })), []);
  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(""), 1800); };

  useEffect(() => {
    const loadAll = async () => {
      const staticList: FeedVideo[] = await fetch(`${base}videos/feed.json`, { cache: "no-cache" })
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => (Array.isArray(d) ? d : []))
        .catch(() => [])
        .then((d: { file?: string; poster?: string; title: string; location?: string }[]) =>
          d.filter((v) => v.file).map((v) => ({
            key: v.file as string, src: `${base}videos/${v.file}`, poster: v.poster ? `${base}videos/${v.poster}` : undefined,
            title: v.title, location: v.location,
          })));
      const uploaded: FeedVideo[] = await fetch(`${API}/api/feed-videos`)
        .then((r) => r.json())
        .then((d: { id: number; url: string; poster?: string; title: string; location?: string; source?: string; createdAt?: string }[]) =>
          (Array.isArray(d) ? d : []).map((v) => ({
            key: `db-${v.id}`, dbId: v.id, title: v.title, location: v.location ?? undefined,
            src: v.source === "github" ? `${base}${v.url}` : v.url, poster: v.poster ?? undefined,
            publishingUntil: v.source === "github" && v.createdAt ? new Date(v.createdAt + "Z").getTime() + 4 * 60_000 : undefined,
          })))
        .catch(() => []);
      // a GitHub upload is hidden from visitors until the site has rebuilt (about 2 minutes); admin sees it straight away
      const adminNow = !!store.get("kws_admin");
      const list = [...uploaded.filter((v) => adminNow || !v.publishingUntil || Date.now() > v.publishingUntil), ...staticList];
      setVideos(list);
      // shared link: /feed?v=key opens that video
      const want = new URLSearchParams(window.location.search).get("v");
      const idx = want ? list.findIndex((v) => v.key === want) : -1;
      if (idx > 0) window.setTimeout(() => scroller.current?.scrollTo({ top: idx * scroller.current.clientHeight }), 60);
    };
    loadAll();
    fetch(statsApi(`?clientId=${encodeURIComponent(clientId)}`))
      .then((r) => r.json())
      .then((d) => { setStats(d.stats ?? {}); setLiked(new Set(d.liked ?? [])); })
      .catch(() => {});
  }, []);

  // Admin sign-in: open the page once with ?admin=1
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("admin")) return;
    const key = window.prompt("Admin key");
    if (!key) return;
    fetch(api("/admin-check"), { method: "POST", headers: { "x-admin-key": key } })
      .then((r) => r.json())
      .then((d) => {
        if (d.admin) { store.set("kws_admin", key); setAdminKey(key); }
        else window.alert("Wrong admin key");
      })
      .catch(() => window.alert("Could not reach the server"));
  }, []);

  // Play the video that is on screen, pause the rest
  useEffect(() => {
    const root = scroller.current;
    if (!root || !videos?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const i = Number((e.target as HTMLElement).dataset.i);
          const v = els.current[i];
          if (!v) return;
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActive(i);
            v.muted = mutedRef.current;
            v.play().catch(() => {
              // Browser blocked playing with sound: play silently and offer a "Tap for sound" button
              if (!mutedRef.current) { v.muted = true; setBlocked(true); }
              v.play().catch(() => {});
            });
          } else {
            v.pause();
            if (e.intersectionRatio === 0) v.currentTime = 0;
          }
        });
      },
      { root, threshold: [0, 0.6, 1] },
    );
    root.querySelectorAll("[data-i]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [videos]);

  useEffect(() => {
    els.current.forEach((v) => { if (v) v.muted = muted; });
    store.set("kws_feed_muted", muted ? "1" : "");
    if (muted) setBlocked(false);
  }, [muted]);

  // The first tap or key press lets the browser play sound: turn it on for the video on screen
  useEffect(() => {
    if (!blocked) return;
    const unlock = () => {
      unlockedAt.current = Date.now();
      setBlocked(false);
      const v = els.current[activeRef.current];
      if (!v) return;
      v.muted = false;
      v.play().catch(() => { v.muted = true; setBlocked(true); v.play().catch(() => {}); });
    };
    window.addEventListener("click", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => { window.removeEventListener("click", unlock, true); window.removeEventListener("keydown", unlock, true); };
  }, [blocked]);

  const toggleAuto = () => {
    const next = !auto;
    setAuto(next);
    store.set("kws_feed_auto", next ? "" : "0");
    say(next ? "Auto-scroll on" : "Auto-scroll off");
  };
  // When a video finishes, glide to the next one (back to the first after the last)
  const goNext = (i: number) => {
    const s = scroller.current;
    const n = videos?.length ?? 0;
    if (!s || n < 2) return;
    if (i + 1 < n) s.scrollTo({ top: (i + 1) * s.clientHeight, behavior: "smooth" });
    else s.scrollTo({ top: 0, behavior: "auto" });
  };

  // Keyboard: arrow keys / space like on desktop reels
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openId || (e.target as HTMLElement)?.tagName === "INPUT") return;
      const s = scroller.current;
      if (!s) return;
      if (e.key === "ArrowDown") { e.preventDefault(); s.scrollBy({ top: s.clientHeight, behavior: "smooth" }); }
      if (e.key === "ArrowUp") { e.preventDefault(); s.scrollBy({ top: -s.clientHeight, behavior: "smooth" }); }
      if (e.key === " ") { e.preventDefault(); togglePlay(activeRef.current); }
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
      if (e.key.toLowerCase() === "l") likeVideo(activeRef.current, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const activeRef = useRef(0);
  activeRef.current = active;

  // A view counts after 3 seconds of watching (once per visit)
  useEffect(() => {
    const v = videos?.[active];
    if (!v || viewed.current.has(v.key)) return;
    const id = window.setTimeout(() => {
      viewed.current.add(v.key);
      bump(v.key, "views", 1);
      fetch(statsApi(`/${encodeURIComponent(v.key)}/view`), { method: "POST" }).catch(() => {});
    }, 3000);
    return () => window.clearTimeout(id);
  }, [active, videos, bump]);

  const togglePlay = (i: number) => {
    const v = els.current[i];
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
    setFlash({ slide: i, paused: v.paused, n: Date.now() });
    window.setTimeout(() => setFlash((f) => (f && Date.now() - f.n >= 600 ? null : f)), 650);
  };

  const likeVideo = (i: number, only = false) => {
    const v = videos?.[i];
    if (!v) return;
    const isLiked = likedRef.current.has(v.key);
    if (only && isLiked) return;
    const next = !isLiked;
    setLiked((s) => { const n = new Set(s); next ? n.add(v.key) : n.delete(v.key); return n; });
    bump(v.key, "likes", next ? 1 : -1);
    fetch(statsApi(`/${encodeURIComponent(v.key)}/like`), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId, liked: next }),
    }).catch(() => {});
  };

  const burst = (slide: number, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((h) => [...h, { id, x, y, slide }]);
    window.setTimeout(() => setHearts((h) => h.filter((p) => p.id !== id)), 900);
  };

  // single tap = pause/play, double tap = like (with heart burst)
  const onTap = (e: React.MouseEvent, i: number) => {
    const now = Date.now();
    if (now - unlockedAt.current < 500) return; // this tap only turned the sound on
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (lastTap.current.i === i && now - lastTap.current.t < 300) {
      window.clearTimeout(tapTimer.current);
      lastTap.current = { t: 0, i: -1 };
      burst(i, e.clientX - r.left, e.clientY - r.top);
      likeVideo(i, true);
      return;
    }
    lastTap.current = { t: now, i };
    tapTimer.current = window.setTimeout(() => togglePlay(i), 300);
  };

  const share = async (v: FeedVideo) => {
    const url = `${window.location.origin}${base}feed?v=${encodeURIComponent(v.key)}`.replace(/([^:])\/\//g, "$1/");
    const data = { title: v.title, text: `${v.title} | SAB Borehole Drilling`, url };
    let done = false;
    if (navigator.share) {
      try { await navigator.share(data); done = true; } catch (e) { if ((e as Error)?.name === "AbortError") return; }
    }
    if (!done) {
      try { await navigator.clipboard.writeText(url); say("Link copied"); done = true; }
      catch { window.prompt("Copy this link", url); done = true; }
    }
    bump(v.key, "shares", 1);
    fetch(statsApi(`/${encodeURIComponent(v.key)}/share`), { method: "POST" }).catch(() => {});
  };

  const removeVideo = async (v: FeedVideo) => {
    if (!v.dbId || !window.confirm(`Delete "${v.title}" from the page?`)) return;
    const r = await fetch(`${API}/api/feed-videos/${v.dbId}`, { method: "DELETE", headers: { "x-admin-key": adminKey } });
    if (r.status === 403) { store.set("kws_admin", ""); setAdminKey(""); window.alert("Admin key no longer valid"); return; }
    if (r.ok) setVideos((l) => (l ?? []).filter((x) => x.key !== v.key));
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
    const v = els.current[i];
    if (!v || !v.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
  };

  return (
    <div className="relative bg-black">
      <div
        ref={scroller}
        className="h-[calc(100dvh-4rem)] overflow-y-scroll snap-y snap-mandatory overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos === null && <div className="grid h-full place-items-center text-sm text-white/70">Loading…</div>}
        {videos?.length === 0 && (
          <div className="grid h-full place-items-center px-6 text-center text-white">
            <div><Play className="mx-auto mb-2 h-8 w-8" /><p className="font-bold">Successful boreholes are on the way</p><p className="text-sm text-white/70">Check back soon.</p></div>
          </div>
        )}
        {videos?.map((v, i) => {
          const s = stat(v.key);
          const isLiked = liked.has(v.key);
          return (
            <section key={v.key} data-i={i} className="relative flex h-full snap-start snap-always justify-center bg-black">
              <div className="relative h-full w-full select-none md:max-w-[440px]">
                <video
                  ref={(el) => { els.current[i] = el; }}
                  src={v.src}
                  poster={v.poster}
                  loop={!auto}
                  muted={muted}
                  playsInline
                  disablePictureInPicture
                  preload={i >= active - 1 && i <= active + 3 ? "auto" : "metadata"}
                  onClick={(e) => onTap(e, i)}
                  onEnded={() => { if (autoRef.current && i === activeRef.current) goNext(i); }}
                  onTimeUpdate={(e) => {
                    const b = bars.current[i]; const d = e.currentTarget.duration;
                    if (b && d) b.style.width = `${(e.currentTarget.currentTime / d) * 100}%`;
                  }}
                  className="h-full w-full cursor-pointer object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent" />

                {/* play / pause flash */}
                {flash?.slide === i && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span key={flash.n} className="grid h-16 w-16 animate-ping place-items-center rounded-full bg-black/40 text-white [animation-iteration-count:1] [animation-duration:.6s]">
                      {flash.paused ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
                    </span>
                  </div>
                )}

                {/* double-tap hearts */}
                {hearts.filter((h) => h.slide === i).map((h) => (
                  <Heart key={h.id} className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-bounce fill-red-500 text-red-500 drop-shadow-lg [animation-iteration-count:1] [animation-duration:.8s]"
                    style={{ left: h.x, top: h.y }} />
                ))}

                <div className="pointer-events-none absolute bottom-6 left-4 right-20 text-white">
                  <h2 className="text-base font-bold leading-tight drop-shadow">{v.title}</h2>
                  {v.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/80"><MapPin className="h-3 w-3" /> {v.location}</p>
                  )}
                  <p className="mt-1 flex items-center gap-2 text-[11px] text-white/60">
                    SAB Borehole Drilling
                    <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {fmt(s.views)}</span>
                  </p>
                </div>

                <div className="absolute bottom-8 right-3 flex flex-col items-center gap-3.5 text-white">
                  <button onClick={() => likeVideo(i)} className="flex flex-col items-center gap-0.5" aria-label={isLiked ? "Unlike" : "Like"}>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur">
                      <Heart className={`h-6 w-6 transition-transform ${isLiked ? "scale-110 fill-red-500 text-red-500" : ""}`} />
                    </span>
                    <span className="text-[11px] font-semibold">{fmt(s.likes)}</span>
                  </button>
                  <button onClick={() => setOpenId(v.key)} className="flex flex-col items-center gap-0.5" aria-label="Comments">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"><MessageCircle className="h-5 w-5" /></span>
                    <span className="text-[11px] font-semibold">{fmt(s.comments)}</span>
                  </button>
                  <button onClick={() => share(v)} className="flex flex-col items-center gap-0.5" aria-label="Share">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Share2 className="h-5 w-5" /></span>
                    <span className="text-[11px] font-semibold">{s.shares ? fmt(s.shares) : "Share"}</span>
                  </button>
                  <a
                    href={whatsappLink(`Hello, I saw "${v.title}" on your Successful Boreholes page and would like a quote for something similar.`)}
                    target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5" aria-label="Get a quote"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-green-600"><Send className="h-5 w-5" /></span>
                    <span className="text-[11px] font-semibold">Quote</span>
                  </a>
                  <button onClick={() => { if (Date.now() - unlockedAt.current < 500) return; setMuted((m) => !m); }} className="flex flex-col items-center gap-0.5" aria-label={muted || blocked ? "Unmute" : "Mute"}>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur">
                      {muted || blocked ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </span>
                    <span className="text-[11px] font-semibold">{muted || blocked ? "Sound" : "Mute"}</span>
                  </button>
                  <button onClick={toggleAuto} aria-pressed={auto} aria-label={auto ? "Turn auto-scroll off" : "Turn auto-scroll on"} className="flex flex-col items-center gap-0.5">
                    <span className={`grid h-11 w-11 place-items-center rounded-full backdrop-blur ${auto ? "bg-primary" : "bg-white/15"}`}>
                      <ChevronsDown className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-semibold">{auto ? "Auto on" : "Auto off"}</span>
                  </button>
                </div>

                {/* progress bar (tap to seek) */}
                <div className="absolute inset-x-0 bottom-0 h-3 cursor-pointer" onClick={(e) => seek(e, i)}>
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
                    <div ref={(el) => { bars.current[i] = el; }} className="h-full bg-white" style={{ width: 0 }} />
                  </div>
                </div>

                {adminKey && v.dbId && (
                  <button onClick={() => removeVideo(v)} aria-label="Delete video"
                    className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
                    <Trash2 className="h-3 w-3" /> Delete video
                  </button>
                )}
                {i === 0 && (
                  <div className="pointer-events-none absolute left-0 right-0 top-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/70">
                    Successful Boreholes · swipe up · double-tap to like
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {blocked && !muted && (
        <button className="absolute left-1/2 top-14 z-30 flex -translate-x-1/2 animate-pulse items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-xl">
          <Volume2 className="h-4 w-4" /> Tap for sound
        </button>
      )}

      {toast && <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-lg">{toast}</div>}

      {adminKey && (
        <button
          onClick={() => { store.set("kws_admin", ""); setAdminKey(""); }}
          className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-900"
        >
          <ShieldCheck className="h-3 w-3" /> Admin · log out
        </button>
      )}

      {adminKey && (
        <button onClick={() => setUploading(true)} aria-label="Upload video"
          className="absolute bottom-24 left-3 z-20 flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-900 shadow-lg md:left-[calc(50%-210px)]">
          <Plus className="h-4 w-4" /> Upload video
        </button>
      )}

      {uploading && (
        <UploadSheet
          adminKey={adminKey}
          onClose={() => setUploading(false)}
          onBadAdmin={() => { store.set("kws_admin", ""); setAdminKey(""); setUploading(false); }}
          onDone={(v) => { setVideos((l) => [v, ...(l ?? [])]); setUploading(false); scroller.current?.scrollTo({ top: 0 }); }}
        />
      )}

      {openId && (
        <CommentSheet
          videoId={openId}
          title={videos?.find((v) => v.key === openId)?.title ?? ""}
          adminKey={adminKey}
          onClose={() => setOpenId(null)}
          onCount={(d) => bump(openId, "comments", d)}
          onBadAdmin={() => { store.set("kws_admin", ""); setAdminKey(""); }}
        />
      )}
    </div>
  );
}

function CommentSheet({ videoId, title, adminKey, onClose, onCount, onBadAdmin }: {
  videoId: string; title: string; adminKey: string; onClose: () => void; onCount: (d: number) => void; onBadAdmin: () => void;
}) {
  const [list, setList] = useState<Comment[] | null>(null);
  const [name, setName] = useState(() => store.get("kws_name"));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(api(`/${encodeURIComponent(videoId)}`)).then((r) => r.json()).then((d) => setList(Array.isArray(d) ? d : [])).catch(() => setList([]));
  }, [videoId]);

  const post = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(api(`/${encodeURIComponent(videoId)}`), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, body: text }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not post");
      store.set("kws_name", name.trim());
      setList((l) => [d, ...(l ?? [])]); onCount(1); setText("");
    } catch (x) { setErr(x instanceof Error ? x.message : "Could not post"); }
    setBusy(false);
  };

  const del = async (id: number) => {
    if (!window.confirm("Delete this comment?")) return;
    const r = await fetch(api(`/${id}`), { method: "DELETE", headers: { "x-admin-key": adminKey } });
    if (r.status === 403) { onBadAdmin(); window.alert("Admin key no longer valid"); return; }
    if (r.ok) { setList((l) => (l ?? []).filter((c) => c.id !== id)); onCount(-1); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div className="flex max-h-[78dvh] w-full flex-col rounded-t-2xl bg-card shadow-2xl md:max-w-md md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h3 className="font-bold text-foreground">Comments {list ? `(${list.length})` : ""}</h3>
            <p className="truncate text-xs text-muted-foreground">{title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {list === null && <p className="text-sm text-muted-foreground">Loading…</p>}
          {list?.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No comments yet. Be the first.</p>}
          {list?.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{c.name.charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{c.name} <span className="font-normal text-muted-foreground">· {ago(c.createdAt)}</span></p>
                <p className="break-words text-sm text-foreground/90">{c.body}</p>
              </div>
              {adminKey && (
                <button onClick={() => del(c.id)} aria-label="Delete comment" className="rounded-full p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={post} className="space-y-2 border-t border-border p-3">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Your name (optional)"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button disabled={busy || !text.trim()} className="rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">Post</button>
          </div>
          {err && <p className="text-xs text-red-600">{err}</p>}
          <p className="text-[11px] text-muted-foreground">Be respectful. Offensive comments are removed.</p>
        </form>
      </div>
    </div>
  );
}


const CHUNK = 20 * 1024 * 1024; // 20 MB pieces, so even large originals upload reliably

export function UploadSheet({ adminKey, onClose, onBadAdmin, onDone }: {
  adminKey: string; onClose: () => void; onBadAdmin: () => void; onDone: (v: FeedVideo) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [county, setCounty] = useState("");
  const [town, setTown] = useState("");
  const [pct, setPct] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const title = `Successful Borehole in ${[county.trim(), town.trim()].filter(Boolean).join(", ") || "Kenya"}`;

  const sendChunk = (url: string, form: FormData, uid: string, start: number, end: number, total: number, onProg: (loaded: number) => void) =>
    new Promise<{ secure_url?: string; public_id?: string; error?: { message: string } }>((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open("POST", url);
      x.setRequestHeader("X-Unique-Upload-Id", uid);
      x.setRequestHeader("Content-Range", `bytes ${start}-${end - 1}/${total}`);
      x.upload.onprogress = (e) => onProg(e.loaded);
      x.onload = () => { try { const d = JSON.parse(x.responseText); x.status < 300 ? resolve(d) : reject(new Error(d.error?.message ?? "Upload failed")); } catch { reject(new Error("Upload failed")); } };
      x.onerror = () => reject(new Error("Network error during upload"));
      x.send(form);
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true); setErr(""); setPct(0);
    try {
      const sr = await fetch(`${API}/api/feed-videos/sign`, { method: "POST", headers: { "x-admin-key": adminKey } });
      if (sr.status === 403) { onBadAdmin(); window.alert("Admin key no longer valid"); return; }
      const s = await sr.json();
      if (!sr.ok) throw new Error(s.error ?? "Could not start upload");
      if (s.mode === "github") {
        if (!/\.(mp4|webm)$/i.test(file.name)) throw new Error("Please choose an .mp4 or .webm video");
        if (file.size > s.maxMB * 1048576) throw new Error(`Video is too big (max ${s.maxMB} MB). Compress it or split it.`);
        const q = new URLSearchParams({ name: file.name, title, location: [county.trim(), town.trim()].filter(Boolean).join(", ") });
        const d = await new Promise<{ id: number; url: string; title: string; location?: string; createdAt?: string; error?: string }>((resolve, reject) => {
          const x = new XMLHttpRequest();
          x.open("POST", `${API}/api/feed-videos/upload?${q}`);
          x.setRequestHeader("x-admin-key", adminKey);
          x.setRequestHeader("Content-Type", file.type || "video/mp4");
          x.upload.onprogress = (ev) => setPct(Math.round((ev.loaded / ev.total) * 100));
          x.onload = () => { try { const j = JSON.parse(x.responseText); x.status < 300 ? resolve(j) : reject(new Error(j.error ?? "Upload failed")); } catch { reject(new Error("Upload failed")); } };
          x.onerror = () => reject(new Error("Network error during upload"));
          x.send(file);
        });
        window.alert("Saved to GitHub. It shows for visitors in about 2 minutes, after the site rebuilds.");
        onDone({ key: `db-${d.id}`, dbId: d.id, src: `${base}${d.url}`, title: d.title, location: d.location ?? undefined });
        return;
      }
      const url = `https://api.cloudinary.com/v1_1/${s.cloudName}/video/upload`;
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let last: Awaited<ReturnType<typeof sendChunk>> = {};
      for (let start = 0; start < file.size || start === 0; start += CHUNK) {
        const end = Math.min(start + CHUNK, file.size);
        const form = new FormData();
        form.append("file", file.slice(start, end), file.name);
        form.append("api_key", s.apiKey);
        form.append("timestamp", String(s.timestamp));
        form.append("signature", s.signature);
        form.append("folder", s.folder);
        last = await sendChunk(url, form, uid, start, end, file.size, (l) => setPct(Math.round(((start + l) / file.size) * 100)));
        if (end >= file.size) break;
      }
      if (!last.secure_url || !last.public_id) throw new Error("Upload did not finish");
      // Original file is served untouched. Only non-MP4 phone formats (e.g. .MOV) are converted to H.264 so browsers can play them.
      const isMp4 = /\.mp4$/i.test(file.name);
      const root = last.secure_url.replace(/\/upload\/.*$/, "/upload/");
      const play = isMp4 ? last.secure_url : `${root}f_mp4,vc_h264/${last.public_id}.mp4`;
      const poster = `${root}so_1,w_720,f_jpg/${last.public_id}.jpg`;
      const loc = [county.trim(), town.trim()].filter(Boolean).join(", ");
      const r = await fetch(`${API}/api/feed-videos`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ publicId: last.public_id, url: play, poster, title, location: loc }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Could not save video");
      onDone({ key: `db-${d.id}`, dbId: d.id, src: d.url, poster: d.poster ?? undefined, title: d.title, location: d.location ?? undefined });
    } catch (x) { setErr(x instanceof Error ? x.message : "Upload failed"); }
    setBusy(false);
  };

  const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={() => !busy && onClose()}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full space-y-3 rounded-t-2xl bg-card p-4 shadow-2xl md:max-w-md md:rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-foreground"><UploadCloud className="h-5 w-5 text-primary" /> Post a new video</h3>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <label className="block rounded-lg border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          <input type="file" accept="video/*" className="sr-only" disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {file ? <span className="font-semibold text-foreground">{file.name} · {(file.size / 1048576).toFixed(1)} MB</span> : "Tap to choose a video (.mp4 recommended, original quality is kept)"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input className={input} placeholder="County e.g. Kajiado" value={county} onChange={(e) => setCounty(e.target.value)} maxLength={40} disabled={busy} />
          <input className={input} placeholder="Town e.g. Isinya" value={town} onChange={(e) => setTown(e.target.value)} maxLength={40} disabled={busy} />
        </div>
        <p className="text-xs text-muted-foreground">Title: <span className="font-semibold text-foreground">{title}</span></p>
        {busy && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
            <p className="mt-1 text-xs text-muted-foreground">Uploading {pct}%. Keep this page open.</p>
          </div>
        )}
        {err && <p className="text-xs text-red-600">{err}</p>}
        <button disabled={!file || busy} className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Uploading…" : "Post video"}</button>
      </form>
    </div>
  );
}
