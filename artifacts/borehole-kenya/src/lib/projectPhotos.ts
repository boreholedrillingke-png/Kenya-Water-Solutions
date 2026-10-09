import { IMAGES } from "@/lib/images";

const base = import.meta.env.BASE_URL;
const p = (name: string) => `${base}images/projects/${name}.webp`;

export interface ProjectPhoto {
  src: string;
  /** CSS object-position so the important part stays in frame */
  pos: string;
}

const photo = (src: string, pos = "center 50%"): ProjectPhoto => ({ src, pos });

/**
 * One photo per project, matched by project title, and chosen to make sense for the project:
 *  - community / farm / estate drilling jobs  -> drilling rigs
 *  - hospitals, hotels, resorts, factories    -> purification, treatment plants, tanks
 *  - irrigation and livestock water           -> solar pumps, flowing water, tank towers
 * No photo is used twice.
 * To change one: drop the file in public/images/projects and edit the line below.
 */
const PHOTOS: Record<string, ProjectPhoto> = {
  // --- drilling ---
  "karura forest community borehole": photo(p("karura"), "center 82%"),
  "ruiru industrial estate water supply": photo(p("ruiru")),
  "kilifi county government water project": photo(p("kilifi"), "center 92%"),
  "malindi fishermen's cooperative borehole": photo(p("diani")), // palm trees, coastal
  "nakuru dairy farm mega borehole": photo(p("nakuru-dairy"), "center 55%"),
  "naivasha horticulture farm water system": photo(p("naivasha")),
  "kericho county school cluster": photo(p("kericho")),
  "siaya county water authority project": photo(p("siaya"), "center 0%"),
  "kitui arid lands community water": photo(p("kitui"), "center 35%"),
  "embu university college water supply": photo(p("embu"), "center 62%"),
  "garissa refugee camp emergency water": photo(IMAGES.pumpInstall, "center 40%"), // dry, sandy
  "isiolo town water supply augmentation": photo(p("isiolo"), "center 40%"),
  "nyeri county coffee cooperative": photo(p("nyeri")),
  "taita-taveta sisal estate": photo(`${base}images/drill-crew.webp`, "center 55%"),
  "nandi hills tea research station": photo(p("nandi")),
  "vihiga county health facilities water": photo(p("vihiga"), "center 38%"),
  "nyamira tea factory water supply": photo(p("garissa"), "center 55%"), // green tea hills
  "marsabit camel market water point": photo(p("marsabit")),

  // --- hospitals, resorts, hotels, factories, malls: clean water and storage ---
  "diani beach resort desalination & borehole": photo(p("ro-plant")), // reverse osmosis plant
  "mombasa airport road hotel complex": photo(IMAGES.treatment, "55% 50%"), // hotel garden, tanks and filters
  "eldoret teaching hospital borehole": photo(p("ro-clean-room"), "center 38%"),
  "meru county referral hospital": photo(p("ro-plant-industrial"), "center 55%"),
  "kisumu port industrial zone": photo(p("solar-towers-urban"), "center 62%"), // solar with large storage tanks
  "homa bay fish processing plant": photo(IMAGES.water, "center 40%"),
  "murang'a avocado packing station": photo(IMAGES.purification),
  "bungoma town shopping mall": photo(p("tank-lift"), "center 30%"),
  "samburu national reserve camp": photo(IMAGES.solarTower, "center 55%"), // dry savanna, off-grid solar

  // --- irrigation and livestock: pumps, flowing water, tank towers ---
  "ngong hills flower farm irrigation": photo(p("pump-discharge")), // savanna
  "bomet tea estate irrigation network": photo(p("tank-tower-panel"), "center 15%"), // green highlands
  "kakamega sugar cane cooperative": photo(IMAGES.solarPump, "65% 50%"), // lush lowland
  "machakos mango farm irrigation": photo(p("solar-tank-tap"), "center 25%"),
  "kirinyaga rice irrigation scheme": photo(p("solar-field-pump"), "center 45%"), // hot lowland, palms
  "trans nzoia wheat farm irrigation": photo(p("tank-tower-two"), "center 15%"),
  "turkana county livestock trough network": photo(p("water-jet-pipe"), "center 25%"), // arid
  "laikipia wildlife conservancy": photo(p("eldoret"), "center 52%"), // open grassland
};

export function projectPhoto(title: string | undefined | null): ProjectPhoto | undefined {
  if (!title) return undefined;
  return PHOTOS[title.trim().toLowerCase()];
}

/* ---------------------------------------------------------------------------
 * Page backdrop for each project's detail page (the area below the header).
 * A different photo from the header, chosen to fit the project's place and type:
 *   rig-sunset  dry savanna / semi-arid areas
 *   truck       green highland farm and estate areas
 *   survey      lush green western and tea areas
 *   solar-field green irrigated farms and solar projects
 *   water       general water supply
 *   ro-plant    hospitals, hotels, factories, packing plants
 *   purification clean-water rooms
 * Only large, sharp photos are used here so they never look blurry.
 * ------------------------------------------------------------------------- */
const BACKDROPS = {
  "rig-sunset": { src: `${base}images/backdrops/rig-sunset.webp`, pos: "center 55%" },
  truck: { src: `${base}images/backdrops/truck.webp`, pos: "center 45%" },
  survey: { src: `${base}images/backdrops/survey.webp`, pos: "center 55%" },
  "solar-field": { src: `${base}images/backdrops/solar-field.webp`, pos: "center 50%" },
  water: { src: `${base}images/backdrops/water.webp`, pos: "center 40%" },
  "ro-plant": { src: `${base}images/backdrops/ro-plant.webp`, pos: "center 50%" },
  purification: { src: `${base}images/backdrops/purification.webp`, pos: "center 50%" },
} as const;

type BackdropKey = keyof typeof BACKDROPS;

const BACKDROP_FOR: Record<string, BackdropKey> = {
  "karura forest community borehole": "survey",
  "ruiru industrial estate water supply": "truck",
  "ngong hills flower farm irrigation": "solar-field",
  "diani beach resort desalination & borehole": "purification",
  "kilifi county government water project": "water",
  "malindi fishermen's cooperative borehole": "water",
  "mombasa airport road hotel complex": "ro-plant",
  "nakuru dairy farm mega borehole": "truck",
  "eldoret teaching hospital borehole": "ro-plant",
  "bomet tea estate irrigation network": "solar-field",
  "naivasha horticulture farm water system": "truck",
  "kericho county school cluster": "survey",
  "kisumu port industrial zone": "solar-field",
  "kakamega sugar cane cooperative": "solar-field",
  "bungoma town shopping mall": "water",
  "siaya county water authority project": "survey",
  "machakos mango farm irrigation": "rig-sunset",
  "kitui arid lands community water": "rig-sunset",
  "meru county referral hospital": "ro-plant",
  "embu university college water supply": "truck",
  "garissa refugee camp emergency water": "rig-sunset",
  "turkana county livestock trough network": "rig-sunset",
  "isiolo town water supply augmentation": "rig-sunset",
  "nyeri county coffee cooperative": "truck",
  "kirinyaga rice irrigation scheme": "solar-field",
  "murang'a avocado packing station": "ro-plant",
  "laikipia wildlife conservancy": "rig-sunset",
  "taita-taveta sisal estate": "rig-sunset",
  "nandi hills tea research station": "survey",
  "vihiga county health facilities water": "survey",
  "trans nzoia wheat farm irrigation": "solar-field",
  "homa bay fish processing plant": "ro-plant",
  "samburu national reserve camp": "rig-sunset",
  "nyamira tea factory water supply": "purification",
  "marsabit camel market water point": "rig-sunset",
};

export function projectBackdrop(title: string | undefined | null): ProjectPhoto | undefined {
  if (!title) return undefined;
  const key = BACKDROP_FOR[title.trim().toLowerCase()];
  return key ? BACKDROPS[key] : undefined;
}
