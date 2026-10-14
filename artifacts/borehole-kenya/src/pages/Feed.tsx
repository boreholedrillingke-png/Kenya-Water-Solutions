import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, MapPin, Volume2, VolumeX, X, Send, Trash2, Play, ShieldCheck } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

interface FeedVideo {
  file: string; // video file inside /public/videos
  title: string;
  location?: string;
  poster?: string;
}
interface Comment { id: number; name: string; body: string; createdAt: string }

const base = import.meta.env.BASE_URL;
const API = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/$/, "");
const api = (path: string) => `${API}/api/video-comments${path}`;

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } },
  set: (k: string, v: string) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* ignore */ } },
};

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
  const [muted, setMuted] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState(() => store.get("kws_admin"));
  const scroller = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLVideoElement | null)[]>([]);
  const mutedRef = useRef(true);
  mutedRef.current = muted;

  useEffect(() => {
    fetch(`${base}videos/feed.json`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setVideos(Array.isArray(d) ? d.filter((v: FeedVideo) => v.file) : []))
      .catch(() => setVideos([]));
    fetch(api("/counts")).then((r) => r.json()).then(setCounts).catch(() => {});
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
            v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
          } else {
            v.pause();
          }
        });
      },
      { root, threshold: [0, 0.6, 1] },
    );
    root.querySelectorAll("[data-i]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [videos]);

  useEffect(() => { els.current.forEach((v) => { if (v) v.muted = muted; }); }, [muted]);

  const toggleTap = (i: number) => {
    const v = els.current[i];
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  const bump = useCallback((id: string, d: number) => setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) })), []);

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
        {videos?.map((v, i) => (
          <section key={v.file} data-i={i} className="relative flex h-full snap-start snap-always justify-center bg-black">
            <div className="relative h-full w-full md:max-w-[440px]">
              <video
                ref={(el) => { els.current[i] = el; }}
                src={`${base}videos/${v.file}`}
                poster={v.poster ? `${base}videos/${v.poster}` : undefined}
                loop
                muted
                playsInline
                preload={Math.abs(i - active) <= 1 ? "auto" : "metadata"}
                onClick={() => toggleTap(i)}
                className="h-full w-full cursor-pointer object-cover"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="pointer-events-none absolute bottom-5 left-4 right-20 text-white">
                <h2 className="text-base font-bold leading-tight drop-shadow">{v.title}</h2>
                {v.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/80"><MapPin className="h-3 w-3" /> {v.location}</p>
                )}
                <p className="mt-1 text-[11px] text-white/60">Kenya Water Solutions</p>
              </div>

              <div className="absolute bottom-6 right-3 flex flex-col items-center gap-4 text-white">
                <button onClick={() => setOpenId(v.file)} className="flex flex-col items-center gap-0.5" aria-label="Comments">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"><MessageCircle className="h-5 w-5" /></span>
                  <span className="text-[11px] font-semibold">{counts[v.file] ?? 0}</span>
                </button>
                <a
                  href={whatsappLink(`Hello, I saw "${v.title}" on your Successful Boreholes page and would like a quote for something similar.`)}
                  target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5" aria-label="Get a quote"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-green-600"><Send className="h-5 w-5" /></span>
                  <span className="text-[11px] font-semibold">Quote</span>
                </a>
                <button onClick={() => setMuted((m) => !m)} className="flex flex-col items-center gap-0.5" aria-label={muted ? "Unmute" : "Mute"}>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur">
                    {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </span>
                  <span className="text-[11px] font-semibold">{muted ? "Sound" : "Mute"}</span>
                </button>
              </div>
              {i === 0 && (
                <div className="pointer-events-none absolute left-0 right-0 top-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  Successful Boreholes · swipe up
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {adminKey && (
        <button
          onClick={() => { store.set("kws_admin", ""); setAdminKey(""); }}
          className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-900"
        >
          <ShieldCheck className="h-3 w-3" /> Admin · log out
        </button>
      )}

      {openId && (
        <CommentSheet
          videoId={openId}
          title={videos?.find((v) => v.file === openId)?.title ?? ""}
          adminKey={adminKey}
          onClose={() => setOpenId(null)}
          onCount={(d) => bump(openId, d)}
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
