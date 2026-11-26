import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// 再開後の見え方だけをここで確かめる。共通設定の値そのものは変えない。
vi.mock("@/features/shop/policy", async importOriginal => ({
  ...await importOriginal<typeof import("../policy")>(), SHOP_PAUSED: false,
}));

const heading = "オンラインで頼むと、いいこと";

describe("販売を再開した後のショップのページ", () => {
  it("購入の画面の下に「オンラインで頼むと、いいこと」の段が1回だけ続く", async () => {
    const { default: ShopPage } = await import("@/app/shop/page");
    const html = renderToStaticMarkup(<ShopPage />);
    const panel = html.indexOf("珈琲を選ぶ"), panelEnd = html.indexOf("</main>"), section = html.indexOf(heading);
    expect(panel).toBeGreaterThan(-1);
    expect(panelEnd).toBeGreaterThan(panel);
    expect(section).toBeGreaterThan(panelEnd);
    expect(html.split(heading)).toHaveLength(2);
    expect(html).toContain("送料は全国どこでも¥370");
    // 休止中の商品案内（ShopCatalog）は出さない。
    expect(html).not.toContain("焙煎豆の通販を一時お休みさせていただきます");
    expect(html).not.toContain("配送について");
  });
  it("ページの組み立ては、休止中は ShopCatalog、再開後は PurchasePanel の直後に WhyOnline を置く", () => {
    const page = readFileSync(resolve("src/app/shop/page.tsx"), "utf8");
    expect(page).toContain("SHOP_PAUSED ? <ShopCatalog /> : <><PurchasePanel shopRoot /><WhyOnline /></>");
  });
  it("共通設定のファイルは再開済み（2026-11-26 店主の指示）", () => {
    expect(readFileSync(resolve("src/features/shop/policy.ts"), "utf8")).toContain("export const SHOP_PAUSED = false;");
  });
});
