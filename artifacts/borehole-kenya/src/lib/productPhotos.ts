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
};

export function productImages(name: string, imageUrl?: string | null): string[] {
  const extra = PRODUCT_GALLERY[name];
  if (extra?.length) return extra;
  return imageUrl ? [imageUrl] : [];
}
