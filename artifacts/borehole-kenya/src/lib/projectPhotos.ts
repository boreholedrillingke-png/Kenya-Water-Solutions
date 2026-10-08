import { IMAGES } from "@/lib/images";

const base = import.meta.env.BASE_URL;
const p = (name: string) => `${base}images/projects/${name}.webp`;

export interface ProjectPhoto {
  src: string;
  /** CSS object-position so the important part stays in frame */
  pos: string;
}

/**
 * One photo per project, matched by project title. No photo is used twice.
 * Projects that are not listed here show a plain blue header instead of a repeated picture.
 * To add or change a photo: drop the file in public/images/projects and add a line below.
 */
const PHOTOS: Record<string, ProjectPhoto> = {
  "karura forest community borehole": { src: p("karura"), pos: "center 82%" },
  "ruiru industrial estate water supply": { src: p("ruiru"), pos: "center 50%" },
  "diani beach resort desalination & borehole": { src: p("diani"), pos: "center 50%" },
  "kilifi county government water project": { src: p("kilifi"), pos: "center 92%" },
  "malindi fishermen's cooperative borehole": { src: p("malindi"), pos: "center 55%" },
  "nakuru dairy farm mega borehole": { src: p("nakuru-dairy"), pos: "center 55%" },
  "eldoret teaching hospital borehole": { src: p("eldoret"), pos: "center 55%" },
  "naivasha horticulture farm water system": { src: p("naivasha"), pos: "center 50%" },
  "kericho county school cluster": { src: p("kericho"), pos: "center 50%" },
  "kisumu port industrial zone": { src: p("kisumu-port"), pos: "center 50%" },
  "siaya county water authority project": { src: p("siaya"), pos: "center 0%" },
  "kitui arid lands community water": { src: p("kitui"), pos: "center 35%" },
  "meru county referral hospital": { src: p("meru"), pos: "center 40%" },
  "embu university college water supply": { src: p("embu"), pos: "center 62%" },
  "garissa refugee camp emergency water": { src: p("garissa"), pos: "center 50%" },
  "isiolo town water supply augmentation": { src: p("isiolo"), pos: "center 40%" },
  "taita-taveta sisal estate": { src: `${base}images/drill-crew.webp`, pos: "center 55%" },
  // added in batch 3
  "nyeri county coffee cooperative": { src: p("nyeri"), pos: "center 50%" },
  "nandi hills tea research station": { src: p("nandi"), pos: "center 50%" },
  "vihiga county health facilities water": { src: p("vihiga"), pos: "center 38%" },
  "homa bay fish processing plant": { src: p("homabay"), pos: "center 50%" },
  "nyamira tea factory water supply": { src: p("nyamira"), pos: "center 25%" },
  "marsabit camel market water point": { src: p("marsabit"), pos: "center 50%" },
  "kakamega sugar cane cooperative": { src: p("kakamega"), pos: "center 45%" },
  "machakos mango farm irrigation": { src: p("machakos"), pos: "center 25%" },
  "turkana county livestock trough network": { src: p("turkana"), pos: "center 25%" },
  "kirinyaga rice irrigation scheme": { src: p("kirinyaga"), pos: "center 50%" },
  "laikipia wildlife conservancy": { src: p("laikipia"), pos: "center 15%" },
  "trans nzoia wheat farm irrigation": { src: p("transnzoia"), pos: "center 30%" },
  "samburu national reserve camp": { src: p("samburu"), pos: "center 30%" },
  "bungoma town shopping mall": { src: p("bungoma"), pos: "center 15%" },
  "murang'a avocado packing station": { src: p("muranga"), pos: "center 38%" },
  // other service types
  "ngong hills flower farm irrigation": { src: IMAGES.solarPump, pos: "65% 50%" },
  "bomet tea estate irrigation network": { src: IMAGES.solarTower, pos: "center 55%" },
  "mombasa airport road hotel complex": { src: IMAGES.pumpInstall, pos: "center 40%" },
};

export function projectPhoto(title: string | undefined | null): ProjectPhoto | undefined {
  if (!title) return undefined;
  return PHOTOS[title.trim().toLowerCase()];
}
