import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import YuzuPage from "../shop/uenohara-yuzu/page";
import { metadata } from "../shop/uenohara-yuzu/layout";
import { statSync } from "node:fs";
import { enjoyCopy, faqItems, heroCopy, yuzuPagePhotos } from "../shop/uenohara-yuzu/yuzu-lp-content";
import { pickupInstagramHref, pickupPlace } from "@/features/shop/receiving-method";

const html = renderToStaticMarkup(<YuzuPage />);
// 画面に出る部分だけ（検索向けのデータは除く）
const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
const sectionIds = [...visible.matchAll(/<section aria-labelledby="([^"]+)"/g)].map(match => match[1]);

describe("ゆずインフューズドのドリップバッグを売るページ", () => {
  it("最初の画面に、商品名・量・値段・買うボタンがある", () => {
    const first = visible.slice(0, visible.indexOf('aria-labelledby="yuzu-taste"'));
    expect(first).toContain('ドリップバッグ<span class="inline-block">（ゆずインフューズド）</span>');
    expect(first).toContain('1袋（1杯分・10g）<span class="inline-block">／中浅煎り</span>');
    expect(first).toContain("¥250");
    expect(first).toContain('href="/shop?item=yuzu-drip-bag"');
    expect(first).toContain("オンラインショップで買う");
  });

  it("節の順番：買う → 味 → 作り方 → 飲み方 → もう一度買う → 質問 → 最後に三十日珈琲について", () => {
    expect(sectionIds).toEqual(["yuzu-title", "yuzu-taste", "yuzu-process", "yuzu-enjoy", "yuzu-buy-again", "yuzu-faq", "yuzu-about"]);
    expect(html.match(/オンラインショップで買う/g)).toHaveLength(2);
    // 2つの買うボタンは、どちらもショップのこの商品の欄へ送るリンク
    expect(visible.match(/href="\/shop\?item=yuzu-drip-bag"/g)).toHaveLength(2);
    expect(visible).not.toContain('href="/shop"');
    expect(html.indexOf('href="/about"')).toBeGreaterThan(html.indexOf('aria-labelledby="yuzu-faq"'));
  });

  it("売るのはドリップバッグだけ。準備中の商品や別の売り場への案内を出さない", () => {
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
    expect(first).toContain("パッケージのカード（表）");
    expect(first).not.toContain(encodeURIComponent(yuzuPagePhotos.pour.src));
    expect(first).toContain("パッケージのカード（裏）");
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
