import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CheckoutCancellationPanel } from "../components/CheckoutCancellationPanel";
import type { BuyerStatus } from "../purchaser-status";

const key = "a".repeat(64);
describe("支払状態に合った変更・取消の案内", () => {
  it.each([undefined, "waiting"] as const)("未払い・未確認の既存経路は中止内容の確認を残す %s", payment => {
    const html = renderToStaticMarkup(<CheckoutCancellationPanel purchaseKey={key} payment={payment} />);
    expect(html).toContain("決済中止の内容を確認");
    expect(html).toContain("未払いの決済受付");
    expect(html).not.toContain(key);
  });
  it.each(["confirmed", "under_review", "refunded", "partially_refunded"] as const)("%sでは未払い中止ボタンを出さず問い合わせを案内", payment => {
    const html = renderToStaticMarkup(<CheckoutCancellationPanel purchaseKey={key} payment={payment} />);
    expect(html).toContain("注文の変更・取消について");
    expect(html).toContain("店舗へお問い合わせ");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("未払いの決済受付");
    expect(html).toContain("メールの自動送信は行いません");
  });
  it("支払済みで古い中止依頼が残っても再送ボタンを出さない", () => {
    const html = renderToStaticMarkup(<CheckoutCancellationPanel purchaseKey={key} payment="confirmed" pending state="checking" />);
    expect(html).toContain("取消・返金が完了したという意味ではありません");
    expect(html).not.toContain("<button");
  });
  it("決済終了だけの場合は重複した中止欄を表示しない", () => {
    expect(renderToStaticMarkup(<CheckoutCancellationPanel purchaseKey={key} payment="closed" />)).toBe("");
  });
  it.each(["waiting", "confirmed", "refunded"] as const)("%sでも確認済みの中止結果と店舗確認は隠さない", payment => {
    for (const state of ["closed", "payment_review"] as BuyerStatus["cancellation"][]) {
      const html = renderToStaticMarkup(<CheckoutCancellationPanel purchaseKey={key} payment={payment} state={state} />);
      expect(html).toContain(state === "closed" ? "決済中止の結果" : "店舗での確認が必要です");
      expect(html).not.toContain("<button");
    }
  });
});
