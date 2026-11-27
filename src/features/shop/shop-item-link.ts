/** Links that open the shop at one product: `/shop?item=<key>`.
 *
 * Only the keys listed here are understood; any other value (or none) leaves the
 * shop exactly as before: it starts at the top. The product is found by its
 * catalog name after the catalog has loaded, so nothing about prices, stock or
 * the cart is decided here. */
export const SHOP_ITEM_PARAM = "item";

export const shopItemLinks = {
  "yuzu-drip-bag": { name: "ドリップバッグ（ゆずインフューズド）", group: "drip" },
} as const;

export type ShopItemKey = keyof typeof shopItemLinks;

export function shopItemHref(key: ShopItemKey): string {
  return `/shop?${SHOP_ITEM_PARAM}=${key}`;
}

/** The requested key from a `location.search` string, or null. */
export function readShopItemKey(search: string): ShopItemKey | null {
  const value = new URLSearchParams(search).get(SHOP_ITEM_PARAM);
  return value !== null && Object.hasOwn(shopItemLinks, value) ? value as ShopItemKey : null;
}

/** Where to go once the catalog is shown: the product itself (highlighted), or,
 * when it is not in the catalog right now, the heading of its group if that is
 * shown. null = stay at the top. */
export function shopItemTarget(key: ShopItemKey | null, items: readonly { skuId: string; name: string }[]): { sku: string } | { group: string } | null {
  if (key === null) return null;
  const link = shopItemLinks[key];
  const item = items.find(candidate => candidate.name === link.name);
  return item ? { sku: item.skuId } : { group: link.group };
}
