// Extra photos per product (matched by product name). First image is the main one.
// Add more products here: "Product name": ["/images/products/a.webp", ...]
export const PRODUCT_GALLERY: Record<string, string[]> = {
  "Grundfos SP 5A Submersible Pump": [
    "/images/products/sp5a-2.webp",
    "/images/products/sp5a-1.webp",
    "/images/products/sp5a-3.webp",
  ],
  "Grundfos SP 11A Submersible Pump": [
    "/images/products/sp11a-1.webp",
    "/images/products/sp11a-2.webp",
    "/images/products/sp11a-3.webp",
  ],
  "Solar Pump Controller 3kW": [
    "/images/products/spc3-1.webp",
    "/images/products/spc3-2.webp",
    "/images/products/spc3-3.webp",
    "/images/products/spc3-4.webp",
    "/images/products/spc3-5.webp",
    "/images/products/spc3-6.webp",
  ],
  "Lorentz PS2 Solar Pump System": [
    "/images/products/lps2-1.webp",
    "/images/products/lps2-2.webp",
    "/images/products/lps2-3.webp",
    "/images/products/lps2-4.webp",
    "/images/products/lps2-5.webp",
    "/images/products/lps2-6.webp",
    "/images/products/lps2-7.webp",
  ],
};

export function productImages(name: string, imageUrl?: string | null): string[] {
  const extra = PRODUCT_GALLERY[name];
  if (extra?.length) return extra;
  return imageUrl ? [imageUrl] : [];
}
