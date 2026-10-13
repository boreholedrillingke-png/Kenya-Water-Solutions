import { useEffect, useRef, useState } from "react";
import { MessageCircle, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageBanner from "@/components/PageBanner";
import { IMAGES, pageBackdrop } from "@/lib/images";
import { whatsappLink } from "@/lib/utils";

interface FeedVideo {
  file?: string; // video file name inside /public/videos, e.g. "rig-kisumu.mp4"
  image?: string; // or a photo file name inside /public/videos
  title: string;
  category?: string; // Drilling, Surveys, Test Pumping, Pump Installation, Purification, Inspection ...
  location?: string;
  poster?: string; // optional image file in /public/videos
}

const base = import.meta.env.BASE_URL;

export default function Feed() {
  const [videos, setVideos] = useState<FeedVideo[] | null>(null);
  const [cat, setCat] = useState("All");
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetch(`${base}videos/feed.json`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setVideos(Array.isArray(d) ? d : []))
      .catch(() => setVideos([]));
  }, []);

  // only one video plays at a time
  const onPlay = (i: number) =>
    refs.current.forEach((v, j) => {
      if (v && j !== i) v.pause();
    });

  const cats = ["All", ...Array.from(new Set((videos ?? []).map((v) => v.category).filter(Boolean) as string[]))];
  const shown = (videos ?? []).filter((v) => cat === "All" || v.category === cat);

  return (
    <div>
      <PageBanner
        image={IMAGES.drilling}
        eyebrow="Feed"
        title="See our drilling in action"
        description="Real rigs, real sites. Watch how we survey, drill, test and install."
      />
      <div className="min-h-[65vh]" style={pageBackdrop(`${base}images/backdrops/rig-sunset.webp`, "center 55%")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {cats.length > 2 && (
            <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-card/95 p-3 shadow-xl">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {videos === null && <div className="rounded-2xl bg-card/95 p-8 text-center text-sm text-muted-foreground shadow-xl">Loading videos…</div>}

          {videos !== null && shown.length === 0 && (
            <div className="rounded-2xl bg-card/95 p-8 text-center shadow-xl">
              <Play className="mx-auto mb-2 h-8 w-8 text-primary" />
              <h2 className="font-bold text-foreground">Videos are on the way</h2>
              <p className="mt-1 text-sm text-muted-foreground">We are uploading fresh drilling videos. Check back soon.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((v, i) => (
              <article key={v.file ?? v.image} className="overflow-hidden rounded-2xl bg-card/95 shadow-xl">
                {v.image ? (
                  <img src={`${base}videos/${v.image}`} alt={v.title} loading="lazy" className="aspect-[9/14] w-full bg-black object-cover" />
                ) : (
                  <video
                    ref={(el) => { refs.current[i] = el; }}
                    src={`${base}videos/${v.file}`}
                    poster={v.poster ? `${base}videos/${v.poster}` : undefined}
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={() => onPlay(i)}
                    className="aspect-[9/14] w-full bg-black object-contain"
                  />
                )}
                <div className="p-4">
                  {v.category && <span className="text-[11px] font-bold uppercase tracking-wide text-primary">{v.category}</span>}
                  <h3 className="font-semibold text-foreground">{v.title}</h3>
                  {v.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {v.location}
                    </p>
                  )}
                  <Button asChild size="sm" className="mt-3 bg-green-600 text-white hover:bg-green-700">
                    <a
                      href={whatsappLink(`Hello, I saw "${v.title}" on your Feed and would like a quote for something similar.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-1.5 h-4 w-4" /> Get a quote like this
                    </a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
