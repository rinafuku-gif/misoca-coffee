/** Links that open the shop at one product: `/shop?item=<value>`.
 *
 * Two kinds of value are understood; any other value (or none) leaves the shop
 * exactly as before: it starts at the top.
 * - a named key from `shopItemLinks` (e.g. `yuzu-drip-bag`, printed on cards as a
 *   QR code via the yuzu page). Found by its catalog name; keep these working.
 * - a catalog SKU id (`bn_<32 hex>_300` or `gd_<32 hex>_1`), the stable id of a
 *   product (its Notion page id inside). Found by that id.
 * The product is looked up after the catalog has loaded, so nothing about prices,
 * stock or the cart is decided here. */
export const SHOP_ITEM_PARAM = "item";

export const shopItemLinks = {
  "yuzu-drip-bag": { name: "ドリップバッグ（ゆずインフューズド）", group: "drip" },
} as const;

export type ShopItemKey = keyof typeof shopItemLinks;
/** A catalog SKU id, as the purchase catalog names a product. */
export type ShopItemSku = `bn_${string}_300` | `gd_${string}_1`;
export type ShopItemRef = ShopItemKey | ShopItemSku;

const SKU_ID = /^(?:bn_[a-f0-9]{32}_300|gd_[a-f0-9]{32}_1)$/;
export const isShopItemSku = (value: string): value is ShopItemSku => SKU_ID.test(value);

export function shopItemHref(ref: ShopItemRef): string {
  return `/shop?${SHOP_ITEM_PARAM}=${ref}`;
}

/** The shop link for a catalog item: at that product when its SKU id has the
 * stable shape, otherwise the shop's top (never an unchecked value in the link). */
export function shopItemHrefFor(skuId: string): string {
  return isShopItemSku(skuId) ? shopItemHref(skuId) : "/shop";
}

/** `&add=1` after `?item=…`: sent by a product page's 「カートに入れる」. Once the
 * catalog is shown, the shop presses its own 「カートに入れる」 for that product
 * (one more, the same limits, never while a payment is unfinished), opens the
 * cart, and drops this flag from the address so a reload never adds again.
 * Without it, `?item=…` keeps its meaning: move to the product. */
export const SHOP_ADD_PARAM = "add";

export function shopItemAddHref(ref: ShopItemRef): string {
  return `${shopItemHref(ref)}&${SHOP_ADD_PARAM}=1`;
}

export function readShopItemAdd(search: string): boolean {
  return new URLSearchParams(search).get(SHOP_ADD_PARAM) === "1";
}

/** The same address without the add flag (path, other parameters and hash kept). */
export function withoutShopItemAdd(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(SHOP_ADD_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** The requested key or SKU id from a `location.search` string, or null. */
export function readShopItemKey(search: string): ShopItemRef | null {
  const value = new URLSearchParams(search).get(SHOP_ITEM_PARAM);
  if (value === null) return null;
  if (Object.hasOwn(shopItemLinks, value)) return value as ShopItemKey;
  return isShopItemSku(value) ? value : null;
}

/** The catalog item a key or SKU id stands for (undefined when it is not listed now). */
export function findShopItem<T extends { skuId: string; name: string }>(ref: ShopItemRef, items: readonly T[]): T | undefined {
  if (Object.hasOwn(shopItemLinks, ref)) {
    const name = shopItemLinks[ref as ShopItemKey].name;
    return items.find(candidate => candidate.name === name);
  }
  return items.find(candidate => candidate.skuId === ref);
}

/** Where to go once the catalog is shown: the product itself (highlighted), or,
 * when it is not in the catalog right now, the heading of its group if known
 * (a bean SKU → コーヒー豆). null = stay at the top. */
export function shopItemTarget(ref: ShopItemRef | null, items: readonly { skuId: string; name: string }[]): { sku: string } | { group: string } | null {
  if (ref === null) return null;
  const item = findShopItem(ref, items);
  if (item) return { sku: item.skuId };
  if (Object.hasOwn(shopItemLinks, ref)) return { group: shopItemLinks[ref as ShopItemKey].group };
  return ref.startsWith("bn_") ? { group: "beans" } : null;
}
