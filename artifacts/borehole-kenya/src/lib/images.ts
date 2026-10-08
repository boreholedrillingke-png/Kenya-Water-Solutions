const base = import.meta.env.BASE_URL;

export const IMAGES = {
  rig: `${base}images/hero-bg.webp`,
  water: `${base}images/service-drilling.webp`,
  solar: `${base}images/service-solar.webp`,
  survey: `${base}images/survey.webp`,
};

/** Pick a fitting photo for a service, product or project by its name / type. */
export function pickImage(...texts: (string | undefined | null)[]): string {
  const t = texts.filter(Boolean).join(" ").toLowerCase();
  if (/survey|hydro|geolog|geophys/.test(t)) return IMAGES.survey;
  if (/solar/.test(t)) return IMAGES.solar;
  if (/test|purif|treat|filter|water supply/.test(t)) return IMAGES.water;
  if (/pump|install/.test(t)) return IMAGES.solar;
  return IMAGES.rig;
}

/** Where to focus when a photo is cropped into a wide strip. */
export function imagePosition(src: string): string {
  if (src === IMAGES.survey) return "center 58%";
  if (src === IMAGES.water) return "center 40%";
  return "center 55%";
}
