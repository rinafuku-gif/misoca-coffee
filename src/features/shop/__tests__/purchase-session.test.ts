import { describe, expect, it } from "vitest";
import { allowedCheckoutLocation, PURCHASE_SESSION_KEY, purchaseKeyForStatus, readPurchaseSession, reconcilePurchasedCart, writePurchaseSession, markCheckoutCancellation, applyCheckoutCancellation, type PurchaseSession } from "../purchase-session";
import { PURCHASE_STORAGE_KEY, purchaseCancellationResultSchema, type BuyerStatus } from "../purchaser-status";
const key = "a".repeat(64);
const status: BuyerStatus = { orderReference: "order-fixture", createdAt: 1000, items: [{ skuId: "beans", name: "架空", unit: "100g", quantity: 1, unitPrice: 900, kind: "physical" }], total: 1270, shipping: 370, refundedTotal: 0, payment: "confirmed", physical: "awaiting_preparation", giftDelivery: "not_applicable", confirmationEmail: "not_sent", cancellation: "none" };
const saved = (): PurchaseSession => ({ version: 1, cart: [{ skuId: "beans", quantity: 2 }, { skuId: "other", quantity: 1 }], attempt: { purchaseKey: key, lines: [{ skuId: "beans", quantity: 1 }], acceptedQuote: "b".repeat(64) }, history: [], viewKey: key });
function storage() { const map = new Map<string, string>(); return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } }; }
describe("購入用のタブ内保存とカート整理", () => {
  it("空状態を読み、1レコードでカートと決済試行を復元", () => {
    const port = storage(); expect(readPurchaseSession(port).attempt).toBeNull();
    writePurchaseSession(port, saved()); expect(readPurchaseSession(port)).toEqual(saved()); expect(purchaseKeyForStatus(port)).toBe(key);
  });
  it("保存できないときは成功扱いせず、読み返しの失敗も検出", () => {
    const port = storage(); writePurchaseSession(port, saved());
    expect(() => writePurchaseSession({ ...port, setItem: () => { throw new Error("quota"); } }, { ...saved(), cart: [] })).toThrow();
    expect(readPurchaseSession(port)).toEqual(saved());
    expect(() => writePurchaseSession({ ...port, setItem: () => {} }, { ...saved(), cart: [] })).toThrow("PURCHASE_STORAGE_UNAVAILABLE");
  });
  it("不正/旧版の保存記録を空扱いせず止める", () => {
    const port = storage(); port.setItem(PURCHASE_SESSION_KEY, "{"); expect(() => readPurchaseSession(port)).toThrow();
    port.setItem(PURCHASE_SESSION_KEY, JSON.stringify({ ...saved(), version: 99 })); expect(() => readPurchaseSession(port)).toThrow();
    port.setItem(PURCHASE_SESSION_KEY, JSON.stringify({ ...saved(), cart: [{ skuId: "beans", quantity: -1 }] })); expect(() => readPurchaseSession(port)).toThrow();
  });
  it("未確認の旧キーを残し、新規購入キーで黙って上書きしない", () => {
    const port = storage(); port.setItem(PURCHASE_STORAGE_KEY, key); expect(purchaseKeyForStatus(port)).toBe(key); expect(readPurchaseSession(port).attempt).toBeNull();
  });
  it("支払済みの購入分だけを一度減らし、追加分や他商品を残す", () => {
    const port = storage(); writePurchaseSession(port, saved());
    const result = reconcilePurchasedCart(port, key, status);
    expect(result.cart).toEqual([{ skuId: "beans", quantity: 1 }, { skuId: "other", quantity: 1 }]); expect(result.attempt?.settledOrderId).toBe(status.orderReference);
    expect(reconcilePurchasedCart(port, key, status)).toEqual(result);
    writePurchaseSession(port, { ...result, cart: [{ skuId: "beans", quantity: 3 }] });
    expect(reconcilePurchasedCart(port, key, status).cart).toEqual([{ skuId: "beans", quantity: 3 }]);
  });
  it.each(["waiting", "under_review", "closed", "partially_refunded", "refunded"] as const)("%sは購入済みとしてカートを消さない", payment => {
    const port = storage(); writePurchaseSession(port, saved()); expect(reconcilePurchasedCart(port, key, { ...status, payment })).toEqual(saved());
  });
  it("別の注文キーや購入内容の不一致でカートを変えない", () => {
    const port = storage(); writePurchaseSession(port, saved()); expect(reconcilePurchasedCart(port, "c".repeat(64), status)).toEqual(saved());
    expect(() => reconcilePurchasedCart(port, key, { ...status, items: [{ ...status.items[0], quantity: 2 }] })).toThrow("PURCHASE_RECEIPT_MISMATCH"); expect(readPurchaseSession(port)).toEqual(saved());
  });
  it("失敗した整理ではカートと完了印のどちらも元のまま", () => {
    const port = storage(); writePurchaseSession(port, saved());
    expect(() => reconcilePurchasedCart({ ...port, setItem: () => { throw new Error("quota"); } }, key, status)).toThrow(); expect(readPurchaseSession(port)).toEqual(saved());
  });
  it("過去の注文を選んでも進行中の試行は消さない", () => {
    const port = storage(); const next = { ...saved(), viewKey: "c".repeat(64), history: [{ purchaseKey: "c".repeat(64), orderReference: "older-order" }] };
    writePurchaseSession(port, next); expect(purchaseKeyForStatus(port)).toBe("c".repeat(64)); expect(readPurchaseSession(port).attempt).toEqual(saved().attempt);
  });
});
describe("決済画面の移動先を限定", () => {
  it.each(["https://checkout.stripe.com/g/pay/cs_test_dummy", "https://checkout.stripe.com/pay/test"])("Stripeの既知ホストは許可 %s", url => { expect(allowedCheckoutLocation(url, "https://example.invalid")).toBe(true); });
  it.each(["javascript:alert(1)", "https://checkout.stripe.com.evil.invalid/c/x", "https://attacker@checkout.stripe.com/c/x", "http://checkout.stripe.com/c/x", "https://checkout.stripe.com:8443/c/x", "/shop/success"])("他の移動先は拒否 %s", url => { expect(allowedCheckoutLocation(url, "https://example.invalid")).toBe(false); });
  it("模擬決済への例外は厳密なloopbackの検証先だけ", () => {
    const url = "http://127.0.0.1:3133/fixture/payment?order=fixture";
    expect(allowedCheckoutLocation(url, "http://127.0.0.1:3133")).toBe(true);
    expect(allowedCheckoutLocation(url, "https://example.invalid")).toBe(false);
    expect(allowedCheckoutLocation("http://user:secret@127.0.0.1:3133/fixture/payment", "http://127.0.0.1:3133")).toBe(false);
  });
});
describe("中止の意図と結果はカートから分離", () => {
  it("送信前に同じ試行への中止意図を保存し、再読込でも残す", () => {
    const port = storage(); writePurchaseSession(port, saved()); markCheckoutCancellation(port, key);
    expect(readPurchaseSession(port).attempt?.cancelRequested).toBe(true); expect(readPurchaseSession(port).cart).toEqual(saved().cart);
  });
  it("保存に失敗したら中止受付とせず、元の試行を残す", () => {
    const port = storage(); writePurchaseSession(port, saved());
    expect(() => markCheckoutCancellation({ ...port, setItem: () => { throw new Error("quota"); } }, key)).toThrow(); expect(readPurchaseSession(port)).toEqual(saved());
  });
  it.each(["checking", "payment_review"] as const)("%sでは試行とカートを消さない", cancellation => {
    const port = storage(); writePurchaseSession(port, saved()); const marked = markCheckoutCancellation(port, key);
    expect(applyCheckoutCancellation(port, key, { cancellation, status: { ...status, cancellation, payment: "under_review" } })).toEqual(marked);
  });
  it("受付終了と未払いを確認した時だけ次の買い物へ戻し、商品は減らさない", () => {
    const port = storage(); writePurchaseSession(port, saved()); markCheckoutCancellation(port, key);
    const result = applyCheckoutCancellation(port, key, { cancellation: "closed", status: { ...status, payment: "closed", cancellation: "closed" } });
    expect(result.attempt).toBeNull(); expect(result.cart).toEqual(saved().cart); expect(result.history).toEqual([{ purchaseKey: key, orderReference: status.orderReference }]); expect(purchaseKeyForStatus(port)).toBe(key);
  });
  it("他の確認理由が残る受付終了で、別注文へ逃がさない", () => {
    const port = storage(); writePurchaseSession(port, saved()); const marked = markCheckoutCancellation(port, key);
    expect(applyCheckoutCancellation(port, key, { cancellation: "closed", status: { ...status, payment: "under_review", cancellation: "closed" } })).toEqual(marked);
  });
  it("サーバーが未作成と確認したときだけ試行を解除", () => {
    const port = storage(); writePurchaseSession(port, saved()); markCheckoutCancellation(port, key);
    const result = applyCheckoutCancellation(port, key, { cancellation: "not_created", orderMayExist: false }); expect(result.attempt).toBeNull(); expect(result.cart).toEqual(saved().cart); expect(result.viewKey).toBeNull();
  });
  it("別の過去注文の結果で現在の試行を消さず、矛盾した応答は拒否", () => {
    const port = storage(); writePurchaseSession(port, saved()); expect(applyCheckoutCancellation(port, "c".repeat(64), { cancellation: "not_created", orderMayExist: false })).toEqual(saved());
    expect(purchaseCancellationResultSchema.safeParse({ cancellation: "closed", status: { ...status, cancellation: "checking" } }).success).toBe(false);
    expect(purchaseCancellationResultSchema.safeParse({ cancellation: "not_created", orderMayExist: true }).success).toBe(false);
  });
});
