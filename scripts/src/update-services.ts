import { db, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const updates = [
  {
    slug: "borehole-drilling",
    priceFrom: "5650",
    priceUnit: "per metre (plastic casing)",
    duration: "Depends on depth",
    shortDescription: "Professional borehole drilling with casing, gravel pack, and 24-hour pump test across all 47 counties.",
    description:
      "We provide a comprehensive borehole drilling solution that covers the full drilling phase. Our service includes open drilling with proper casing to ensure borehole stability, gravel installation to secure the structure and maintain integrity, and a detailed 24-hour pump test to assess well performance and ensure optimal functionality.\n\nCasing pricing:\n• Plastic Casing — Ksh. 5,650 per metre\n• Steel Casing — Ksh. 5,850 per metre\n\nPrices are indicative and we are happy to negotiate a small discount once you are ready to proceed. We are committed to exceptional quality and building a trusted partnership with you.",
    highlights: [
      "Includes open drilling and borehole casing",
      "Gravel pack installation for structural integrity",
      "24-hour pump test included",
      "Plastic casing: Ksh 5,650/m · Steel casing: Ksh 5,850/m",
      "Drilling depth up to 300m",
      "Covers all 47 counties of Kenya",
    ],
  },
  {
    slug: "test-pumping",
    priceFrom: "60000",
    priceUnit: "per test",
    duration: "24 hours",
    shortDescription: "Professional 24-hour pump test with accredited government laboratory water chemical analysis report.",
    description:
      "Our test pumping service is professionally executed at a cost of Ksh. 60,000. This service validates the efficiency and performance of your borehole and includes a water chemical analysis report from an accredited government laboratory.\n\nThis is especially valuable if your drilling phase was conducted by another company and did not include test pumping, as it provides independent verification of water quality and borehole yield before committing to pump installation.\n\nThe test determines the reliable sustainable yield of your borehole and aquifer characteristics, guiding correct pump sizing and setting depth.",
    highlights: [
      "Full 24-hour pump test at Ksh 60,000",
      "Water chemical analysis from accredited govt lab",
      "Suitable even if drilling was done by another company",
      "Step drawdown and constant rate tests",
      "Aquifer parameters and pump sizing report",
      "Recovery monitoring included",
    ],
  },
  {
    slug: "pump-installation",
    priceFrom: "200000",
    priceUnit: "per installation",
    duration: "1–3 days",
    shortDescription: "Electricity and solar pump installation tailored to your depth and water demand — from Ksh 200,000.",
    description:
      "We offer tailored pump installation services designed to meet your specific requirements, ensuring efficiency and reliability.\n\nElectricity-Powered Pump:\nOur most cost-effective option. Quotations typically start from as low as Ksh. 200,000 depending on the project scope and specific needs.\n\nSolar Pump:\nFor clients seeking a renewable energy solution, solar pump installations generally start from Ksh. 500,000. Final pricing is determined after test pumping and evaluation of depth, site conditions, and water demand.\n\nAll installations are tested and commissioned before handover.",
    highlights: [
      "Electricity pump from Ksh 200,000",
      "Solar pump from Ksh 500,000",
      "Final pricing after test pumping & site evaluation",
      "Certified installation technicians",
      "Control panel & electrical connection included",
      "System commissioning before handover",
    ],
  },
  {
    slug: "hydrogeological-surveys",
    priceFrom: "30000",
    priceUnit: "per site",
    duration: "1 day",
    shortDescription: "Hydrogeological survey using ADMT-300S-X geophysical equipment to find the best borehole location.",
    description:
      "Before drilling a borehole, we conduct a hydrogeological survey to determine the best location for groundwater. This ensures that the borehole yields sufficient and sustainable water while minimising drilling risks.\n\nWe use advanced equipment — including the ADMT-300S-X geophysical machine and traditional dowsing rods — to assess underground water availability. The survey identifies the depth and quality of water, guiding the drilling process for efficiency and success.\n\nSurvey cost: Ksh. 30,000\n\nThe completed survey report is also required for obtaining regulatory drilling permits:\n• WARMA (Water Resources Authority) permit — Ksh. 20,000\n• NEMA (National Environment Management Authority) permit — Ksh. 20,000\nTotal permit cost: Ksh. 80,000",
    highlights: [
      "Survey cost: Ksh 30,000",
      "ADMT-300S-X geophysical machine used",
      "Identifies optimal drill site, depth, and water quality",
      "Hydrogeological report included",
      "WARMA permit: Ksh 20,000 · NEMA permit: Ksh 20,000",
      "Success rate over 95%",
    ],
  },
];

async function updateServices() {
  console.log("Updating service pricing with real data...");
  for (const u of updates) {
    await db
      .update(servicesTable)
      .set({
        priceFrom: u.priceFrom,
        priceUnit: u.priceUnit,
        duration: u.duration,
        shortDescription: u.shortDescription,
        description: u.description,
        highlights: u.highlights,
      })
      .where(eq(servicesTable.slug, u.slug));
    console.log(`  ✓ Updated: ${u.slug}`);
  }
  console.log("Done.");
  process.exit(0);
}

updateServices().catch((e) => {
  console.error(e);
  process.exit(1);
});
