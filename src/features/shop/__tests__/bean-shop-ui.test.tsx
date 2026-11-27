import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { beanDisplaySchema, beanPageId, joinCatalogWithDisplay, type BeanDisplay } from "../bean-display";
import { addButtonState, cartSubtotal, drawerLines, quantityAfterAdd } from "../bean-cart";
import { BeanCard, type BeanItem } from "../components/BeanCard";
import { CartDrawer } from "../components/CartDrawer";

vi.mock("@/features/shop/policy", async importOriginal => ({ ...await importOriginal<typeof import("../policy")>(), SHOP_PAUSED: false }));

const idA = "1a".repeat(16), idB = "2b".repeat(16), idC = "3c".repeat(16);
const item = (id: string, over: Partial<BeanItem> = {}) => ({ skuId: `bn_${id}_300`, name: `架空豆${id.slice(0, 2)}`, unit: "300g・豆", unitPrice: 2700, kind: "physical" as const, maxQuantity: 3, ...over });
const display = (id: string, over: Partial<BeanDisplay> = {}): BeanDisplay => ({ id, name: "表示名", origin: "架空産地", roast: "中煎り", flavor: "架空の風味", process: "架空精製", variety: "架空品種", region: "", farm: "", altitude: "", description: "架空の説明", image: `/api/notion-image/${id}`, ...over });
const read = (path: string) => readFileSync(path, "utf8");

describe("販売中の商品と表示用データのつなぎ方", () => {
  it("SKUからNotionのページIDだけを取り出す（300gの豆だけ）", () => {
    expect(beanPageId(`bn_${idA}_300`)).toBe(idA);
    for (const sku of [`bn_${idA}_100`, `bn_${idA.toUpperCase()}_300`, `bn_${idA.slice(1)}_300`, "gift_roasting", `x_bn_${idA}_300`]) expect(beanPageId(sku)).toBeNull();
  });
  it("販売中の商品はすべて、カタログの順番で残す。表示データが無くても隠さない", () => {
    const items = [item(idC), { ...item(idA), skuId: "gift_ticket", kind: "gift" as const }, item(idB)];
    const joined = joinCatalogWithDisplay(items, [display(idB), display(idA), display("9f".repeat(16))]);
    expect(joined.map(row => row.skuId)).toEqual([`bn_${idC}_300`, "gift_ticket", `bn_${idB}_300`]);
    expect(joined.map(row => row.display?.id ?? null)).toEqual([null, null, idB]);
    // Name, unit and price stay the catalog's; the display name is not used for selling.
    expect(joined[2]).toMatchObject({ name: item(idB).name, unitPrice: 2700, unit: "300g・豆" });
  });
  it("表示データは同じサイトの画像経路だけを持ち、値段や在庫の項目を受け付けない", () => {
    expect(beanDisplaySchema.safeParse(display(idA)).success).toBe(true);
    expect(beanDisplaySchema.safeParse(display(idA, { image: "" })).success).toBe(true);
    for (const image of ["https://example.invalid/a.jpg", "/api/notion-image/../x", `//api/notion-image/${idA}`]) expect(beanDisplaySchema.safeParse(display(idA, { image })).success).toBe(false);
    expect(beanDisplaySchema.safeParse({ ...display(idA), price: 900 }).success).toBe(false);
  });
});

describe("カートに入れる・上限・外す", () => {
  it("1つずつ増え、カタログの上限を超えない", () => {
    expect(quantityAfterAdd({ maxQuantity: 3 }, 0)).toBe(1);
    expect(quantityAfterAdd({ maxQuantity: 3 }, 2)).toBe(3);
    expect(quantityAfterAdd({ maxQuantity: 3 }, 3)).toBeNull();
    expect(quantityAfterAdd({ maxQuantity: 0 }, 0)).toBeNull();
  });
  it("ボタンは在庫なし・上限・操作中で押せない", () => {
    expect(addButtonState({ maxQuantity: 0 }, 0, false)).toEqual({ disabled: true, label: "在庫なし" });
    expect(addButtonState({ maxQuantity: 2 }, 2, false)).toEqual({ disabled: true, label: "カートに入れる" });
    expect(addButtonState({ maxQuantity: 2 }, 1, true)).toEqual({ disabled: true, label: "カートに入れる" });
    expect(addButtonState({ maxQuantity: 2 }, 1, false)).toEqual({ disabled: false, label: "カートに入れる" });
  });
  it("カートの行は保存順。一覧に無い行は最後に見た名前で残し、外すだけにする", () => {
    const lines = drawerLines([{ skuId: `bn_${idB}_300`, quantity: 2 }, { skuId: "gone", quantity: 1 }], [item(idB)], new Map([["gone", "前の豆 100g"]]));
    expect(lines.map(line => [line.label, line.item?.maxQuantity ?? null])).toEqual([[`${item(idB).name} 300g・豆`, 3], ["前の豆 100g", null]]);
    expect(drawerLines([{ skuId: "x", quantity: 1 }], [], new Map())[0].label).toBe("選択した商品 1");
  });
  it("カートの画面は増減・外す・小計・「購入手続きへ」を持ち、送料や合計は出さない（それは見積もりの答えだけ）", () => {
    const lines = drawerLines([{ skuId: `bn_${idA}_300`, quantity: 3 }, { skuId: `bn_${idB}_300`, quantity: 1 }], [item(idA), item(idB)], new Map());
    const html = renderToStaticMarkup(<CartDrawer open lines={lines} count={4} subtotal={cartSubtotal(lines)} busy={false} locked={false} stale={false} images={new Map([[`bn_${idA}_300`, `/api/notion-image/${idA}`]])} failedImages={new Set()} onImageError={() => {}} onChange={() => {}} onClose={() => {}} onCheckout={() => {}} />);
    expect(html).toContain("カート（4点）");
    expect(html).toContain('role="dialog"'); expect(html).toContain('aria-modal="true"');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-label="架空豆1a 300g・豆の数量を1つ増やす"/);
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*aria-label="架空豆2b 300g・豆の数量を1つ増やす"/);
    expect(html).toContain('aria-label="架空豆1a 300g・豆を選択から外す"');
    expect(html).toContain("購入手続きへ");
    expect(html).toContain(`/api/notion-image/${idA}`);
    expect(html).toMatch(/小計<\/span><span[^>]*>¥10,800</); // 3×2,700 + 1×2,700 (catalog prices)
    for (const word of ["合計：", "送料", "送料無料", "送料を含む合計を確認", "選ぶだけでは注文されません"]) expect(html).not.toContain(word);
    expect(html.match(/h-11 w-11/g)?.length).toBeGreaterThanOrEqual(5); // 44px targets
  });
  it("操作中・決済の準備後・更新前の一覧では、購入手続きへ進めない", () => {
    const lines = drawerLines([{ skuId: `bn_${idA}_300`, quantity: 1 }], [item(idA)], new Map());
    for (const state of [{ busy: true, locked: false, stale: false }, { busy: false, locked: true, stale: false }, { busy: false, locked: false, stale: true }]) {
      const html = renderToStaticMarkup(<CartDrawer open lines={lines} count={1} subtotal={2700} {...state} images={new Map()} failedImages={new Set()} onImageError={() => {}} onChange={() => {}} onClose={() => {}} onCheckout={() => {}} />);
      expect(html).toMatch(/disabled=""[^>]*>購入手続きへ<\/button>/);
    }
    expect(renderToStaticMarkup(<CartDrawer open lines={[]} count={0} subtotal={0} busy={false} locked={false} stale={false} images={new Map()} failedImages={new Set()} onImageError={() => {}} onChange={() => {}} onClose={() => {}} onCheckout={() => {}} />)).toContain("カートは空です");
  });
});

describe("商品カード", () => {
  const card = (row: BeanItem, quantity = 0) => renderToStaticMarkup(<BeanCard item={row} quantity={quantity} blocked={false} added={false} imageFailed={false} onImageError={() => {}} onOpen={() => {}} onAdd={() => {}} />);
  it("写真・産地・風味・値段（カタログの値）とカートに入れるボタンを出す", () => {
    const html = card({ ...item(idA), display: display(idA) });
    expect(html).toContain(`src="/api/notion-image/${idA}"`); expect(html).not.toContain("/_next/image");
    for (const text of ["架空産地", "中煎り", "架空の風味", "架空精製", "¥2,700", "/ 300g・豆", "カートに入れる", "架空豆1a の詳細を見る".replace(" ", "")]) expect(html).toContain(text);
    expect(html).not.toContain("表示名");
  });
  it("表示データが無い商品も、名前・単位・値段を出して売る", () => {
    const html = card({ ...item(idB), display: null });
    for (const text of ["架空豆2b", "¥2,700", "300g・豆", "NO IMAGE", "カートに入れる"]) expect(html).toContain(text);
    expect(html).not.toContain("<img");
  });
  it("在庫なしは押せず、選択中の数を出す", () => {
    expect(card({ ...item(idA, { maxQuantity: 0 }), display: null })).toMatch(/disabled=""[^>]*aria-label="架空豆1a 300g・豆は在庫なし"/);
    expect(card({ ...item(idA), display: null }, 2)).toContain("2点を選択中");
  });
});

describe("写真の注記と文字の書体", () => {
  const caption = ["ショップ共通のイメージ写真です", "各商品の実物写真ではありません"];
  it("「ショップ共通のイメージ写真です。…」の注記と、その要素が無い", async () => {
    for (const path of ["src/features/shop/components/PurchasePanel.tsx", "src/features/shop/components/PurchaseBrand.tsx"]) for (const text of caption) expect(read(path), path).not.toContain(text);
    const { default: ShopPage } = await import("@/app/shop/page");
    const html = renderToStaticMarkup(<ShopPage />);
    for (const text of caption) expect(html).not.toContain(text);
    expect(html).toContain("焙煎したてをお届け");
  });
  const files = ["PurchasePanel.tsx", "PurchaseBrand.tsx", "PurchaseTerms.tsx", "CheckoutCancellationPanel.tsx", "UnlistedCartItems.tsx", "ProductPublicationDetails.tsx", "BeanCard.tsx", "BeanDetailModal.tsx", "CartDrawer.tsx", "shop-catalog-parts.tsx"].map(name => `src/features/shop/components/${name}`);
  it("購入画面の部品は、サイトの書体（Noto Sans / Noto Serif / Playfairのラベル）以外を指定しない", () => {
    for (const path of files) {
      const source = read(path);
      expect(source, path).not.toMatch(/font-(semibold|bold|black|mono|extrabold)\b/);
      expect(source, path).not.toMatch(/fontFamily|style=\{\{[^}]*font/);
      for (const [, family] of source.matchAll(/font-\[([^\]]+)\]/g)) expect(family, path).toBe("family-name:var(--font-display)");
    }
  });
  it("下線付きの文字（リンク・文字ボタン）は大きさを必ず指定する。ホームへ戻るリンクも共通の書式", () => {
    // PurchaseTerms' mail link inherits text-sm from its <dl>; that markup is pinned
    // byte for byte by receiving-method.test.tsx, so it is checked as it stands.
    const inherited = 'inline-flex min-h-12 items-center break-all underline underline-offset-4';
    expect(read("src/features/shop/components/PurchaseTerms.tsx")).toContain(`<dl className="mt-3 space-y-3 text-sm leading-relaxed">`);
    for (const path of files) for (const [, classes] of read(path).matchAll(/className="([^"]*\bunderline\b[^"]*)"/g)) if (classes !== inherited) expect(classes, path).toMatch(/\btext-(xs|sm|base|lg)\b/);
    const panel = read(files[0]);
    expect(panel).toContain('<Link href="/" className={purchaseUi.link}>三十日珈琲のホームへ戻る</Link>');
    expect(panel).toContain('<a href="/shop" className={purchaseUi.link}>ショップの案内へ戻る</a>');
  });
});
