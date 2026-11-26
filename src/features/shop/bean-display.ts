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
}).strict();
export type BeanDisplay = z.infer<typeof beanDisplaySchema>;
export const beanDisplayResponseSchema = z.object({ items: z.array(beanDisplaySchema).max(100) }).strict();
export const BEAN_DISPLAY_PATH = "/api/shop/bean-display";

/** Notion page id (32 lowercase hex) of a bean SKU `bn_<pageId>_300`, else null. */
export function beanPageId(skuId: string): string | null {
  const match = /^bn_([a-f0-9]{32})_300$/.exec(skuId);
  return match ? match[1] : null;
}

/** Joins each sellable catalog item with its display row by Notion page id.
 * Every catalog item is kept, in catalog order; an item without a display row
 * (or a non-bean item) gets `display: null` and is still shown and sold. */
export function joinCatalogWithDisplay<T extends { skuId: string }>(items: readonly T[], displays: readonly BeanDisplay[]): (T & { display: BeanDisplay | null })[] {
  const byId = new Map(displays.map(display => [display.id, display] as const));
  return items.map(item => {
    const id = beanPageId(item.skuId);
    return { ...item, display: id ? byId.get(id) ?? null : null };
  });
}
