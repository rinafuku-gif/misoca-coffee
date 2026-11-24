import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PurchaseConditions, PurchaseLegalLinks, purchaseConditions } from "../components/PurchaseTerms";
import { purchaserStatusSchema, showsShippingWindow } from "../purchaser-status";

const read = (path: string) => readFileSync(resolve(path), "utf8");

describe("購入の前に見せるお届けと返品の条件", () => {
  it("発送と返品の文は、公開している利用規約と一字も違わない", () => {
    const terms = read("src/app/terms/page.tsx");
    for (const sentence of [purchaseConditions.shipping, purchaseConditions.customerReturn, purchaseConditions.defect]) {
      expect(terms).toContain(sentence);
    }
  });
  it("特定商取引法の表記と、発送の目安・連絡先が食い違わない", () => {
    const legal = read("src/app/tokushoho/page.tsx");
    expect(legal).toContain("7日以内に発送");
    expect(purchaseConditions.shipping).toContain("7日以内に発送");
    expect(legal).toContain(purchaseConditions.contact);
    expect(legal).toContain(purchaseConditions.paymentMethod);
  });
  it("発送・返品・問い合わせ先と、3つの案内ページへ届く", () => {
    const html = renderToStaticMarkup(<PurchaseConditions />);
    for (const text of [purchaseConditions.paymentMethod, purchaseConditions.shipping, purchaseConditions.customerReturn, purchaseConditions.defect, `mailto:${purchaseConditions.contact}`]) {
      expect(html).toContain(text);
    }
    for (const href of ["/tokushoho", "/terms", "/privacy"]) {
      const anchor = new RegExp(`<a [^>]*href="${href}"[^>]*>`).exec(html)?.[0] ?? "";
      expect(anchor).toContain('target="_blank"');
      expect(anchor).toContain('rel="noopener noreferrer"');
    }
  });
  it("送料や金額を固定の文字で書かない（金額は見積もりの表示だけに任せる）", () => {
    const html = renderToStaticMarkup(<><PurchaseConditions /><PurchaseLegalLinks /></>);
    expect(html).not.toMatch(/[¥￥]|\d+\s*円/);
  });
  it("購入画面では、合計の後・確認のチェックの前に条件を出す", () => {
    const panel = read("src/features/shop/components/PurchasePanel.tsx");
    const total = panel.indexOf("<dt>合計</dt>");
    const conditions = panel.indexOf("<PurchaseConditions />");
    const confirm = panel.indexOf("商品・数量と、送料を含む合計を確認しました");
    expect(total).toBeGreaterThan(-1);
    expect(conditions).toBeGreaterThan(total);
    expect(confirm).toBeGreaterThan(conditions);
    expect(panel).toContain("<PurchaseLegalLinks />");
  });
  it("注文状況の画面は main を1つだけ持ち、案内ページへのリンクを置く", () => {
    const status = read("src/features/shop/components/PurchaserStatusPanel.tsx");
    expect(status.match(/<main[ >]/g)).toHaveLength(1);
    expect(status).toContain("<PurchaseLegalLinks />");
    const html = renderToStaticMarkup(<PurchaseLegalLinks />);
    expect(html).toContain('aria-label="お取引に関する案内"');
  });
  it("注文状況の画面は、支払いが確認済みで発送前のときだけ、規約と同じ発送の目安を添える", () => {
    const payments = purchaserStatusSchema.shape.payment.options, physicals = purchaserStatusSchema.shape.physical.options;
    const shown = payments.flatMap(payment => physicals.filter(physical => showsShippingWindow({ payment, physical })).map(physical => `${payment}:${physical}`));
    expect(shown.sort()).toEqual(["confirmed:awaiting_preparation", "confirmed:packed", "confirmed:preparing"]);
    expect(showsShippingWindow({ payment: "refunded", physical: "packed" })).toBe(false);
    expect(showsShippingWindow({ payment: "waiting", physical: "awaiting_preparation" })).toBe(false);
    expect(showsShippingWindow({ payment: "confirmed", physical: "replacement_preparing" })).toBe(false);
    const status = read("src/features/shop/components/PurchaserStatusPanel.tsx");
    expect(status).toContain("{physicalCopy[data.physical]}</dd>{showsShippingWindow(data) ? <dd");
    expect(status.match(/purchaseConditions\.shipping/g)).toHaveLength(1);
    expect(status.match(/showsShippingWindow\(/g)).toHaveLength(1);
    expect(status).not.toContain("7日以内");
  });
});
