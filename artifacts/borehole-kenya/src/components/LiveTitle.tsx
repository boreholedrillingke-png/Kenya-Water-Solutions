import { useEffect, useState } from "react";

/**
 * Headline with a live feel: the words rise in one by one, then a soft light keeps sweeping across them.
 * `hi` is the colour of the passing light. Motion is switched off for visitors who prefer reduced motion (see index.css).
 */
export function LiveTitle({ text, hi, className }: { text: string; hi?: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span aria-hidden="true" className="live-word" style={{ ["--i" as string]: i, ...(hi ? { ["--hi" as string]: hi } : {}) }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/** One line that swaps through phrases: the old phrase slides up and out while the next slides up into place. */
export function RotatingWords({ words, every = 2800, className }: { words: string[]; every?: number; className?: string }) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setI((cur) => { setPrev(cur); return (cur + 1) % words.length; });
    }, every);
    return () => clearInterval(t);
  }, [words.length, every]);

  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 700);
    return () => clearTimeout(t);
  }, [prev]);

  return (
    <span className={`relative block h-[1.25em] overflow-hidden whitespace-nowrap ${className ?? ""}`} aria-label={words[0]}>
      {prev !== null && <span key={`o${prev}`} aria-hidden="true" className="live-rot-out absolute left-0 top-0">{words[prev]}</span>}
      <span key={`i${i}`} aria-hidden="true" className={`${prev !== null ? "live-rot-in" : ""} absolute left-0 top-0`}>{words[i]}</span>
    </span>
  );
}
