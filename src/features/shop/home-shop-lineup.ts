import { productGroup } from "./bean-display";
import { findShopItem, type ShopItemKey } from "./shop-item-link";

/** The product that leads the home page's ONLINE SHOP section. */
export const HOME_LINEUP_LEAD: ShopItemKey = "yuzu-drip-bag";
/** How many roasted-bean products follow it. */
export const HOME_LINEUP_BEANS = 2;

/** Up to three products for the home page, from the same purchase catalog as the
 * shop: the yuzu drip bag first (when it is on sale), then the first roasted-bean
 * products in the shop's order. Sold-out items (maxQuantity 0, 「在庫なし」 in the
 * shop) are left out; items the catalog does not offer are never in it. */
export function homeShopLineup<T extends { skuId: string; name: string; maxQuantity: number }>(items: readonly T[]): T[] {
  const onSale = items.filter(item => item.maxQuantity > 0);
  const lead = findShopItem(HOME_LINEUP_LEAD, onSale);
  const beans = onSale.filter(item => item !== lead && productGroup(item.skuId, null) === "beans").slice(0, HOME_LINEUP_BEANS);
  return lead ? [lead, ...beans] : beans;
}
