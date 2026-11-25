import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { WhyOnline } from "../components/WhyOnline";
import { SHOP_PAUSED } from "../policy";
import ShopPage from "@/app/shop/page";

const read = (path: string) => readFileSync(resolve(path), "utf8");

const heading = "オンラインで頼むと、いいこと";
const items = [
  ["あなたの注文のために焙煎します", "三十日珈琲は、ご注文をいただいてから焙煎することを基本にしています。そのため発送まで7日以内のお時間をいただきますが、届くのは焙煎したての豆です。"],
  ["少しずつ、ていねいに", "焙煎機に入れるのは、一度に最大1kgまで。温度の記録を見ながら、豆ごとの個性に合わせて仕上げます。"],
  ["飲みごろの1か月を、最初から", "コーヒー豆がおいしく飲めるのは、焙煎からおよそ1か月。焙煎したてで届くから、ひと月かけて変わっていく風味を、はじめから楽しめます。保管は冷暗所で十分。冷凍もできます。"],
  ["ポストに届きます", "発送から1〜3日でお届け。ポスト投函なので、受け取りを待つ必要はありません。"],
  ["送料は全国どこでも¥370", "¥5,000以上のご注文で送料無料です。"],
  ["上野原に来られない月も", "焙煎体験で使っているのと同じスペシャルティコーヒーを、ご自宅でどうぞ。"],
] as const;

describe("ショップの「オンラインで頼むと、いいこと」の段", () => {
  it("見出しと、6つの項目の見出し・文を、決めた文面と順番のまま出す", () => {
    const html = renderToStaticMarkup(<WhyOnline />);
    expect([...html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map(match => match[1])).toEqual([heading]);
    expect([...html.matchAll(/<h3[^>]*>([^<]*)<\/h3>/g)].map(match => match[1])).toEqual(items.map(([title]) => title));
    const bodies = [...html.matchAll(/<p class="text-sm text-haicha[^"]*">([^<]*)<\/p>/g)].map(match => match[1]);
    expect(bodies).toEqual(items.map(([, body]) => body));
    expect(html).toContain("Why Online");
  });
  it("送料の書き方は、隣の「配送について」の段と同じ「¥」にそろえる", () => {
    const html = renderToStaticMarkup(<WhyOnline />);
    expect(html).not.toMatch(/\d\s*円/);
    const catalog = read("src/features/shop/components/ShopCatalog.tsx");
    expect(catalog).toContain("全国一律 ¥370");
    expect(catalog).toContain("¥5,000以上で送料無料");
  });
  it("販売を休止している間は、ショップのページの「配送について」の段の直前に1回だけ出す", () => {
    expect(SHOP_PAUSED).toBe(true);
    const catalog = read("src/features/shop/components/ShopCatalog.tsx");
    expect(catalog.match(/<WhyOnline \/>/g)).toHaveLength(1);
    const section = catalog.indexOf("<WhyOnline />");
    const shipping = catalog.indexOf("配送について");
    expect(section).toBeGreaterThan(-1);
    expect(shipping).toBeGreaterThan(section);
    expect(catalog.slice(section, shipping).match(/<section[ >]/g)).toHaveLength(1);
    // 実際に /shop のページを描画しても、休止のお知らせ・新しい段・配送についての順に1回ずつ出る。
    const html = renderToStaticMarkup(<ShopPage />);
    expect(html.split(heading)).toHaveLength(2);
    expect(html.indexOf("焙煎豆の通販を一時お休みさせていただきます")).toBeGreaterThan(-1);
    expect(html.indexOf(heading)).toBeGreaterThan(html.indexOf("焙煎豆の通販を一時お休みさせていただきます"));
    expect(html.indexOf("配送について")).toBeGreaterThan(html.indexOf(heading));
  });
  it("30日分の容量の案内は、この段に入れない", () => {
    const html = renderToStaticMarkup(<WhyOnline />);
    expect(html).not.toContain("30日分");
  });
});
