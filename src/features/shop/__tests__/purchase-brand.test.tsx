import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PurchaseBrandHeader, PurchaseSelectionSummary, purchaseUi } from "../components/PurchaseBrand";
import { ProductPublicationDetails } from "../components/ProductPublicationDetails";

const publication = { slug: "dummy-beans", content: { name: "架空豆", origin: "架空産地", farm: "", variety: "", process: "架空精製", description: "<script>架空の説明</script>" } };
describe("購入画面のブランドと商品情報", () => {
  it("未選択なら商品選びを案内し、選択後だけ金額確認へ案内する", () => {
    const empty = renderToStaticMarkup(<PurchaseSelectionSummary count={0} />);
    expect(empty).toContain("選ぶだけでは注文されません");
    expect(empty).not.toContain('href="#purchase-summary"');
    const selected = renderToStaticMarkup(<PurchaseSelectionSummary count={2} />);
    expect(selected).toContain("2点");
    expect(selected).toContain('href="#purchase-summary"');
    expect(selected).toContain('aria-live="polite"');
    expect(selected).not.toContain("支払い済み");
    expect(selected).not.toContain("¥");
  });
  it("主操作は金色、補助操作は枯草色の枠線で、角丸カードへ戻さない", () => {
    expect(purchaseUi.primary).toContain("bg-gold ");
    expect(purchaseUi.primary).toContain("text-sumi ");
    expect(purchaseUi.primary).toContain("rounded-none");
    expect(purchaseUi.secondary).toContain("border-karekusa/30");
    expect(purchaseUi.secondary).toContain("bg-transparent");
    for (const control of [purchaseUi.primary, purchaseUi.secondary]) {
      expect(control).toContain("min-h-12");
      expect(control).toContain("focus-visible:outline-2");
      expect(control).toContain("disabled:cursor-not-allowed");
    }
  });
  it("金色の操作ラベルは通常・hoverとも本文のコントラスト4.5以上", () => {
    const luminance = (hex: string) => {
      const channels = hex.match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    expect((luminance("C8973E") + 0.05) / (luminance("2A2A2A") + 0.05)).toBeGreaterThanOrEqual(4.5);
    expect(purchaseUi.primary).not.toMatch(/hover:(bg-|text-)/);
  });
  it("購入入口だけに既存ショップ写真を置き、商品実物と誤認させない", () => {
    const html = renderToStaticMarkup(<PurchaseBrandHeader title="珈琲を選ぶ" description="数量を選ぶ" shopIntroduction />);
    expect(html).toContain("coffee-beans-close.jpg");
    expect(html).toContain("各商品の実物写真ではありません");
    expect(html).toContain("三十日珈琲 Shared Roasting");
    expect(html).toContain("ショップの案内へ戻る");
    expect(html).toContain("py-16 md:py-24");
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(renderToStaticMarkup(<PurchaseBrandHeader title="注文確認" description="状況" />)).not.toContain("coffee-beans-close.jpg");
  });
  it("選ぶ時点の説明と産地は開閉なしで読み、空欄や架空の情報を足さない", () => {
    const html = renderToStaticMarkup(<ProductPublicationDetails publication={publication} />);
    expect(html).toContain("架空産地"); expect(html).toContain("架空精製");
    expect(html).not.toContain("<details"); expect(html).not.toContain("農園");
    expect(html).toContain("&lt;script&gt;"); expect(html).not.toContain("<script>");
    expect(renderToStaticMarkup(<ProductPublicationDetails />)).toBe("");
  });
  it("通常ショップでは共通ヘッダーに任せ、二重のブランド欄や自己リンクを出さない", () => {
    const html = renderToStaticMarkup(<PurchaseBrandHeader title="珈琲を選ぶ" description="数量を選ぶ" shopRoot />);
    expect(html).not.toContain("logo-circle-green.jpg");
    expect(html).toContain("珈琲を選ぶ");
    expect(html).not.toContain('href="/shop"');
    expect(html).not.toContain("ショップの案内へ戻る");
  });
  it("購入後の商品説明は当時の記録として分けたまま", () => {
    const html = renderToStaticMarkup(<ProductPublicationDetails publication={publication} purchased />);
    expect(html).toContain("<details"); expect(html).toContain("注文時点の商品説明");
    expect(html).toContain("この注文の内容は変えません");
  });
});
