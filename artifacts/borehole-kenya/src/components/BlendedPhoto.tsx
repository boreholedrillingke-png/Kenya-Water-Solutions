import type { CSSProperties } from "react";
import { imagePosition, showsWhole } from "@/lib/images";

interface BlendedPhotoProps {
  src: string;
  alt: string;
  /** Height classes, e.g. "h-32". Width always fills the parent. */
  className?: string;
  /** Melt the bottom of the photo into the card colour (no visible edge). Default true. */
  fadeBottom?: boolean;
}

const sideFade = "linear-gradient(to right, transparent 0%, #000 24%, #000 76%, transparent 100%)";
const sideFadeStyle: CSSProperties = {
  WebkitMaskImage: sideFade,
  maskImage: sideFade,
};

/**
 * Shows a photo without harsh cropping or visible frames.
 * - Wide photos fill the box.
 * - Square/portrait photos are shown whole: their sides dissolve into a blurred copy of the
 *   same photo, so there is no border, no empty gap, and nothing is cut off.
 * - The bottom melts into the card colour so the photo flows into the text below.
 */
export default function BlendedPhoto({ src, alt, className = "h-32", fadeBottom = true }: BlendedPhotoProps) {
  const whole = showsWhole(src);

  return (
    <div className={`relative w-full overflow-hidden bg-slate-800 ${className}`}>
      {whole ? (
        <>
          <img
            src={src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-125"
          />
          <img src={src} alt={alt} loading="lazy" className="relative mx-auto h-full object-contain" style={sideFadeStyle} />
        </>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: imagePosition(src) }}
        />
      )}
      {fadeBottom && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card via-card/60 to-transparent" />
      )}
    </div>
  );
}
