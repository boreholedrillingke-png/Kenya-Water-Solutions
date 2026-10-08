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

/** Photos that are nearly square (or portrait) and should never be cropped into a wide strip. */
const SHOW_WHOLE = [IMAGES.survey];
export const showsWhole = (src: string) => SHOW_WHOLE.includes(src);

const NAVY = "hsl(215 70% 10%)";
const NAVY_BASE = "linear-gradient(135deg, hsl(215 70% 12%) 0%, hsl(212 75% 22%) 100%)";

/** Wide header background. Whole-photo images sit on the right and melt into the blue; others fill the width. */
export function bannerBackground(src: string): string {
  if (showsWhole(src)) {
    return `linear-gradient(90deg, ${NAVY} 0%, hsl(214 72% 16%) 55%, hsl(212 75% 22%) 100%)`;
  }
  return `linear-gradient(90deg, hsl(215 70% 10% / .94) 0%, hsl(214 72% 16% / .86) 50%, hsl(212 75% 22% / .70) 100%), url(${src}) center 55% / cover`;
}

/** Card header background with a dark fade at the bottom for the title. */
export function cardBackground(src: string): string {
  const fade = "linear-gradient(180deg, hsl(215 70% 8% / .1) 0%, hsl(215 70% 8% / .88) 100%)";
  if (showsWhole(src)) {
    return `${fade}, url(${src}) right center / auto 100% no-repeat, ${NAVY_BASE}`;
  }
  return `${fade}, url(${src}) center / cover`;
}
