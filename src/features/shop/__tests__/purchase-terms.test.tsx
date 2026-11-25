import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PurchaseConditions, PurchaseLegalLinks, purchaseConditions } from "../components/PurchaseTerms";
import { purchaserStatusSchema } from "../purchaser-status";
import { showsShippingWindow } from "../receiving-method";
import TokushohoPage from "@/app/tokushoho/page";

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
  it("特定商取引法の表記は、メールアドレスの次に電話番号の行を置き、引き渡し時期を決めた文面で出す", () => {
    const html = renderToStaticMarkup(<TokushohoPage />);
    const rows = [...html.matchAll(/<dt[^>]*>([^<]*)<\/dt><dd[^>]*>([^<]*)<\/dd>/g)].map(row => [row[1], row[2]]);
    expect(rows).toEqual([
      ["販売業者", "三十日珈琲（稲福良祐・後藤伸啓）"],
      ["所在地", "〒409-0115 山梨県上野原市松留939"],
      ["メールアドレス", "misocacoffee@gmail.com"],
      ["電話番号", "ご請求いただければ、遅滞なく開示いたします"],
      ["販売価格", "各商品ページに記載"],
      ["受け取り方法", "配送のほか、上野原市内お届け・店頭受け取りは、購入画面で選べるときにご利用いただけます"],
      ["送料", "全国一律 ¥370（¥5,000以上で送料無料）。上野原市内お届け・店頭受け取りは無料"],
      ["お支払い方法", "クレジットカード（Stripe）"],
      ["商品の引き渡し時期", "ご注文をいただいてから焙煎するため、注文確定後7日以内に発送します。上野原市内お届けは7日以内にポストへお届けします。店頭受け取りは7日以内にご用意し、メールでお知らせしたあとの営業日にお渡しします"],
      ["店頭受け取りの場所", "見晴亭（〒409-0113 山梨県上野原市新田1053-3）。毎週水曜 8:00〜9:30／10:30〜16:00。営業日の最新情報は Instagram でご確認ください"],
      ["返品・交換", "商品到着後7日以内にご連絡ください（店頭受け取りは、お受け取り後7日以内）"],
    ]);
    // 長いメールアドレスも、狭い画面で白い枠の中に折り返す。
    expect(html.match(/<dd class="text-sumi min-w-0 break-words">/g)).toHaveLength(rows.length);
  });
  it("購入画面の発送の欄は、規約と同じ文のすぐ後ろに理由の一文を続け、注文状況の画面には足さない", () => {
    expect(purchaseConditions.shippingReason).toBe("焙煎したてをお届けするため、少しお時間をいただいています。");
    const html = renderToStaticMarkup(<PurchaseConditions />);
    expect(html).toContain(`<dt class="text-haicha">発送</dt><dd>${purchaseConditions.shipping}${purchaseConditions.shippingReason}</dd>`);
    expect(read("src/features/shop/components/PurchaserStatusPanel.tsx")).not.toContain("shippingReason");
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
    const conditions = panel.indexOf("<PurchaseConditions method={quotedMethod} />");
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
    expect(status).toContain("{physical.text}</dd>{showsShippingWindow(status) ? <dd");
    expect(status.match(/purchaseConditions\.shipping/g)).toHaveLength(1);
    expect(status.match(/showsShippingWindow\(/g)).toHaveLength(1);
    expect(status).not.toContain("7日以内");
  });
});
