/** Presentation rules of the cart on the purchase screen. They only decide
 * what a button offers; the purchase screen's own `quantity()` still saves the
 * cart, enforces the 20-line limit and clears any quoted total. The only sum
 * here is the cart's 小計 (owner's spec); shipping and the total charged are
 * always the quote's answer. */
export interface CatalogItemView { skuId: string; name: string; unit: string; unitPrice: number; maxQuantity: number }
export interface CartLine { skuId: string; quantity: number }

/** The quantity after 「カートに入れる」: one more, never above the catalog's
 * current maximum. `null` means the button does nothing. */
export function quantityAfterAdd(item: Pick<CatalogItemView, "maxQuantity">, current: number): number | null {
  return current < item.maxQuantity ? current + 1 : null;
}

export function addButtonState(item: Pick<CatalogItemView, "maxQuantity">, current: number, blocked: boolean): { disabled: boolean; label: "在庫なし" | "カートに入れる" } {
  if (item.maxQuantity === 0) return { disabled: true, label: "在庫なし" };
  return { disabled: blocked || quantityAfterAdd(item, current) === null, label: "カートに入れる" };
}

export type DrawerLine = CartLine & { item: CatalogItemView | null; label: string };
/** Every saved cart line, in cart order. A line whose product is not in the
 * loaded list keeps its last known label (or a neutral one) and can only be removed. */
export function drawerLines(cart: readonly CartLine[], items: readonly CatalogItemView[], labels: ReadonlyMap<string, string>): DrawerLine[] {
  return cart.map((line, index) => {
    const item = items.find(candidate => candidate.skuId === line.skuId) ?? null;
    return { ...line, item, label: item ? `${item.name} ${item.unit}` : labels.get(line.skuId) ?? `選択した商品 ${index + 1}` };
  });
}

/** 小計 of the cart lines whose product is in the loaded list (catalog price × quantity). */
export function cartSubtotal(lines: readonly DrawerLine[]): number {
  return lines.reduce((sum, line) => sum + (line.item ? line.item.unitPrice * line.quantity : 0), 0);
}
