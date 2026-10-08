import { showsWhole } from "@/lib/images";

const fade = "linear-gradient(to right, transparent 0%, #000 45%)";

/**
 * For square/portrait photos in a wide header: shows the whole photo on the right,
 * dissolving into the blue so there is no visible edge. Place inside a `relative overflow-hidden` header.
 */
export default function BannerPhoto({ src }: { src: string }) {
  if (!showsWhole(src)) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 hidden h-full w-auto max-w-[30%] object-contain object-right lg:block"
      style={{ WebkitMaskImage: fade, maskImage: fade }}
    />
  );
}
