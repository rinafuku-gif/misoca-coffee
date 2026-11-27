import { describe, expect, it } from "vitest";
import { homeShopLineup } from "../home-shop-lineup";
import { findShopItem, isShopItemSku, readShopItemKey, shopItemHref, shopItemHrefFor, shopItemTarget } from "../shop-item-link";

const id = (c: string) => c.repeat(32);
const bean = (c: string, name: string, maxQuantity = 5) => ({ skuId: `bn_${id(c)}_300`, name, maxQuantity });
const goods = (c: string, name: string, maxQuantity = 5) => ({ skuId: `gd_${id(c)}_1`, name, maxQuantity });
const yuzu = goods("c", "ドリップバッグ（ゆずインフューズド）");
const blend = goods("b", "ドリップバッグ（三十日ブレンド）");
const [a, b, c, d] = [bean("1", "豆A"), bean("2", "豆B"), bean("3", "豆C"), bean("4", "豆D")];

describe("トップページの ONLINE SHOP に出す商品（ショップと同じ商品一覧から3つまで）", () => {
  it("ゆずのドリップバッグを先頭に、残りは焙煎豆をショップの並びの先頭から2つ", () => {
    expect(homeShopLineup([a, blend, b, yuzu, c, d])).toEqual([yuzu, a, b]);
  });
  it("在庫なし（maxQuantity 0）は出さない。豆が足りなければ出せる分だけ", () => {
    expect(homeShopLineup([{ ...a, maxQuantity: 0 }, b, yuzu, c])).toEqual([yuzu, b, c]);
    expect(homeShopLineup([{ ...yuzu, maxQuantity: 0 }, a, b, c])).toEqual([a, b]);
    expect(homeShopLineup([yuzu, blend])).toEqual([yuzu]);
    expect(homeShopLineup([])).toEqual([]);
  });
  it("豆以外（ほかのドリップバッグ・その他の商品）は残りの2つに入れない", () => {
    expect(homeShopLineup([blend, goods("e", "Tシャツ"), a])).toEqual([a]);
  });
});

describe("ショップのその商品の欄へ直接着くリンク（/shop?item=…）を、ゆず以外にも", () => {
  it("商品の ID（SKU）で指定できる。決まった形だけを読む", () => {
    expect(shopItemHref(a.skuId as `bn_${string}_300`)).toBe(`/shop?item=bn_${id("1")}_300`);
    expect(shopItemHrefFor(yuzu.skuId)).toBe(`/shop?item=gd_${id("c")}_1`);
    expect(readShopItemKey(`?item=bn_${id("1")}_300`)).toBe(a.skuId);
    expect(readShopItemKey(`?item=gd_${id("c")}_1&utm_source=x`)).toBe(yuzu.skuId);
    for (const bad of ["bn_1_300", `bn_${id("1")}_100`, `gd_${id("1")}_2`, `bn_${"A".repeat(32)}_300`, `xx_${id("1")}_1`, `bn_${id("1")}_300/`]) {
      expect(isShopItemSku(bad), bad).toBe(false); expect(readShopItemKey(`?item=${encodeURIComponent(bad)}`), bad).toBeNull();
    }
    // 形の違う値はリンクに入れず、ショップの先頭へ。
    expect(shopItemHrefFor("beans")).toBe("/shop");
  });
  it("今までの ?item=yuzu-drip-bag（カードのQR → ゆずのページ経由）はそのまま動く", () => {
    expect(readShopItemKey("?item=yuzu-drip-bag")).toBe("yuzu-drip-bag");
    expect(shopItemTarget("yuzu-drip-bag", [a, yuzu])).toEqual({ sku: yuzu.skuId });
    expect(findShopItem("yuzu-drip-bag", [a, blend, yuzu])).toBe(yuzu);
  });
  it("SKU で指定: 並んでいればその商品へ。並んでいなければ、豆は「コーヒー豆」の見出しへ、それ以外は先頭のまま", () => {
    expect(shopItemTarget(b.skuId as `bn_${string}_300`, [a, b, yuzu])).toEqual({ sku: b.skuId });
    expect(shopItemTarget(d.skuId as `bn_${string}_300`, [a, b])).toEqual({ group: "beans" });
    expect(shopItemTarget(blend.skuId as `gd_${string}_1`, [a])).toBeNull();
  });
});
