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
  "garissa refugee camp emergency water": photo(p("garissa")),
  "isiolo town water supply augmentation": photo(p("isiolo"), "center 40%"),
  "nyeri county coffee cooperative": photo(p("nyeri")),
  "taita-taveta sisal estate": photo(p("drill-crew"), "center 55%"),
  "nandi hills tea research station": photo(p("nandi")),
  "vihiga county health facilities water": photo(p("vihiga"), "center 38%"),
  "nyamira tea factory water supply": photo(p("nyamira"), "center 25%"),
  "marsabit camel market water point": photo(p("marsabit")),

  // --- hospitals, resorts, hotels, factories, malls: clean water and storage ---
  "diani beach resort desalination & borehole": photo(p("ro-plant")), // reverse osmosis plant
  "mombasa airport road hotel complex": photo(IMAGES.purification),
  "eldoret teaching hospital borehole": photo(p("ro-clean-room"), "center 38%"),
  "meru county referral hospital": photo(p("tank-lift"), "center 30%"),
  "kisumu port industrial zone": photo(p("ro-plant-industrial"), "center 55%"),
  "homa bay fish processing plant": photo(IMAGES.water, "center 40%"),
  "murang'a avocado packing station": photo(IMAGES.pumpInstall, "center 40%"),
  "bungoma town shopping mall": photo(p("solar-towers-urban"), "center 30%"),
  "samburu national reserve camp": photo(IMAGES.treatment, "55% 50%"),

  // --- irrigation and livestock: pumps, flowing water, tank towers ---
  "ngong hills flower farm irrigation": photo(p("solar-field-pump"), "center 45%"),
  "bomet tea estate irrigation network": photo(IMAGES.solarPump, "65% 50%"),
  "kakamega sugar cane cooperative": photo(p("pump-discharge")),
  "machakos mango farm irrigation": photo(p("solar-tank-tap"), "center 25%"),
  "kirinyaga rice irrigation scheme": photo(p("water-jet-pipe"), "center 25%"),
  "trans nzoia wheat farm irrigation": photo(p("tank-tower-two"), "center 15%"),
  "turkana county livestock trough network": photo(IMAGES.solarTower, "center 55%"),
  "laikipia wildlife conservancy": photo(p("tank-tower-panel"), "center 15%"),
};

export function projectPhoto(title: string | undefined | null): ProjectPhoto | undefined {
  if (!title) return undefined;
  return PHOTOS[title.trim().toLowerCase()];
}
