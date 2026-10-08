const base = import.meta.env.BASE_URL;

export const IMAGES = {
  // atmosphere / wide
  rig: `${base}images/hero-bg.webp`,
  water: `${base}images/service-drilling.webp`,
  // services
  drilling: `${base}images/drilling-rig.webp`,
  survey: `${base}images/survey.webp`,
  testPumping: `${base}images/test-pumping.webp`,
  pumpInstall: `${base}images/pump-install.webp`,
  purification: `${base}images/purification.webp`,
  // solar and treatment
  solarPump: `${base}images/solar-pump.webp`,
  solarTower: `${base}images/solar-tower.webp`,
  solarDiagram: `${base}images/solar-diagram.webp`,
  treatment: `${base}images/treatment-garden.webp`,
};

/** Pick the right photo for a service / project by its name or type. Pass only short labels (name, type), not long descriptions. */
export function pickImage(...texts: (string | undefined | null)[]): string {
  const t = texts.filter(Boolean).join(" ").toLowerCase();
  if (/survey|hydro|geolog|geophys/.test(t)) return IMAGES.survey;
  if (/test.?pump|pump.?test/.test(t)) return IMAGES.testPumping;
  if (/purif|treat|filter/.test(t)) return IMAGES.purification;
  if (/solar/.test(t)) return IMAGES.solarTower;
  if (/pump|install/.test(t)) return IMAGES.pumpInstall;
  if (/tank|storage|supply/.test(t)) return IMAGES.treatment;
  return IMAGES.drilling;
}

/** Where to focus when a photo is cropped, so the important part stays in view. */
const POSITIONS: Record<string, string> = {
  [IMAGES.drilling]: "center 80%", // branded truck and driller
  [IMAGES.survey]: "center 55%",
  [IMAGES.testPumping]: "center 35%",
  [IMAGES.pumpInstall]: "center 40%", // hands on the pump
  [IMAGES.purification]: "center 50%",
  [IMAGES.solarPump]: "65% 50%",
  [IMAGES.solarTower]: "center 55%",
  [IMAGES.solarDiagram]: "center 50%",
  [IMAGES.treatment]: "55% 50%",
  [IMAGES.water]: "center 40%",
};

export function imagePosition(src: string): string {
  return POSITIONS[src] ?? "center 55%";
}

/** Wide header background: the photo fills the width under a blue wash. */
export function bannerBackground(src: string, position?: string): string {
  return `linear-gradient(90deg, hsl(215 70% 10% / .94) 0%, hsl(214 72% 16% / .86) 50%, hsl(212 75% 22% / .70) 100%), url(${src}) ${position ?? imagePosition(src)} / cover`;
}

/** Header used when a project has no photo yet. */
export const PLAIN_BANNER = "linear-gradient(135deg, hsl(215 70% 10%) 0%, hsl(214 72% 16%) 50%, hsl(212 75% 24%) 100%)";
