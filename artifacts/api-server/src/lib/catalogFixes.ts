import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

// Idempotent catalog corrections applied on startup (runs against the live database).
export async function applyCatalogFixes() {
  try {
    await db
      .update(productsTable)
      .set({
        name: "Borehole Screen & Steel Casing 6 inch",
        price: "17500.00",
        description:
          "Slotted borehole screen and plain steel casing for water intake and borehole lining. Prevents sand ingress while maximising yield. Supplied in 6 m lengths.",
        specifications: { Diameter: "6 inch", Length: "6 m each", "Slot Size": "0.5mm" },
      })
      .where(eq(productsTable.slug, "stainless-steel-borehole-screen-6inch"));
    await db
      .update(productsTable)
      .set({ price: "5500.00" })
      .where(eq(productsTable.slug, "upvc-borehole-casing-6inch"));
  } catch (err) {
    logger.warn({ err }, "Catalog fixes failed");
  }
}
