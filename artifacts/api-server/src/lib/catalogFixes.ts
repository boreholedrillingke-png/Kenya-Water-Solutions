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
    await db
      .update(productsTable)
      .set({ price: "680000.00", comparePrice: null })
      .where(eq(productsTable.slug, "reverse-osmosis-500lph"));
    // New product: JA Solar Panel 550W (inserted once if missing)
    const existing = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.slug, "ja-solar-panel-550w"));
    if (existing.length === 0) {
      await db.insert(productsTable).values({
        name: "JA Solar Panel 550W",
        slug: "ja-solar-panel-550w",
        category: "Solar Panels",
        brand: "JA Solar",
        description: "550W mono half-cell solar panel for solar pumping and power systems. Efficient, durable and suited to Kenyan sunshine.",
        price: "30000.00",
        comparePrice: null,
        inStock: true,
        stockQty: 100,
        imageUrl: null,
        specifications: { Power: "550W", Type: "Mono half-cell", Brand: "JA Solar" },
        deliveryAvailable: true,
        deliveryDays: 2,
        whatsappOrderEnabled: true,
        featured: false,
      });
    }
  } catch (err) {
    logger.warn({ err }, "Catalog fixes failed");
  }
}
