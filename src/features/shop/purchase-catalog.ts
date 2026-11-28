import { z } from "zod";
import { buyerProductPublicationSchema } from "./product-publication-view";
import { catalogDeliveryMethodsSchema } from "./receiving-method";
import { catalogReceptionSchema } from "./reception-notice";
import { productCardSettingsSchema } from "./product-card-settings";

/** The purchase catalog (`/api/ec/purchase/catalog`): what can be bought and for how
 * much. One reading for every screen that lists products (the shop and the home
 * page), so the request, the checks and the prices are never written twice. */
export const catalogProductSchema = z.object({ skuId: z.string(), name: z.string(), unit: z.string(), unitPrice: z.number().int().nonnegative(), kind: z.enum(["physical", "gift"]), maxQuantity: z.number().int().min(0).max(20), publication: buyerProductPublicationSchema.optional() }).strict();
// deliveryMethods: present only when the management side offers receiving methods. Absent, or not in the agreed
// shape = shipping only, as before (it never fails the catalog). reception: present only when the reception
// switch is open AND the site asked for it. Absent, or not in the agreed shape, keeps the fixed sentence (G-4).
// Neither ever fails the catalog itself. Every other field is checked as strictly as before.
export const catalogSchema = z.object({ items: z.array(catalogProductSchema.extend({ merchandising: productCardSettingsSchema.optional().catch(undefined) })).max(50), nextOffset: z.number().int().nonnegative().nullable(), acceptingOrders: z.boolean(), deliveryMethods: catalogDeliveryMethodsSchema, reception: catalogReceptionSchema }).strict();
export type Catalog = z.infer<typeof catalogSchema>;
export type CatalogProduct = z.infer<typeof catalogProductSchema>;

/** One request to the purchase routes (same options everywhere). 429 = PURCHASE_BUSY. */
export async function postPurchase(action: string, body: unknown) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/ec/purchase/${action}`, { method: "POST", headers: { "content-type": "application/json" }, credentials: "omit", cache: "no-store", body: JSON.stringify(body), signal: controller.signal });
    if (response.status === 429) {
      await response.body?.cancel();
      throw new Error("PURCHASE_BUSY");
    }
    return { ok: response.ok, body: await response.json() };
  } finally { clearTimeout(timer); }
}

/** The first page of the catalog, checked. Throws when it cannot be read. */
export async function readPurchaseCatalog(): Promise<Catalog> {
  const result = await postPurchase("catalog", {});
  if (!result.ok) throw new Error("CATALOG_UNAVAILABLE");
  return catalogSchema.parse(result.body);
}
