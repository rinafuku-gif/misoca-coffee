import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import YuzuPage from "../shop/uenohara-yuzu/page";
import { metadata } from "../shop/uenohara-yuzu/layout";
import { statSync } from "node:fs";
import { enjoyCopy, faqItems, heroCopy, yuzuPagePhotos, yuzuProducts } from "../shop/uenohara-yuzu/yuzu-lp-content";
import { yuzuCartAction, yuzuPriceView, type CatalogState } from "../shop/uenohara-yuzu/yuzu-catalog";
import { isShopItemSku, shopItemTarget } from "@/features/shop/shop-item-link";
import { readFileSync } from "node:fs";
import { pickupInstagramHref, pickupPlace } from "@/features/shop/receiving-method";

const html = renderToStaticMarkup(<YuzuPage />);
// 画面に出る部分だけ（検索向けのデータは除く）
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
const sectionIds = [...visible.matchAll(/<section aria-labelledby="([^"]+)"/g)].map(match => match[1]);
const BEAN_SKU = "bn_2c30f0fdafad802f83a2dccc697c564e_300";

describe("ゆずインフューズドコーヒー（ドリップバッグ・焙煎豆300g）を売るページ", () => {
  it("最初の画面で、ドリップバッグと焙煎豆300gから選べる。名前・量・値段・「カートに入れる」がある", () => {
    const first = visible.slice(0, visible.indexOf('aria-labelledby="yuzu-taste"'));
    expect(first).toContain('ドリップバッグ<span class="inline-block">（1杯分・10g）</span>');
    expect(first).toContain("1袋／中浅煎り");
    expect(first).toContain('焙煎豆<span class="inline-block">（300g）</span>');
    expect(first).toContain("300g・豆／中浅煎り");
    expect(first).toContain("ドリップバッグ1袋と同じ10gで1杯淹れると、約30杯分。");
    // JavaScript なしで読んだときは書いてある値段（ショップの値と同じ）
    expect(first).toContain(">¥250<"); expect(first).toContain(">¥3,000<");
    expect(first).toContain('href="/shop?item=yuzu-drip-bag&amp;add=1"');
    expect(first).toContain(`href="/shop?item=${BEAN_SKU}&amp;add=1"`);
    expect(first.indexOf('aria-label="ドリップバッグをカートに入れる"')).toBeLessThan(first.indexOf('aria-label="焙煎豆（300g）をカートに入れる"'));
  });

  it("節の順番：買う → 味 → 作り方 → 飲み方 → もう一度買う → 質問 → 最後に三十日珈琲について", () => {
    expect(sectionIds).toEqual(["yuzu-title", "yuzu-taste", "yuzu-process", "yuzu-enjoy", "yuzu-buy-again", "yuzu-faq", "yuzu-about"]);
    // 「カートに入れる」は2か所×2商品。どれもショップのカートに入れて開くリンク（ショップの先頭へは送らない）
    expect(visible.match(/>カートに入れる</g)).toHaveLength(4);
    expect(visible.match(/href="\/shop\?item=yuzu-drip-bag&amp;add=1"/g)).toHaveLength(2);
    expect(visible.match(new RegExp(`href="/shop\\?item=${BEAN_SKU}&amp;add=1"`, "g"))).toHaveLength(2);
    expect(visible).not.toContain('href="/shop"');
    expect(visible).not.toMatch(/を買う</);
    expect(html.indexOf('href="/about"')).toBeGreaterThan(html.indexOf('aria-labelledby="yuzu-faq"'));
  });

  it("豆のリンクは、ショップが欄まで送る商品IDの形。ショップに無いときはコーヒー豆の見出しへ", () => {
    const beans = yuzuProducts.find(product => product.key === "beans")!;
    expect(beans.ref).toBe(BEAN_SKU);
    expect(isShopItemSku(beans.ref)).toBe(true);
    expect(shopItemTarget(beans.ref, [{ skuId: BEAN_SKU, name: beans.shopName }])).toEqual({ sku: BEAN_SKU });
    expect(shopItemTarget(beans.ref, [])).toEqual({ group: "beans" });
  });

  it("画面の値段はショップと同じ商品一覧から読む。読めないときだけ書いてある値段、並んでいない・在庫なしは値段を出さない", () => {
    const catalog = readFileSync("src/app/shop/uenohara-yuzu/yuzu-catalog.tsx", "utf8");
    expect(catalog).toContain("readPurchaseCatalog()");
    expect(catalog).toContain('from "@/features/shop/purchase-catalog"');
    const drip = { skuId: "gd_" + "4".repeat(32) + "_1", name: "ドリップバッグ（ゆずインフューズド）", unitPrice: 280, maxQuantity: 20 };
    const bean = { skuId: BEAN_SKU, name: "上野原産ゆずインフューズド (kenya)", unitPrice: 3200, maxQuantity: 20 };
    expect(yuzuPriceView(null, "yuzu-drip-bag", 250)).toEqual({ kind: "price", price: 250 });
    expect(yuzuPriceView([drip, bean], "yuzu-drip-bag", 250)).toEqual({ kind: "price", price: 280 });
    expect(yuzuPriceView([drip, bean], BEAN_SKU, 3000)).toEqual({ kind: "price", price: 3200 });
    expect(yuzuPriceView([drip], BEAN_SKU, 3000)).toEqual({ kind: "notListed" });
    expect(yuzuPriceView([{ ...bean, maxQuantity: 0 }], BEAN_SKU, 3000)).toEqual({ kind: "soldOut" });
  });

  it("「カートに入れる」の扱いはショップと同じ：在庫なし・一覧を読めないときは押せない、並んでいないときはショップで見るだけ", () => {
    const catalog = (items: { skuId: string; name: string; maxQuantity: number }[], acceptingOrders = true): CatalogState => ({ state: "ready", catalog: { items: items.map(item => ({ ...item, unit: "1袋", unitPrice: 250, kind: "physical" as const })), nextOffset: null, acceptingOrders, deliveryMethods: undefined, reception: undefined } });
    const drip = { skuId: "gd_" + "4".repeat(32) + "_1", name: "ドリップバッグ（ゆずインフューズド）", maxQuantity: 20 };
    const bean = { skuId: BEAN_SKU, name: "上野原産ゆずインフューズド (kenya)", maxQuantity: 20 };
    expect(yuzuCartAction({ state: "loading" }, BEAN_SKU)).toBe("add");
    expect(yuzuCartAction({ state: "failed" }, BEAN_SKU)).toBe("unavailable");
    expect(yuzuCartAction(catalog([drip, bean]), "yuzu-drip-bag")).toBe("add");
    expect(yuzuCartAction(catalog([drip, bean]), BEAN_SKU)).toBe("add");
    expect(yuzuCartAction(catalog([drip, { ...bean, maxQuantity: 0 }]), BEAN_SKU)).toBe("soldOut");
    expect(yuzuCartAction(catalog([drip]), BEAN_SKU)).toBe("notListed");
    // 受付を止めているときもショップと同じ：カートには入れられる（案内の一文を出す）
    expect(yuzuCartAction(catalog([drip, bean], false), BEAN_SKU)).toBe("add");
    const source = readFileSync("src/app/shop/uenohara-yuzu/yuzu-catalog.tsx", "utf8");
    expect(source).toContain('receptionPauseNotice(value.catalog.reception) ?? "現在は注文を受け付けていません。金額の確認はできますが、決済へは進めません。"');
    expect(readFileSync("src/features/shop/components/PurchasePanel.tsx", "utf8")).toContain('"現在は注文を受け付けていません。金額の確認はできますが、決済へは進めません。"');
    // カートの保存には触らない（入れるのはショップ自身の「カートに入れる」）
    for (const word of ["sessionStorage", "writePurchaseSession", "readPurchaseSession"]) expect(source, word).not.toContain(word);
  });

  it("ゆずの写真は、ショップの焙煎豆の欄と同じ出どころから読む（二重に保存しない）。読めないときは何も出さない", () => {
    const source = readFileSync("src/app/shop/uenohara-yuzu/yuzu-catalog.tsx", "utf8");
    expect(source).toContain("readBeanDisplays(controller.signal)");
    expect(source).toContain("beanPageId(product)");
    expect(source).toContain("<ProductPhoto image={image}");
    expect(source).toContain("if (!image || failed) return null;");
    // JavaScript なしで読んだときは写真の枠も出ない（崩れない）
    const process = visible.slice(visible.indexOf('aria-labelledby="yuzu-process"'), visible.indexOf('aria-labelledby="yuzu-enjoy"'));
    expect(process).not.toContain("notion-image");
    expect(yuzuPagePhotos.harvestAlt).toContain("ゆず");
  });

  it("よくある質問に、豆のまま（粉は並んでいない）・豆の保存・注文後に焙煎を、サイトの文で答える", () => {
    const faq = visible.slice(visible.indexOf('aria-labelledby="yuzu-faq"'));
    expect(faq).toContain("ショップで選べるのは豆のまま（300g・豆）で、粉に挽いたものは並んでいません。");
    expect(faq).toContain("保管は冷暗所で十分です。冷凍もできます。コーヒー豆がおいしく飲めるのは、焙煎からおよそ1か月です。");
    expect(faq).toContain("焙煎豆は、ご注文をいただいてから焙煎することを基本にしています。");
    expect(faq).toContain("「コーヒー豆」の欄の「上野原産ゆずインフューズド (kenya)」");
    // 豆の淹れ方の分量は書かない（カードの分量はドリップバッグのもの）
    const enjoy = visible.slice(visible.indexOf('aria-labelledby="yuzu-enjoy"'), visible.indexOf('aria-labelledby="yuzu-buy-again"'));
    expect(enjoy).toContain("ドリップバッグの淹れ方");
    expect(enjoy).toContain("焙煎豆は、ハンドドリップやエアロプレスなど、お好みの抽出方法でどうぞ。");
  });

  it("準備中の商品や別の売り場への案内を出さない", () => {
    for (const text of ["準備中", "ふるさと納税", "取扱店舗", "ギフト箱", "3個セット", "焙煎豆 100g", "/experience"]) expect(html).not.toContain(text);
  });

  it("焙煎体験・景色・使わない写真を載せない", () => {
    const images = [...html.matchAll(/(?:src|srcSet)="([^"]+)"/g)].map(match => decodeURIComponent(match[1]));
    expect(images.length).toBeGreaterThan(0);
    for (const src of images) {
      expect(src).not.toMatch(/about\/|experience\/(?!coffee-beans-close)|hero\/|stand\//);
    }
  });

  it("確かめられない言い切りを書かない", () => {
    for (const text of ["人気", "完売", "受賞", "No.1", "贅沢", "健康"]) expect(html).not.toContain(text);
  });

  it("よくある質問の答えは、検索向けのデータにも同じ文で入る", () => {
    for (const item of faqItems) expect(html).toContain(JSON.stringify(item.a).slice(1, -1).replace(/</g, "\\u003c"));
  });

  it("受け取り方の答えは、購入画面と同じ店頭受け取りの文。「Instagram」はコーヒースタンドのアカウントへのリンク（新しいタブ）", () => {
    const answer = faqItems.find(item => item.q.includes("受け取り方"))!.a;
    expect(answer).toContain(`${pickupPlace.name}・${pickupPlace.access}・コーヒースタンドの営業日の${pickupPlace.days}`);
    expect(answer.endsWith(`${pickupPlace.latest}。`)).toBe(true);
    const links = [...visible.matchAll(/<a [^>]*href="https:\/\/www\.instagram\.com\/[^"]*"[^>]*>Instagram<\/a>/g)].map(match => match[0]);
    expect(links).toHaveLength(1);
    expect(links[0]).toContain(`href="${pickupInstagramHref}"`);
    expect(links[0]).toContain('target="_blank"');
    expect(links[0]).toContain('rel="noopener noreferrer"');
    expect(visible).toContain("営業日の最新情報は ");
  });

  it("最初の画面に、実際に印刷したカードの表と裏を出す（何を買うのかがひと目で分かる）", () => {
    const first = visible.slice(0, visible.indexOf('aria-labelledby="yuzu-taste"'));
    for (const card of [yuzuPagePhotos.cardFront, yuzuPagePhotos.cardBack]) {
      expect(first).toContain(encodeURIComponent(card.src));
      expect(first).toContain(`alt="${card.alt.replace(/&/g, "&amp;")}"`);
      const file = statSync(`public${card.src}`);
      expect(file.size).toBeLessThan(400 * 1024);
    }
    expect(first).toContain("ドリップバッグのカード（表）");
    expect(first).not.toContain(encodeURIComponent(yuzuPagePhotos.pour.src));
    expect(first).toContain("ドリップバッグのカード（裏）");
    expect(html).toContain(`"image":"https://misoca-coffee.vercel.app${yuzuPagePhotos.cardFront.src}"`);
  });

  it("文はカードの裏面と食い違わない。淹れ方はカードの言葉どおり（温度は書かない）", () => {
    expect(heroCopy.lead.startsWith("山梨県上野原市のゆずをコーヒーの生豆に漬け込み、香りを移してから焙煎しました。")).toBe(true);
    expect(visible).toContain("袋を開けた瞬間に立ちのぼる、ゆずのやさしい気配。");
    expect(visible).toContain("軽やかで香り高い一杯です。");
    expect(enjoyCopy.brew.steps).toEqual([{ term: "お湯", value: "160ml" }, { term: "蒸らし", value: "30秒" }, { term: "抽出", value: "3分" }]);
    const enjoy = visible.slice(visible.indexOf('aria-labelledby="yuzu-enjoy"'), visible.indexOf('aria-labelledby="yuzu-buy-again"'));
    for (const value of ["160ml", "30秒", "3分"]) expect(enjoy).toContain(value);
    expect(enjoy).not.toMatch(/℃|度のお湯/);
  });

  it("このページ自身を正規のURLにする", () => {
    expect(metadata.alternates?.canonical).toBe("https://misoca-coffee.vercel.app/shop/uenohara-yuzu");
    expect(String(metadata.title)).toContain("ドリップバッグ");
  });
});
