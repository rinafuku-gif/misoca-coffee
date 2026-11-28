import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readShopItemAdd, readShopItemKey, shopItemAddHref, shopItemHref, shopItemLinks, shopItemTarget, withoutShopItemAdd } from "../shop-item-link";

const panel = readFileSync("src/features/shop/components/PurchasePanel.tsx", "utf8");
const items = [
  { skuId: "bn_aaaa_300", name: "架空の豆" },
  { skuId: "gd_bbbb_1", name: "ドリップバッグ（三十日ブレンド）" },
  { skuId: "gd_cccc_1", name: "ドリップバッグ（ゆずインフューズド）" },
];

describe("ショップを指定の商品の欄で開くリンク（/shop?item=…）", () => {
  it("商品ページの「カートに入れる」は ?item=…&add=1。add は 1 のときだけ。外したアドレスはほかの値を残す", () => {
    expect(shopItemAddHref("yuzu-drip-bag")).toBe("/shop?item=yuzu-drip-bag&add=1");
    expect(shopItemAddHref(`bn_${"a".repeat(32)}_300` as const)).toBe(`/shop?item=bn_${"a".repeat(32)}_300&add=1`);
    expect(readShopItemAdd("?item=yuzu-drip-bag&add=1")).toBe(true);
    for (const search of ["", "?item=yuzu-drip-bag", "?item=yuzu-drip-bag&add=0", "?item=yuzu-drip-bag&add=yes"]) expect(readShopItemAdd(search), search).toBe(false);
    expect(withoutShopItemAdd("https://example.invalid/shop?item=yuzu-drip-bag&add=1")).toBe("/shop?item=yuzu-drip-bag");
    expect(withoutShopItemAdd("https://example.invalid/shop?add=1&item=yuzu-drip-bag&utm_source=x#top")).toBe("/shop?item=yuzu-drip-bag&utm_source=x#top");
    expect(readShopItemKey("?item=yuzu-drip-bag&add=1")).toBe("yuzu-drip-bag");
  });

  it("決めてある名前だけを読む。ほかの値・値なしは指定なし（今までどおり先頭）", () => {
    expect(shopItemHref("yuzu-drip-bag")).toBe("/shop?item=yuzu-drip-bag");
    expect(readShopItemKey("?item=yuzu-drip-bag")).toBe("yuzu-drip-bag");
    expect(readShopItemKey("?item=yuzu-drip-bag&utm_source=x")).toBe("yuzu-drip-bag");
    for (const search of ["", "?", "?item=", "?item=unknown", "?item=toString", "?item=__proto__", "?other=yuzu-drip-bag"]) expect(readShopItemKey(search), search).toBeNull();
  });

  it("商品が並んでいればその商品へ、並んでいなければ種類の見出しへ。指定がなければどこへも送らない", () => {
    expect(shopItemTarget("yuzu-drip-bag", items)).toEqual({ sku: "gd_cccc_1" });
    expect(shopItemTarget("yuzu-drip-bag", items.slice(0, 2))).toEqual({ group: "drip" });
    expect(shopItemTarget(null, items)).toBeNull();
    expect(shopItemLinks["yuzu-drip-bag"].name).toBe("ドリップバッグ（ゆずインフューズド）");
  });

  it("購入画面：先頭から始まる動きはそのまま。送るのは商品一覧が出たあと1回だけ", () => {
    expect(panel).toContain("usePageStartsAtTop();");
    expect(panel).toContain("if (!catalog || !session || itemLinkHandled.current) return;");
    expect(panel).toContain("itemLinkHandled.current = true; goToLinkedItem();");
    // 支払いの途中（バナーを出す所）やカートを開いている間は動かない。ショップのトップだけ
    expect(panel).toContain("if (!shopRoot || session?.attempt || cartOpen) return;");
  });

  it("購入画面：送る処理は、保存・購入手続き・通信に直接触れない（カートに入れるのは画面自身の「カートに入れる」= addOne だけ）", () => {
    const block = panel.slice(panel.indexOf("const goToLinkedItem"), panel.indexOf("const lines = catalog && session"));
    expect(block.length).toBeGreaterThan(100);
    for (const call of ["quantity(", "save(", "send(", "post(", "fetch(", "sessionStorage", "openCheckout", "setSession", "setQuotation", "location.assign", "history.push"]) expect(block, call).not.toContain(call);
    expect(block).toContain("scrollIntoView");
    // &add=1：アドレスから先に外す（読み直しで二重に入らない）→ 支払いの途中なら何もしない → addOne → カートを開く
    const drop = block.indexOf('window.history.replaceState(window.history.state, "", withoutShopItemAdd(window.location.href));');
    expect(drop).toBeGreaterThan(0);
    expect(drop).toBeLessThan(block.indexOf("if (!shopRoot || session?.attempt || cartOpen) return;"));
    expect(block).toContain("if (item && (addOne(item) || qtyOf(item.skuId) > 0)) { setDrawerStep(\"cart\"); setCartOpen(true); return; }");
    expect(block.match(/setCartOpen\(/g)).toHaveLength(1);
    // 画面の「カートに入れる」も同じ addOne（入ったかどうかだけ返すようにした）
    expect(panel).toContain("function addOne(item: BeanItem): boolean {");
    expect(panel).toContain("if (next === null || !quantity(item.skuId, next)) return false;");
    // 商品カードの並びは今までどおり。目印は指定された商品の枠だけ
    expect(panel).toContain('<li key={item.skuId} data-sku={item.skuId} className={linkedSku === item.skuId ? "outline outline-2 outline-offset-8 outline-gold-dark" : undefined}>');
    expect(panel).toContain("groupCatalogItems(beans).map(group =>");
  });
});
