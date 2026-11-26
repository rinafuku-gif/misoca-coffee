import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { beanDisplaySchema, beanDisplayResponseSchema, catalogPageId, groupCatalogItems, joinCatalogWithDisplay, productGroup, type BeanDisplay } from "../bean-display";
import { BeanCard } from "../components/BeanCard";
import { BeanDetailModal } from "../components/BeanDetailModal";
import { CartDrawer } from "../components/CartDrawer";
import { drawerLines } from "../bean-cart";

const ids = { bean: "1a".repeat(16), drip: "2b".repeat(16), drip2: "3c".repeat(16), other: "4d".repeat(16) };
const empty = { name: "", origin: "", roast: "", flavor: "", process: "", variety: "", region: "", farm: "", altitude: "", description: "", image: "" as const };
const display = (id: string, category: BeanDisplay["category"], over: Partial<BeanDisplay> = {}): BeanDisplay => ({ id, ...empty, category, ...over });
const item = (skuId: string, name: string, unit: string, unitPrice: number) => ({ skuId, name, unit, unitPrice, kind: "physical" as const, maxQuantity: 5 });
const catalog = [
  item(`gd_${ids.other}_1`, "架空のその他", "1点", 1500),
  item(`bn_${ids.bean}_300`, "架空の豆", "300g・豆", 2700),
  item(`gd_${ids.drip}_1`, "架空ドリップA", "1袋", 250),
  item(`gd_${ids.drip2}_1`, "架空ドリップB", "1袋", 250),
];

describe("商品の種類で見出しを分ける", () => {
  it("gd_<32>_1 も表示データとつながる。ほかの形はつながらない", () => {
    expect(catalogPageId(`gd_${ids.drip}_1`)).toBe(ids.drip);
    expect(catalogPageId(`bn_${ids.bean}_300`)).toBe(ids.bean);
    for (const sku of [`gd_${ids.drip}_2`, `gd_${ids.drip}`, `gd_${ids.drip.toUpperCase()}_1`, `bn_${ids.bean}_1`]) expect(catalogPageId(sku)).toBeNull();
  });
  it("bn_ はコーヒー豆。gd_ は表示がドリップバッグならドリップバッグ、それ以外（表示なし・その他・豆・不明）はその他の商品", () => {
    expect(productGroup(`bn_${ids.bean}_300`, "ドリップバッグ")).toBe("beans");
    expect(productGroup(`bn_${ids.bean}_300`, undefined)).toBe("beans");
    expect(productGroup(`gd_${ids.drip}_1`, "ドリップバッグ")).toBe("drip");
    for (const category of [undefined, null, "その他", "豆"] as const) expect(productGroup(`gd_${ids.drip}_1`, category)).toBe("other");
    expect(productGroup("gift_ticket", undefined)).toBe("other");
  });
  it("見出しは コーヒー豆 → ドリップバッグ → その他の商品 の順。商品が無い見出しは出さない。中の順番はカタログのまま", () => {
    const joined = joinCatalogWithDisplay(catalog, [display(ids.drip, "ドリップバッグ"), display(ids.drip2, "ドリップバッグ"), display(ids.other, "その他")]);
    expect(groupCatalogItems(joined).map(group => [group.heading, group.items.map(i => i.name)])).toEqual([
      ["コーヒー豆", ["架空の豆"]], ["ドリップバッグ", ["架空ドリップA", "架空ドリップB"]], ["その他の商品", ["架空のその他"]],
    ]);
    expect(groupCatalogItems(joinCatalogWithDisplay(catalog.slice(2), [])).map(group => group.heading)).toEqual(["その他の商品"]);
    expect(groupCatalogItems([])).toEqual([]);
  });
  it("category は前の形の応答（項目なし）も読める。知らない値は受け付けない", () => {
    const { category: _omitted, ...legacy } = display(ids.bean, "豆"); void _omitted;
    expect(beanDisplayResponseSchema.safeParse({ items: [legacy] }).success).toBe(true);
    expect(beanDisplaySchema.safeParse(display(ids.bean, null)).success).toBe(true);
    expect(beanDisplaySchema.safeParse({ ...display(ids.bean, "豆"), category: "ギフト" }).success).toBe(false);
  });
});

describe("豆以外の商品の見せ方", () => {
  const drip = { ...catalog[2], display: display(ids.drip, "ドリップバッグ", { flavor: "架空の風味" }) };
  it("カード: 単位と値段はカタログの値（1袋・¥250）。焙煎度合・精製・品種の空の札を出さない", () => {
    const html = renderToStaticMarkup(<BeanCard item={drip} quantity={0} blocked={false} added={false} imageFailed={false} onImageError={() => {}} onOpen={() => {}} onAdd={() => {}} />);
    expect(html).toContain("¥250"); expect(html).toContain("/ 1袋"); expect(html).toContain("架空ドリップA 1袋をカートに入れる");
    expect(html).not.toContain("bg-konsumi/80"); // roast badge
    expect(html).not.toContain("border-karekusa/15"); // process/variety tags
    expect(html).not.toContain("300g");
  });
  it("詳細: 空の項目名（地域・農園・精製・品種・標高）を出さない。値があるものだけ出す", () => {
    const html = renderToStaticMarkup(<BeanDetailModal item={drip} quantity={0} blocked={false} added={false} imageFailed={false} onImageError={() => {}} onAdd={() => {}} onClose={() => {}} />);
    expect(html).toContain("架空ドリップA"); expect(html).toContain("¥250"); expect(html).toContain("/ 1袋");
    for (const label of ["地域", "農園", "精製", "品種", "標高"]) expect(html).not.toContain(`>${label}<`);
    expect(html).not.toContain("<dl");
    const withAltitude = renderToStaticMarkup(<BeanDetailModal item={{ ...drip, display: { ...drip.display, altitude: "1,000m" } }} quantity={0} blocked={false} added={false} imageFailed={false} onImageError={() => {}} onAdd={() => {}} onClose={() => {}} />);
    expect(withAltitude).toContain(">標高<"); expect(withAltitude).not.toContain(">精製<");
  });
  it("カート: 豆とドリップバッグを、それぞれの値段と単位で並べる（合計は計算しない）", () => {
    const lines = drawerLines([{ skuId: catalog[1].skuId, quantity: 1 }, { skuId: catalog[2].skuId, quantity: 2 }], catalog, new Map());
    const html = renderToStaticMarkup(<CartDrawer open lines={lines} count={3} busy={false} locked={false} stale={false} images={new Map()} failedImages={new Set()} onImageError={() => {}} onChange={() => {}} onClose={() => {}} onQuote={() => {}} />);
    expect(html).toContain("¥2,700 / 300g・豆"); expect(html).toContain("¥250 / 1袋"); expect(html).toContain("カート（3点）");
    for (const total of ["¥3,200", "¥500", "合計："]) expect(html).not.toContain(total);
  });
  it("購入画面は見出しを groupCatalogItems から出し、固定の「コーヒー豆」見出しを持たない", () => {
    const panel = readFileSync("src/features/shop/components/PurchasePanel.tsx", "utf8");
    expect(panel).toContain("groupCatalogItems(beans).map(group =>");
    expect(panel).not.toContain(">コーヒー豆</h2>");
  });
});
