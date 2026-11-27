import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readShopItemKey, shopItemHref, shopItemLinks, shopItemTarget } from "../shop-item-link";

const panel = readFileSync("src/features/shop/components/PurchasePanel.tsx", "utf8");
const items = [
  { skuId: "bn_aaaa_300", name: "架空の豆" },
  { skuId: "gd_bbbb_1", name: "ドリップバッグ（三十日ブレンド）" },
  { skuId: "gd_cccc_1", name: "ドリップバッグ（ゆずインフューズド）" },
];

describe("ショップを指定の商品の欄で開くリンク（/shop?item=…）", () => {
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

  it("購入画面：送る処理は、カート・購入手続き・保存・通信に触れない（見る位置と目印だけ）", () => {
    const block = panel.slice(panel.indexOf("const goToLinkedItem"), panel.indexOf("const lines = catalog && session"));
    expect(block.length).toBeGreaterThan(100);
    for (const call of ["quantity(", "save(", "send(", "post(", "fetch(", "sessionStorage", "setCartOpen", "openCheckout", "setSession", "setQuotation", "location.assign", "history."]) expect(block, call).not.toContain(call);
    expect(block).toContain("scrollIntoView");
    // 商品カードの並びは今までどおり。目印は指定された商品の枠だけ
    expect(panel).toContain('<li key={item.skuId} data-sku={item.skuId} className={linkedSku === item.skuId ? "outline outline-2 outline-offset-8 outline-gold-dark" : undefined}>');
    expect(panel).toContain("groupCatalogItems(beans).map(group =>");
  });
});
