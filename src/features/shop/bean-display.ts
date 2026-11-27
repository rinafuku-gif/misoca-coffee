import { z } from "zod";

/** Display-only description of a coffee bean, read from the Notion product
 * list (EC販売ステータス = 販売中). Shared by the server route and the browser.
 * It carries NO price, stock or sale permission: what can be bought, and for how
 * much, is always the purchase catalog's answer (`/api/ec/purchase/catalog`). */
const text = z.string().max(10000);
const pageId = z.string().regex(/^[a-f0-9]{32}$/);
export const beanDisplaySchema = z.object({
  id: pageId,
  name: text, origin: text, roast: text, flavor: text, process: text, variety: text,
  region: text, farm: text, altitude: text, description: text,
  // Only the checked same-site image route, or nothing. Never a remote URL.
  image: z.union([z.literal(""), z.string().regex(/^\/api\/notion-image\/[a-f0-9]{32}$/)]),
  // Notion 「商品の種類」. null = a value the site does not know (grouped by SKU).
  // Optional so an answer cached before this field existed still parses.
  category: z.enum(["豆", "ドリップバッグ", "その他"]).nullable().optional(),
}).strict();
export type BeanDisplay = z.infer<typeof beanDisplaySchema>;
export const beanDisplayResponseSchema = z.object({ items: z.array(beanDisplaySchema).max(100) }).strict();
export const BEAN_DISPLAY_PATH = "/api/shop/bean-display";
/** The display rows for the browser (shop and home page). Optional data: any
 * failure gives [] (cards without photos); it never blocks the catalog. */
export async function readBeanDisplays(signal: AbortSignal): Promise<BeanDisplay[]> {
  try {
    const response = await fetch(BEAN_DISPLAY_PATH, { credentials: "omit", signal });
    if (!response.ok) { await response.body?.cancel(); return []; }
    const parsed = beanDisplayResponseSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.items : [];
  } catch { return []; }
}

export type ProductCategory = NonNullable<BeanDisplay["category"]>;

/** Notion page id (32 lowercase hex) of a bean SKU `bn_<pageId>_300`, else null. */
export function beanPageId(skuId: string): string | null {
  const match = /^bn_([a-f0-9]{32})_300$/.exec(skuId);
  return match ? match[1] : null;
}
/** Notion page id of a sellable SKU: a bean `bn_<id>_300` or a drip bag /
 * other product `gd_<id>_1`. Any other shape has no display row. */
export function catalogPageId(skuId: string): string | null {
  const match = /^(?:bn_([a-f0-9]{32})_300|gd_([a-f0-9]{32})_1)$/.exec(skuId);
  return match ? match[1] ?? match[2] : null;
}

/** The three groups of the purchase screen, in display order. */
export const PRODUCT_GROUPS = [
  { key: "beans", heading: "コーヒー豆" },
  { key: "drip", heading: "ドリップバッグ" },
  { key: "other", heading: "その他の商品" },
] as const;
export type ProductGroupKey = typeof PRODUCT_GROUPS[number]["key"];

/** Which group an item goes under. A `bn_` SKU is a 300g bean product and stays
 * with the beans (its unit is 300g・豆 even while Notion's kind is changing).
 * Any other SKU (`gd_…`) is a drip bag when the display says ドリップバッグ,
 * otherwise an 「その他の商品」. */
export function productGroup(skuId: string, category: ProductCategory | null | undefined): ProductGroupKey {
  if (/^bn_/.test(skuId)) return "beans";
  return category === "ドリップバッグ" ? "drip" : "other";
}
/** Items split into the three groups (catalog order kept). Empty groups are left out. */
export function groupCatalogItems<T extends { skuId: string; display: BeanDisplay | null }>(items: readonly T[]) {
  return PRODUCT_GROUPS.map(group => ({ ...group, items: items.filter(item => productGroup(item.skuId, item.display?.category) === group.key) }))
    .filter(group => group.items.length > 0);
}

/** Joins each sellable catalog item (bean or `gd_`) with its display row by Notion page id.
 * Every catalog item is kept, in catalog order; an item without a display row
 * (or a non-bean item) gets `display: null` and is still shown and sold. */
export function joinCatalogWithDisplay<T extends { skuId: string }>(items: readonly T[], displays: readonly BeanDisplay[]): (T & { display: BeanDisplay | null })[] {
  const byId = new Map(displays.map(display => [display.id, display] as const));
  return items.map(item => {
    const id = catalogPageId(item.skuId);
    return { ...item, display: id ? byId.get(id) ?? null : null };
  });
}
