const base = import.meta.env.BASE_URL;

export const IMAGES = {
  rig: `${base}images/hero-bg.webp`,
  water: `${base}images/service-drilling.webp`,
  solar: `${base}images/service-solar.webp`,
  survey: `${base}images/survey.webp`,
  testPumping: `${base}images/test-pumping.webp`,
};

/** Pick a fitting photo for a service, product or project by its name / type. */
export function pickImage(...texts: (string | undefined | null)[]): string {
  const t = texts.filter(Boolean).join(" ").toLowerCase();
  if (/survey|hydro|geolog|geophys/.test(t)) return IMAGES.survey;
  if (/test.?pump|pump.?test/.test(t)) return IMAGES.testPumping;
  if (/solar/.test(t)) return IMAGES.solar;
  if (/test|purif|treat|filter|water supply/.test(t)) return IMAGES.water;
  if (/pump|install/.test(t)) return IMAGES.solar;
  return IMAGES.rig;
}

/** Where to focus when a photo is cropped into a wide strip. */
export function imagePosition(src: string): string {
  if (src === IMAGES.survey) return "center 62%";
  if (src === IMAGES.testPumping) return "center 35%";
  if (src === IMAGES.water) return "center 40%";
  return "center 55%";
}

/** Wide header background: the photo fills the width under a blue wash. */
export function bannerBackground(src: string): string {
  return `linear-gradient(90deg, hsl(215 70% 10% / .94) 0%, hsl(214 72% 16% / .86) 50%, hsl(212 75% 22% / .70) 100%), url(${src}) ${imagePosition(src)} / cover`;
}
