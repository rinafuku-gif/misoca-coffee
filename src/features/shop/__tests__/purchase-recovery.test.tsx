import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { recoverRejectedCheckout, shippingFailureNotice, unlistedCartLines } from "../purchase-recovery";
import { UnlistedCartItems } from "../components/UnlistedCartItems";
import type { PurchaseSession } from "../purchase-session";

const key = "a".repeat(64);
const saved = (): PurchaseSession => ({ version: 1, cart: [{ skuId: "beans", quantity: 2 }], attempt: { purchaseKey: key, lines: [{ skuId: "beans", quantity: 2 }], acceptedQuote: "b".repeat(64) }, history: [{ purchaseKey: "c".repeat(64), orderReference: "dummy_older_order" }], viewKey: key });
describe("未作成が確定した購入操作だけを選び直す", () => {
  it.each([
    ["OUT_OF_STOCK", "数量の在庫がなくなりました"],
    ["QUOTE_CHANGED", "価格・送料などの条件が変わりました"],
    ["PRODUCT_UNAVAILABLE", "販売状況が変わりました"],
    ["SHIPPING_REVIEW_REQUIRED", "配送条件を確認できません"],
    ["SHIPPING_LIMIT_EXCEEDED", "発送できる数量を超えています"],
  ])("%sは理由を具体的に伝え、カートと履歴を残す", (error, text) => {
    const session = saved(), result = recoverRejectedCheckout(session, key, { error, orderMayExist: false });
    expect(result?.notice).toContain(text); expect(result?.notice).toContain("注文・請求は始まっていません");
    expect(result?.session).toEqual({ ...session, attempt: null, viewKey: null });
    expect(session).toEqual(saved());
  });
  it.each([undefined, null, {}, { error: "OUT_OF_STOCK" }, { error: "OUT_OF_STOCK", orderMayExist: true }, { error: "OUT_OF_STOCK", orderMayExist: "false" }, { error: "SERVICE_UNAVAILABLE", orderMayExist: false }, { error: "toString", orderMayExist: false }])("不明・不正な回答では注文情報を消さない %#", body => {
    expect(recoverRejectedCheckout(saved(), key, body)).toBeNull();
  });
  it("別の購入操作・中止確認中・支払い確認済みには遅い拒否を適用しない", () => {
    const body = { error: "OUT_OF_STOCK", orderMayExist: false }, session = saved();
    expect(recoverRejectedCheckout(session, "d".repeat(64), body)).toBeNull();
    expect(recoverRejectedCheckout({ ...session, attempt: { ...session.attempt!, cancelRequested: true } }, key, body)).toBeNull();
    expect(recoverRejectedCheckout({ ...session, attempt: { ...session.attempt!, settledOrderId: "dummy_paid" } }, key, body)).toBeNull();
  });
});
describe("受付がお休み中のSALES_PAUSEDは、そのタブで新しく作った鍵からの決済開始だけを選び直す（G-4）", () => {
  it("新しい購入の鍵からの決済開始がSALES_PAUSEDで断られたら、注文情報を消して文を返す", () => {
    const session = saved();
    const result = recoverRejectedCheckout(session, key, { error: "SALES_PAUSED" }, { isNewPurchase: true });
    expect(result?.notice).toContain("この操作では注文・請求は始まっていません");
    expect(result?.session).toEqual({ ...session, attempt: null, viewKey: null });
    expect(session).toEqual(saved());
  });
  it("「同じ注文の決済へ戻る」からの場合（isNewPurchaseなし）は、前の試みで注文ができているかもしれないため消さない", () => {
    expect(recoverRejectedCheckout(saved(), key, { error: "SALES_PAUSED" })).toBeNull();
    expect(recoverRejectedCheckout(saved(), key, { error: "SALES_PAUSED" }, { isNewPurchase: false })).toBeNull();
  });
  it("orderMayExistが付いた想定外の形は扱わない", () => {
    expect(recoverRejectedCheckout(saved(), key, { error: "SALES_PAUSED", orderMayExist: false }, { isNewPurchase: true })).toBeNull();
    expect(recoverRejectedCheckout(saved(), key, { error: "SALES_PAUSED", orderMayExist: true }, { isNewPurchase: true })).toBeNull();
  });
  it("別の購入操作・中止確認中・支払い確認済みには、新しい鍵でも適用しない", () => {
    const body = { error: "SALES_PAUSED" }, session = saved();
    expect(recoverRejectedCheckout(session, "d".repeat(64), body, { isNewPurchase: true })).toBeNull();
    expect(recoverRejectedCheckout({ ...session, attempt: { ...session.attempt!, cancelRequested: true } }, key, body, { isNewPurchase: true })).toBeNull();
    expect(recoverRejectedCheckout({ ...session, attempt: { ...session.attempt!, settledOrderId: "dummy_paid" } }, key, body, { isNewPurchase: true })).toBeNull();
  });
});
describe("配送の問題と注文状態を分けて説明する", () => {
  it.each(["SHIPPING_REVIEW_REQUIRED", "SHIPPING_LIMIT_EXCEEDED"])("%sの見積と未確定注文を区別する", error => {
    expect(shippingFailureNotice({ error })).toContain("この見積操作では注文・請求は始まりません");
    expect(shippingFailureNotice({ error }, true)).toContain("買い直さず、同じ注文の状況を確認");
    expect(recoverRejectedCheckout(saved(), key, { error, orderMayExist: true })).toBeNull();
    expect(recoverRejectedCheckout(saved(), key, { error })).toBeNull();
  });
  it.each([null, {}, { error: "UNKNOWN", message: "<script>" }, { error: { toString() { throw new Error("NO_COERCION"); } } }])("未知の応答を表示・文字列化しない %#", body => {
    expect(shippingFailureNotice(body)).toBeNull();
  });
});
describe("一覧にない選択の整理", () => {
  it("表示されていない選択だけを、最後に見た名前で残す。価格や販売終了を推測しない", () => {
    const cart = [{ skuId: "beans", quantity: 2 }, { skuId: "unloaded", quantity: 1 }];
    expect(unlistedCartLines(cart, ["beans"], new Map())).toEqual([{ skuId: "unloaded", quantity: 1, label: "選択した商品 2" }]);
    const lines = unlistedCartLines(cart, [], new Map([["beans", "架空豆 100g"]]));
    expect(lines[0]).toEqual({ skuId: "beans", quantity: 2, label: "架空豆 100g" });
    expect(cart).toEqual([{ skuId: "beans", quantity: 2 }, { skuId: "unloaded", quantity: 1 }]);
  });
  it("表示商品を追加で読み込めたら、未表示リストから外す", () => {
    expect(unlistedCartLines(saved().cart, ["beans"], new Map())).toEqual([]);
  });
  it("未表示項目を削除でき、操作中は無効。名前はHTMLとして実行しない", () => {
    const lines = [{ skuId: "private_dummy_sku", label: "<script>架空</script>", quantity: 2 }];
    const html = renderToStaticMarkup(<UnlistedCartItems lines={lines} busy={false} onRemove={() => {}} />);
    expect(html).toContain("選択から外す"); expect(html).not.toContain("販売終了"); expect(html).not.toContain("<script>");
    expect(html).not.toContain("private_dummy_sku"); expect(html).not.toContain("disabled=");
    expect(renderToStaticMarkup(<UnlistedCartItems lines={lines} busy onRemove={() => {}} />)).toContain("disabled=");
    expect(renderToStaticMarkup(<UnlistedCartItems lines={[]} busy={false} onRemove={() => {}} />)).toBe("");
  });
});
