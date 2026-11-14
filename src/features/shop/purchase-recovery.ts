import type { PurchaseSession } from "./purchase-session";

const rejectionMessages = {
  OUT_OF_STOCK: "選んだ数量の在庫がなくなりました。",
  QUOTE_CHANGED: "商品の価格・送料などの条件が変わりました。",
  PRODUCT_UNAVAILABLE: "選んだ商品の販売状況が変わりました。",
  SHIPPING_REVIEW_REQUIRED: "選んだ商品の配送条件を確認できません。商品の選び直し、または店舗へのご相談が必要です。",
  SHIPPING_LIMIT_EXCEEDED: "一度に発送できる数量を超えています。数量を減らすか、店舗へご相談ください。",
} as const;

export function shippingFailureNotice(body: unknown, continuation = false) {
  if (!body || typeof body !== "object" || !("error" in body) || typeof body.error !== "string" || !["SHIPPING_REVIEW_REQUIRED", "SHIPPING_LIMIT_EXCEEDED"].includes(body.error)) return null;
  const message = rejectionMessages[body.error as "SHIPPING_REVIEW_REQUIRED" | "SHIPPING_LIMIT_EXCEEDED"];
  return continuation ? `${message}注文が作成されていないことはまだ確認できません。買い直さず、同じ注文の状況を確認してください。` : `${message}この見積操作では注文・請求は始まりません。`;
}

export function recoverRejectedCheckout(session: PurchaseSession, key: string, body: unknown) {
  if (!body || typeof body !== "object" || !("error" in body) || !("orderMayExist" in body) || body.orderMayExist !== false) return null;
  const code = body.error;
  if (typeof code !== "string" || !Object.hasOwn(rejectionMessages, code)) return null;
  if (session.attempt?.purchaseKey !== key || session.attempt.cancelRequested || session.attempt.settledOrderId) return null;
  return {
    session: { ...session, attempt: null, viewKey: null },
    notice: `${rejectionMessages[code as keyof typeof rejectionMessages]}この購入操作では注文・請求は始まっていません。商品と数量を見直し、合計を確認し直してください。`,
  };
}

/** Absence from a paginated catalog is not proof of withdrawal. Labels already
 * seen in this tab are presentation only, never price/availability authority. */
export function unlistedCartLines(cart: PurchaseSession["cart"], visibleIds: readonly string[], labels: ReadonlyMap<string, string>) {
  const visible = new Set(visibleIds);
  return cart.flatMap((line, index) => visible.has(line.skuId) ? [] : [{ ...line, label: labels.get(line.skuId) ?? `選択した商品 ${index + 1}` }]);
}
