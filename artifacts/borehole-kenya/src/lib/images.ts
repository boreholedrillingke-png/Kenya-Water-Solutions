const base = import.meta.env.BASE_URL;

export const IMAGES = {
  rig: `${base}images/hero-bg.webp`,
  water: `${base}images/service-drilling.webp`,
  solar: `${base}images/service-solar.webp`,
};

/** Pick a fitting photo for a service, product or project by its name / type. */
export function pickImage(...texts: (string | undefined | null)[]): string {
  const t = texts.filter(Boolean).join(" ").toLowerCase();
  if (/solar/.test(t)) return IMAGES.solar;
  if (/test|purif|treat|filter|water supply/.test(t)) return IMAGES.water;
  if (/pump|install/.test(t)) return IMAGES.solar;
  return IMAGES.rig;
}
