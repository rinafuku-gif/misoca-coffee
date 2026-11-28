import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DELIVERY_METHODS, catalogDeliveryMethodsSchema, checkoutRequestBody, deliveryMethodsSchema, physicalStatusView, pickupInstagramHref, pickupPlace, pickupPlaceGuide, quoteRequestBody, receivingCopy,
  receivingLegalNotice, receivingTerms, requestedMethod, selectableMethods, shippingFeeLabel, shippingFeeNotation, showsShippingWindow, type DeliveryMethod,
} from "../receiving-method";
import { PurchaseConditions, PurchaseLegalLinks, ReceivingMethodChoice, purchaseConditions } from "../components/PurchaseTerms";
import { catalogSchema } from "../components/PurchasePanel";
import { PhysicalStatus } from "../components/PurchaserStatusPanel";
import { PickupGuideText } from "../components/PickupGuideText";
import { physicalCopy, purchaserStatusSchema, RECEIVING_METHODS, type BuyerStatus } from "../purchaser-status";
import { PURCHASE_SESSION_KEY, applyCheckoutCancellation, markCheckoutCancellation, readPurchaseSession, reconcilePurchasedCart, withDeliveryMethod, writePurchaseSession, type PurchaseSession } from "../purchase-session";
import TermsPage from "@/app/terms/page";
import TokushohoPage from "@/app/tokushoho/page";
/** 案内文の「Instagram」だけがリンクになった形（画面ではこの形で出る）。 */
const linkedGuide = renderToStaticMarkup(<PickupGuideText text={pickupPlaceGuide} />);
const plain = (html: string) => html.replace(/<[^>]+>/g, "");

const read = (path: string) => readFileSync(resolve(path), "utf8");
const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
const key = "a".repeat(64), quote = "b".repeat(64);
const lines = [{ skuId: "beans", quantity: 2 }];
const noop = () => {};
function storage() { const map = new Map<string, string>(); return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } }; }
const status: BuyerStatus = { orderReference: "order-fixture", createdAt: 1000, items: [{ skuId: "beans", name: "架空", unit: "100g", quantity: 2, unitPrice: 900, kind: "physical" }], total: 1800, shipping: 0, refundedTotal: 0, payment: "confirmed", physical: "awaiting_preparation", giftDelivery: "not_applicable", confirmationEmail: "not_sent", cancellation: "none" };
const panel = read("src/features/shop/components/PurchasePanel.tsx");

describe("受け取り方法を選ぶ欄が出る条件", () => {
  const offered = ["shipping", "local_delivery", "store_pickup"] as const;
  it("配る項目が無い・配送だけ・ギフト券だけのカートでは出さない", () => {
    expect(selectableMethods(undefined, true)).toEqual([]);
    expect(selectableMethods(["shipping"], true)).toEqual([]);
    expect(selectableMethods(offered, false)).toEqual([]);
    expect(selectableMethods(["shipping", "store_pickup"], false)).toEqual([]);
    for (const none of [undefined, ["shipping"] as const]) expect(renderToStaticMarkup(<ReceivingMethodChoice methods={selectableMethods(none, true)} value="shipping" onChange={noop} />)).toBe("");
    expect(renderToStaticMarkup(<ReceivingMethodChoice methods={selectableMethods(offered, false)} value="shipping" onChange={noop} />)).toBe("");
  });
  it("配送以外が配られ、発送する商品がカートにあるときだけ、配られた方法をその順で出す", () => {
    expect(selectableMethods(["shipping", "store_pickup"], true)).toEqual(["shipping", "store_pickup"]);
    expect(selectableMethods(offered, true)).toEqual(offered);
  });
  it("選べない方法は依頼に付けない（保存した選択が残っていても配送として送る）", () => {
    expect(requestedMethod(undefined, offered)).toBe("shipping");
    expect(requestedMethod("store_pickup", offered)).toBe("store_pickup");
    expect(requestedMethod("local_delivery", ["shipping", "store_pickup"])).toBe("shipping");
    expect(requestedMethod("store_pickup", [])).toBe("shipping");
  });
  it("購入画面は、配られた一覧と、発送する商品の有無からだけ決める（開け閉めの固定値を持たない）", () => {
    expect(panel).toContain("selectableMethods(catalog.deliveryMethods, session.cart.some(line => physicalSkus.has(line.skuId)))");
    expect(panel).toContain('if (item.kind === "physical") skus.add(item.skuId); else skus.delete(item.skuId);');
    expect(panel).toContain("const method = requestedMethod(session?.deliveryMethod, methodChoices);");
    expect(panel).toContain("<MethodPicker methods={methodChoices} value={method} disabled={busy} unavailable={unavailableMethods} onChange={chooseMethod} />");
    expect(read("src/features/shop/policy.ts")).not.toMatch(/DELIVERY|RECEIVING|deliveryMethod/i);
    for (const path of ["src/features/shop/receiving-method.ts", "src/features/shop/components/PurchasePanel.tsx", "src/features/shop/components/PurchaseTerms.tsx"]) expect(read(path), path).not.toMatch(/process\.env|NEXT_PUBLIC/);
  });
  // 2026-11-27: the choice sits in the checkout section, before the total and the
  // pay button; choosing asks for the total at once (no separate button).
  it("選ぶ欄は購入手続きの中、合計と「お支払いへ進む」の前に1つだけ置く", () => {
    const section = panel.indexOf("checkout={<div"), chooser = panel.indexOf("<MethodPicker "), total = panel.indexOf("<dt>合計</dt>"), pay = panel.indexOf("{checkoutCopy.pay}</button>");
    expect(section).toBeGreaterThan(-1);
    expect(chooser).toBeGreaterThan(section);
    expect(total).toBeGreaterThan(chooser);
    expect(pay).toBeGreaterThan(total);
    expect(panel.match(/<MethodPicker /g)).toHaveLength(1);
    expect(panel).not.toContain("<ReceivingMethodChoice ");
    expect(panel).not.toContain("送料を含む合計を確認");
  });
});

describe("約束ごとどおりの deliveryMethods の形", () => {
  it.each([[["shipping"]], [["shipping", "local_delivery"]], [["shipping", "store_pickup"]], [["shipping", "local_delivery", "store_pickup"]]])("決まった形を通す %j", methods => {
    expect(deliveryMethodsSchema.parse(methods)).toEqual(methods);
  });
  it.each([
    [[]], [["store_pickup"]], [["store_pickup", "shipping"]], [["shipping", "store_pickup", "local_delivery"]], [["shipping", "shipping"]],
    [["shipping", "store_pickup", "store_pickup"]], [["shipping", "drone"]], [["shipping", "local_delivery", "store_pickup", "store_pickup"]], ["store_pickup"], [null], [[1]],
  ])("知らない方法名・順序違い・重なり・空は、決まった形ではない %j", methods => {
    expect(deliveryMethodsSchema.safeParse(methods).success).toBe(false);
  });
  it("方法の名前は、管理側と同じファイルの値から作る", () => {
    expect(DELIVERY_METHODS).toEqual(["shipping", ...RECEIVING_METHODS]);
    expect(DELIVERY_METHODS).toEqual(["shipping", "local_delivery", "store_pickup"]);
  });
});

describe("購入画面が商品一覧の応答を読むとき（ブラウザ側）", () => {
  const item = { skuId: "beans", name: "架空", unit: "100g", unitPrice: 900, kind: "physical", maxQuantity: 5 };
  const plain = { items: [item], nextOffset: null, acceptingOrders: true };
  const chooser = (deliveryMethods: readonly DeliveryMethod[] | undefined) => renderToStaticMarkup(<ReceivingMethodChoice methods={selectableMethods(deliveryMethods, true)} value="shipping" onChange={noop} />);
  it("項目が無い応答は、今までどおり読む", () => {
    expect(catalogSchema.parse(plain)).toEqual(plain);
    expect(catalogSchema.parse(plain).deliveryMethods).toBeUndefined();
  });
  it.each([[["shipping", "store_pickup"]], [["shipping", "local_delivery"]], [["shipping", "local_delivery", "store_pickup"]]])("正しい値 %j のときは、今までどおり選ぶ欄が出る", deliveryMethods => {
    const catalog = catalogSchema.parse({ ...plain, deliveryMethods });
    expect(catalog.deliveryMethods).toEqual(deliveryMethods);
    expect(selectableMethods(catalog.deliveryMethods, true)).toEqual(deliveryMethods);
    expect(chooser(catalog.deliveryMethods).match(/type="radio"/g)).toHaveLength(deliveryMethods.length);
    expect(JSON.stringify(quoteRequestBody(lines, requestedMethod("store_pickup", selectableMethods(catalog.deliveryMethods, true))))).toBe(deliveryMethods.includes("store_pickup") ? '{"lines":[{"skuId":"beans","quantity":2}],"deliveryMethod":"store_pickup"}' : '{"lines":[{"skuId":"beans","quantity":2}]}');
  });
  it.each([
    ["順序違い", ["shipping", "store_pickup", "local_delivery"]], ["順序違い（配送が後ろ）", ["store_pickup", "shipping"]],
    ["先頭が shipping でない", ["store_pickup"]], ["先頭が shipping でない（2つ）", ["local_delivery", "store_pickup"]],
    ["重複", ["shipping", "shipping"]], ["重複（配送以外）", ["shipping", "store_pickup", "store_pickup"]],
    ["配列でない値（文字列）", "store_pickup"], ["配列でない値（null）", null], ["配列でない値（数）", 1], ["配列でない値（オブジェクト）", { shipping: true }],
    ["空の配列", []], ["知らない方法名", ["shipping", "drone"]], ["4つ以上", ["shipping", "local_delivery", "store_pickup", "store_pickup"]],
  ])("%s のときは、商品一覧は読めて、選ぶ欄は出ず、依頼に deliveryMethod が付かない", (_label, deliveryMethods) => {
    const parsed = catalogSchema.safeParse({ ...plain, deliveryMethods });
    expect(parsed.success).toBe(true);
    const catalog = parsed.data!;
    // 商品一覧そのものは今までどおり読める（配送での購入は続けられる）。
    expect(catalog.items).toEqual([item]);
    expect(catalog.acceptingOrders).toBe(true);
    expect(catalog.nextOffset).toBeNull();
    // deliveryMethods が無いのと同じ扱い。
    expect(catalog.deliveryMethods).toBeUndefined();
    expect(selectableMethods(catalog.deliveryMethods, true)).toEqual([]);
    expect(chooser(catalog.deliveryMethods)).toBe("");
    // 店頭受け取りを選んだ記録が残っていても、配送の本文（今までと同じ文字列）になる。
    const method = requestedMethod("store_pickup", selectableMethods(catalog.deliveryMethods, true));
    expect(method).toBe("shipping");
    expect(JSON.stringify(quoteRequestBody(lines, method))).toBe('{"lines":[{"skuId":"beans","quantity":2}]}');
    expect(JSON.stringify(checkoutRequestBody({ purchaseKey: key, lines, acceptedQuote: quote, ...(method === "shipping" ? {} : { deliveryMethod: method }) }))).toBe(`{"purchaseKey":"${key}","lines":[{"skuId":"beans","quantity":2}],"acceptedQuote":"${quote}"}`);
  });
  it("商品一覧のほかの項目の検査は、今までの厳しさのまま", () => {
    for (const broken of [
      { ...plain, extra: 1 }, { ...plain, deliveryMethods: ["shipping", "store_pickup"], shippingFee: 0 }, { ...plain, deliveryMethod: "store_pickup" },
      { ...plain, items: [{ ...item, maxQuantity: 21 }] }, { ...plain, items: [{ ...item, kind: "other" }] }, { ...plain, items: [{ ...item, extra: 1 }] }, { ...plain, items: "x" },
      { ...plain, nextOffset: -1 }, { ...plain, nextOffset: "1" }, { ...plain, acceptingOrders: "true" },
      { items: [item], nextOffset: null }, { items: [item], acceptingOrders: true }, { nextOffset: null, acceptingOrders: true },
    ]) expect(catalogSchema.safeParse(broken).success, JSON.stringify(broken)).toBe(false);
    // 上の壊れた応答に、形の違う deliveryMethods を足しても、読めるようにはならない。
    expect(catalogSchema.safeParse({ ...plain, items: "x", deliveryMethods: ["store_pickup", "shipping"] }).success).toBe(false);
  });
  it("この読み方は、購入画面の商品一覧の検査の中の deliveryMethods だけに使う", () => {
    // 商品一覧の形は1か所（purchase-catalog.ts）にあり、購入画面とトップページが同じものを使う。
    const catalogSource = read("src/features/shop/purchase-catalog.ts");
    expect(catalogSource).toContain("acceptingOrders: z.boolean(), deliveryMethods: catalogDeliveryMethodsSchema, reception: catalogReceptionSchema }).strict();");
    expect(catalogSource.match(/catalogDeliveryMethodsSchema/g)).toHaveLength(2);
    expect(panel).not.toContain("catalogDeliveryMethodsSchema");
    expect(panel).toContain('import { catalogProductSchema, catalogSchema, postPurchase as post, type Catalog } from "../purchase-catalog";');
    expect(panel.match(/catalogSchema\.parse\(/g)).toHaveLength(3);
    expect(catalogSource.match(/catalogSchema\.parse\(/g)).toHaveLength(1);
    expect(catalogDeliveryMethodsSchema.parse(undefined)).toBeUndefined();
    expect(catalogDeliveryMethodsSchema.parse(["shipping", "store_pickup"])).toEqual(["shipping", "store_pickup"]);
    // 写した受け渡し部品（管理側と同じ内容に保つファイル）は、この読み方を使わない。
    expect(read("src/features/shop/ledger/purchase-server-transport.ts")).not.toContain("receiving-method");
  });
});

describe("方法ごとの依頼の本文", () => {
  it("配送の見積もりは、今までと1バイトも違わない（deliveryMethod を付けない）", () => {
    expect(JSON.stringify(quoteRequestBody(lines, "shipping"))).toBe('{"lines":[{"skuId":"beans","quantity":2}]}');
    expect(JSON.stringify(quoteRequestBody(lines, "shipping"))).toBe(JSON.stringify({ lines }));
    expect("deliveryMethod" in quoteRequestBody(lines, "shipping")).toBe(false);
  });
  it("配送以外の見積もりは、方法の名前だけを足す（送料の金額などは送らない）", () => {
    expect(JSON.stringify(quoteRequestBody(lines, "store_pickup"))).toBe('{"lines":[{"skuId":"beans","quantity":2}],"deliveryMethod":"store_pickup"}');
    expect(JSON.stringify(quoteRequestBody(lines, "local_delivery"))).toBe('{"lines":[{"skuId":"beans","quantity":2}],"deliveryMethod":"local_delivery"}');
    expect(Object.keys(quoteRequestBody(lines, "store_pickup"))).toEqual(["lines", "deliveryMethod"]);
  });
  it("配送の決済の開始は、今までと1バイトも違わない", () => {
    const attempt = { purchaseKey: key, lines, acceptedQuote: quote };
    expect(JSON.stringify(checkoutRequestBody(attempt))).toBe(`{"purchaseKey":"${key}","lines":[{"skuId":"beans","quantity":2}],"acceptedQuote":"${quote}"}`);
    expect(JSON.stringify(checkoutRequestBody(attempt))).toBe(JSON.stringify({ purchaseKey: attempt.purchaseKey, lines: attempt.lines, acceptedQuote: attempt.acceptedQuote }));
    // 保存した記録のほかの項目（支払い確認済みの印など）は、今までどおり送らない。
    expect(JSON.stringify(checkoutRequestBody({ ...attempt, settledOrderId: "order", cancelRequested: true } as typeof attempt))).toBe(JSON.stringify(attempt));
  });
  it("配送以外の決済の開始は、同じ本文の末尾に方法の名前だけを足す", () => {
    for (const deliveryMethod of RECEIVING_METHODS) {
      expect(JSON.stringify(checkoutRequestBody({ purchaseKey: key, lines, acceptedQuote: quote, deliveryMethod }))).toBe(`{"purchaseKey":"${key}","lines":[{"skuId":"beans","quantity":2}],"acceptedQuote":"${quote}","deliveryMethod":"${deliveryMethod}"}`);
    }
  });
  it("ギフト券だけのカート・配られていない方法では、保存した選択があっても配送の本文になる", () => {
    const giftOnly = requestedMethod("store_pickup", selectableMethods(["shipping", "store_pickup"], false));
    expect(JSON.stringify(quoteRequestBody(lines, giftOnly))).toBe('{"lines":[{"skuId":"beans","quantity":2}]}');
    const closed = requestedMethod("store_pickup", selectableMethods(undefined, true));
    expect(JSON.stringify(quoteRequestBody(lines, closed))).toBe('{"lines":[{"skuId":"beans","quantity":2}]}');
  });
  it("購入画面の2つの依頼は、この2つの関数だけで本文を作る", () => {
    expect(panel).toContain('const result = await send("quote", quoteRequestBody(session.cart, method));');
    expect(panel).toContain('const result = await send("checkout", checkoutRequestBody(attempt, readRoastAttempt(sessionStorage, attempt.purchaseKey)));');
    expect(panel.match(/send\("(quote|checkout)"/g)).toHaveLength(2);
    expect(panel).toContain('acceptedQuote: currentQuotation.acceptedQuote, ...(method === "shipping" ? {} : { deliveryMethod: method }), form: checkoutFormWire(form, method) };');
    // 商品一覧・状況の本文は今までと同じ。
    expect(panel).toContain('await post("catalog", {})');
    expect(panel).toContain('await send("status", { purchaseKey: session.attempt.purchaseKey })');
  });
});

describe("選んだ方法の保存と、決済へ戻るときの依頼", () => {
  const shippingSession = (): PurchaseSession => ({ version: 1, cart: lines, attempt: { purchaseKey: key, lines, acceptedQuote: quote }, history: [], viewKey: key });
  it("配送のカートと決済の記録は、今までと同じ文字列で保存する", () => {
    const port = storage(); writePurchaseSession(port, shippingSession());
    expect(port.getItem(PURCHASE_SESSION_KEY)).toBe(`{"version":1,"cart":[{"skuId":"beans","quantity":2}],"attempt":{"purchaseKey":"${key}","lines":[{"skuId":"beans","quantity":2}],"acceptedQuote":"${quote}"},"history":[],"viewKey":"${key}"}`);
    expect(readPurchaseSession(port)).toEqual(shippingSession());
  });
  it("配送以外は、カートと決済の記録の両方に方法を持ち、読み直しても残る", () => {
    const port = storage(), saved = { ...shippingSession(), deliveryMethod: "store_pickup" as const, attempt: { ...shippingSession().attempt!, deliveryMethod: "store_pickup" as const } };
    writePurchaseSession(port, saved);
    const loaded = readPurchaseSession(port);
    expect(loaded.deliveryMethod).toBe("store_pickup");
    expect(loaded.attempt?.deliveryMethod).toBe("store_pickup");
    // 決済へ戻る依頼は、保存した記録だけから作る＝最初と同じ方法を送る。
    expect(JSON.stringify(checkoutRequestBody(loaded.attempt!))).toBe(`{"purchaseKey":"${key}","lines":[{"skuId":"beans","quantity":2}],"acceptedQuote":"${quote}","deliveryMethod":"store_pickup"}`);
    expect(panel).toContain("onResume={() => { void run(() => checkout(session.attempt!)); }}");
  });
  it("中止の印・支払い確認・中止の結果でも、決済の記録の方法は変わらない", () => {
    const port = storage(), saved = { ...shippingSession(), cart: [{ skuId: "beans", quantity: 3 }], deliveryMethod: "local_delivery" as const, attempt: { ...shippingSession().attempt!, deliveryMethod: "local_delivery" as const } };
    writePurchaseSession(port, saved);
    expect(markCheckoutCancellation(port, key).attempt?.deliveryMethod).toBe("local_delivery");
    expect(applyCheckoutCancellation(port, key, { cancellation: "checking", status: { ...status, cancellation: "checking", payment: "under_review" } }).attempt?.deliveryMethod).toBe("local_delivery");
    writePurchaseSession(port, saved);
    const settled = reconcilePurchasedCart(port, key, { ...status, receiving: "local_delivery" });
    expect(settled.attempt?.deliveryMethod).toBe("local_delivery");
    expect(settled.cart).toEqual([{ skuId: "beans", quantity: 1 }]);
    expect(applyCheckoutCancellation(storageWith(saved), key, { cancellation: "not_created", orderMayExist: false })).toEqual({ ...saved, attempt: null, viewKey: null });
  });
  function storageWith(session: PurchaseSession) { const port = storage(); writePurchaseSession(port, session); return port; }
  it("知らない方法名・配送という値は保存情報として受け付けない", () => {
    for (const deliveryMethod of ["shipping", "drone", "", null, 1]) {
      const port = storage(); port.setItem(PURCHASE_SESSION_KEY, JSON.stringify({ ...shippingSession(), deliveryMethod }));
      expect(() => readPurchaseSession(port)).toThrow();
      port.setItem(PURCHASE_SESSION_KEY, JSON.stringify({ ...shippingSession(), attempt: { ...shippingSession().attempt, deliveryMethod } }));
      expect(() => readPurchaseSession(port)).toThrow();
    }
  });
  it("配送へ戻すと、保存情報から項目ごと消える", () => {
    const chosen = withDeliveryMethod({ ...shippingSession(), attempt: null }, "store_pickup");
    expect(chosen.deliveryMethod).toBe("store_pickup");
    const back = withDeliveryMethod(chosen, undefined);
    expect("deliveryMethod" in back).toBe(false);
    expect(back).toEqual({ ...shippingSession(), attempt: null });
    expect(chosen.deliveryMethod).toBe("store_pickup");
  });
});

describe("方法を選び直したときの購入画面", () => {
  const body = /function chooseMethod\(next: DeliveryMethod\) \{([\s\S]*?)\n {2}\}\n/.exec(panel)?.[1] ?? "";
  it("決済を始めた記録があるあいだ・通信中・配られていない方法は選び直せない", () => {
    expect(body).toContain("if (!session || session.attempt || busy || !methodChoices.includes(next) || next === method) return;");
  });
  it("方法を保存し、数量を変えたときと同じく、見積もりを消す（確認のチェックは2026-11-27に廃止）", () => {
    expect(body).toContain('save(withDeliveryMethod(session, next === "shipping" ? undefined : next)); setQuotation(null); setNotice("");');
    expect(body).toContain("catch { setNotice(receivingCopy.saveFailed); }");
    // 数量を変えたときの扱い（今までの行）と同じ3つを消している。
    expect(panel).toContain('save({ ...session, cart }); setQuotation(null); setNotice("");');
    expect(panel).not.toMatch(/setConfirmed|type="checkbox"/);
  });
  it("別の方法で取った見積もりは、表示にも決済の開始にも使わない", () => {
    expect(panel).toContain("const currentQuotation = quotation && quotedMethod === method ? quotation : null;");
    expect(panel).toContain("setQuotation(quotationSchema.parse(result.body)); setQuotedMethod(method); setNotice(\"\");");
    expect(panel).toContain("if (!session || session.attempt || !currentQuotation || catalogStale || !catalog?.acceptingOrders) return;");
    expect(panel).toContain("{currentQuotation ? <div");
    expect(panel).not.toMatch(/\bquotation\.(items|shipping|total|acceptedQuote)/);
  });
  it("支払いを確認した後の新しい買い物は、配送から始める", () => {
    expect(panel).toContain("save({ ...withDeliveryMethod(updated, undefined), attempt: null, history });");
  });
});

describe("送料と合計は応答の値だけ", () => {
  it("購入画面は、見積もりの応答の shipping と total をそのまま出す", () => {
    expect(panel).toContain("<dt>{shippingFeeLabel(quotedMethod)}</dt><dd>{money(currentQuotation.shipping)}</dd>");
    expect(panel).toContain("<dt>合計</dt><dd className={purchaseUi.statusTitle}>{money(currentQuotation.total)}</dd>");
    expect(panel).not.toMatch(/(shipping|total)\s*[-+*/]|[-+*]\s*\w*\.?(shipping|total)\b/);
  });
  it("注文の状況の画面は、状況の応答の shipping と total をそのまま出す", () => {
    const statusPanel = read("src/features/shop/components/PurchaserStatusPanel.tsx");
    expect(statusPanel).toContain('<dt>{shippingFeeLabel(data.receiving ?? "shipping")}</dt><dd>{yen(data.shipping)}</dd>');
    expect(statusPanel).toContain("<dt>注文合計</dt><dd>{yen(data.total)}</dd>");
  });
  it("送料の行の呼び名は、方法の名前から作る（金額は入れない）", () => {
    expect(shippingFeeLabel("shipping")).toBe("送料");
    expect(shippingFeeLabel("store_pickup")).toBe("送料（店頭受け取り）");
    expect(shippingFeeLabel("local_delivery")).toBe("送料（上野原市内お届け）");
  });
  it("方法ごとの送料の数字を持たない。金額の文字は、特商法の表記と同じ書き方の1か所だけ", () => {
    const source = read("src/features/shop/receiving-method.ts");
    const amounts = source.split("\n").filter(line => /[¥￥]|\d\s*円|\b370\b|5,?000/.test(line));
    expect(amounts).toEqual([`export const shippingFeeNotation = "${shippingFeeNotation}";`]);
    expect(read("src/app/tokushoho/page.tsx")).toContain(shippingFeeNotation);
    expect(receivingCopy.methods.shipping.description).toContain(shippingFeeNotation);
  });
});

describe("受け取り方法を選ぶ欄の見た目と操作", () => {
  const all: DeliveryMethod[] = ["shipping", "local_delivery", "store_pickup"];
  const html = renderToStaticMarkup(<ReceivingMethodChoice methods={all} value="store_pickup" onChange={noop} />);
  it("見出しと、3つの方法の文を決めた文面で出す", () => {
    expect(html).toContain("<legend");
    expect(html).toContain(">受け取り方法</legend>");
    expect(html).toContain("配送（全国）");
    expect(html).toContain("送料は全国一律 ¥370（¥5,000以上で送料無料）。郵便でポストに届きます。");
    expect(html).toContain("上野原市内へお届け");
    expect(html).toContain("送料無料。上野原市内にお住まいの方限定で、当店が直接ポストへお届けします。");
    expect(html).toContain("店頭で受け取る");
    expect(html).toContain("送料無料。ご用意ができましたらメールでお知らせします。お知らせのあと、コーヒースタンドの営業日（毎週水曜）に、見晴亭（上野原駅北口から徒歩すぐ）でお受け取りください。");
  });
  it("ラジオボタンは同じ名前の組で、それぞれ label と id で結び付く（キーボードで選べる）", () => {
    const inputs = [...html.matchAll(/<input [^>]*>/g)].map(match => match[0]);
    expect(inputs).toHaveLength(3);
    for (const [index, method] of all.entries()) {
      expect(inputs[index]).toContain('type="radio"');
      expect(inputs[index]).toContain('name="receiving-method"');
      expect(inputs[index]).toContain(`id="receiving-method-${method}"`);
      expect(inputs[index]).toContain(`value="${method}"`);
      expect(inputs[index]).not.toMatch(/tabindex|hidden|display:none/i);
      expect(html).toContain(`<label for="receiving-method-${method}"`);
    }
    expect(inputs.filter(input => input.includes("checked"))).toEqual([inputs[2]]);
    expect(html.match(/<fieldset/g)).toHaveLength(1);
    expect(html).not.toContain("disabled");
  });
  it("通信中は組ごと選べなくする", () => {
    expect(renderToStaticMarkup(<ReceivingMethodChoice methods={all} value="shipping" disabled onChange={noop} />)).toMatch(/<fieldset disabled=""/);
  });
  it("配られた方法だけを出す", () => {
    const two = renderToStaticMarkup(<ReceivingMethodChoice methods={["shipping", "store_pickup"]} value="shipping" onChange={noop} />);
    expect(two.match(/type="radio"/g)).toHaveLength(2);
    expect(two).not.toContain("上野原市内へお届け");
  });
  it("新しい色・書体・部品を持ち込まず、購入画面の既存のクラスで作る", () => {
    const source = read("src/features/shop/components/PurchaseTerms.tsx");
    expect(source).toContain("className={purchaseUi.checkbox} />");
    expect(html).not.toMatch(/style=|#[0-9a-f]{3,6}\b|font-\[|rounded-(?!none)/i);
    const colors = new Set([...html.matchAll(/(?:text|border|divide|bg|accent|outline)-([a-z]+)(?:\/\d+)?(?=[ "])/g)].map(match => match[1]));
    for (const color of colors) expect(["usuzumi", "konsumi", "haicha", "karekusa", "y", "sm"], color).toContain(color);
  });
});

describe("条件の欄は、選んだ方法に合わせる", () => {
  it("配送のとき・方法を渡さないときの表示は、変える前と1バイトも違わない", () => {
    // 変える前（layer3）の表示の sha256。logs/layer4-baseline-render.json に元の表示を控えてある。
    const before = "59fea877299be18b7e9125fdb0d55feddbb4427cb04684a532c8b4999b815b87";
    expect(sha256(renderToStaticMarkup(<PurchaseConditions />))).toBe(before);
    expect(sha256(renderToStaticMarkup(<PurchaseConditions method="shipping" />))).toBe(before);
  });
  it("上野原市内お届けは、規約と同じ文と、市内の住所だけという案内を出す", () => {
    const html = renderToStaticMarkup(<PurchaseConditions method="local_delivery" />);
    expect(html).toContain(`<dt class="text-haicha">お届け</dt><dd>${receivingTerms.localDelivery}</dd>`);
    expect(html).toContain('<dt class="text-haicha">お届け先</dt><dd>次のStripeの画面で入力します（上野原市内のご住所のみ）。市外のご住所の場合は、当店からご連絡します。</dd>');
    expect(html).toContain(`${purchaseConditions.customerReturn}${purchaseConditions.defect}`);
    expect(html).not.toContain(purchaseConditions.shipping);
    expect(html).not.toContain("日本国内のみ");
  });
  it("店頭受け取りは、規約と同じ文・受け取りの場所・住所の入力が無いことを出す", () => {
    const html = renderToStaticMarkup(<PurchaseConditions method="store_pickup" />);
    expect(html).toContain(`<dt class="text-haicha">受け取り</dt><dd>${receivingTerms.storePickup}${receivingTerms.storePickupHold}</dd>`);
    expect(html).toContain(`<dt class="text-haicha">受け取り場所</dt><dd>${linkedGuide}</dd>`);
    expect(html).toContain('<dt class="text-haicha">お名前</dt><dd>住所の入力はありません。次のStripeの画面でお名前を入力します。</dd>');
    expect(html).toContain(`${purchaseConditions.customerReturn}${receivingTerms.storePickupDefect}`);
    expect(html).not.toContain(purchaseConditions.shipping);
    expect(html).not.toContain(purchaseConditions.defect);
  });
  it.each(DELIVERY_METHODS)("%s でも、支払い・返品・問い合わせ先・3つの案内ページは同じで、金額は書かない", method => {
    const html = renderToStaticMarkup(<><PurchaseConditions method={method} /><PurchaseLegalLinks /></>);
    for (const text of [purchaseConditions.paymentMethod, purchaseConditions.customerReturn, `mailto:${purchaseConditions.contact}`, 'href="/tokushoho"', 'href="/terms"', 'href="/privacy"']) expect(html).toContain(text);
    expect(html).not.toMatch(/[¥￥]|\d+\s*円/);
  });
  it("購入画面は、表示している見積もりを取った方法で条件を出す", () => {
    expect(panel).toContain("<CheckoutTerms method={currentQuotation ? quotedMethod : method} />");
  });
});

describe("注文の状況の画面は、応答の receiving に合わせる", () => {
  const physicals = purchaserStatusSchema.shape.physical.options, payments = purchaserStatusSchema.shape.payment.options;
  it("receiving が無い応答（配送の注文）は、変える前と同じ見出し・文・発送の目安を出す", () => {
    const window = new Set(["awaiting_preparation", "preparing", "packed"]);
    for (const payment of payments) for (const physical of physicals) {
      const before = `<div><dt class="font-semibold">商品の発送</dt><dd class="mt-1 leading-relaxed">${physicalCopy[physical]}</dd>${payment === "confirmed" && window.has(physical) ? `<dd class="mt-1 text-sm leading-relaxed text-karekusa">${purchaseConditions.shipping}</dd>` : ""}</div>`;
      expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, payment, physical }} />), `${payment}:${physical}`).toBe(before);
    }
  });
  it("店頭受け取りは、見出しを「商品の受け取り」に替え、準備中とご用意済みの文を読み替える", () => {
    for (const physical of ["awaiting_preparation", "preparing", "packed"] as const) {
      const html = renderToStaticMarkup(<PhysicalStatus status={{ ...status, physical, receiving: "store_pickup" }} />);
      expect(html).toBe(`<div><dt class="font-semibold">商品の受け取り</dt><dd class="mt-1 leading-relaxed">焙煎とご用意を進めています。ご用意ができましたらメールでお知らせします</dd><dd class="mt-1 text-sm leading-relaxed text-karekusa">${linkedGuide}</dd></div>`);
    }
    const ready = renderToStaticMarkup(<PhysicalStatus status={{ ...status, physical: "handed_over", receiving: "store_pickup" }} />);
    expect(ready).toContain("ご用意ができました。営業日に見晴亭でお受け取りください");
    expect(ready).toContain(linkedGuide); expect(plain(ready)).toContain(pickupPlaceGuide);
    expect(ready).not.toContain("配送事業者");
  });
  it("上野原市内お届けは、準備中とお届け済みの文を読み替え、場所の案内は出さない", () => {
    for (const physical of ["awaiting_preparation", "preparing", "packed"] as const) {
      expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, physical, receiving: "local_delivery" }} />)).toBe('<div><dt class="font-semibold">商品の受け取り</dt><dd class="mt-1 leading-relaxed">焙煎とお届けの準備を進めています</dd></div>');
    }
    expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, physical: "handed_over", receiving: "local_delivery" }} />)).toBe('<div><dt class="font-semibold">商品の受け取り</dt><dd class="mt-1 leading-relaxed">ポストへお届けした記録があります</dd></div>');
  });
  it("読み替えの無い状態（確認中・取消など）は、今までの文を使う", () => {
    for (const receiving of RECEIVING_METHODS) for (const physical of physicals.filter(value => !["awaiting_preparation", "preparing", "packed", "handed_over", "waiting_payment", "not_started"].includes(value))) {
      expect(physicalStatusView({ payment: "confirmed", physical, receiving })).toEqual({ heading: "商品の受け取り", text: physicalCopy[physical], place: null });
    }
  });
  it("支払いの確認待ち・決済の受付終了は、市内お届け・店頭受け取りの注文だけ、発送の言葉を外した文に差し替える", () => {
    for (const receiving of RECEIVING_METHODS) {
      expect(physicalStatusView({ payment: "confirmed", physical: "waiting_payment", receiving })).toEqual({ heading: "商品の受け取り", text: "支払確認後に準備へ進みます", place: null });
      expect(physicalStatusView({ payment: "confirmed", physical: "not_started", receiving })).toEqual({ heading: "商品の受け取り", text: "準備は始まっていません", place: null });
      expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, payment: "confirmed", physical: "waiting_payment", receiving }} />)).toContain("支払確認後に準備へ進みます");
      expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, payment: "confirmed", physical: "not_started", receiving }} />)).toContain("準備は始まっていません");
    }
    // 配送の注文は、今までの文（physicalCopy）のまま。
    expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, payment: "confirmed", physical: "waiting_payment" }} />)).toContain(physicalCopy.waiting_payment);
    expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, payment: "confirmed", physical: "not_started" }} />)).toContain(physicalCopy.not_started);
  });
  it("「7日以内に発送」の一文は、配送の注文のときだけ出す", () => {
    for (const receiving of RECEIVING_METHODS) for (const payment of payments) for (const physical of physicals) {
      expect(showsShippingWindow({ payment, physical, receiving })).toBe(false);
      expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, payment, physical, receiving }} />)).not.toContain("7日以内");
    }
    expect(showsShippingWindow({ payment: "confirmed", physical: "packed" })).toBe(true);
  });
  it("送料の行は、配送以外のときだけ方法の名前を添える", () => {
    expect(shippingFeeLabel(({ ...status } as BuyerStatus).receiving ?? "shipping")).toBe("送料");
    expect(shippingFeeLabel(({ ...status, receiving: "store_pickup" } as BuyerStatus).receiving ?? "shipping")).toBe("送料（店頭受け取り）");
  });
  it("状況の画面は、発送する商品があるときだけこの行を出す（今までと同じ条件）", () => {
    expect(read("src/features/shop/components/PurchaserStatusPanel.tsx")).toContain('{data.physical !== "not_applicable" ? <PhysicalStatus status={data} /> : null}');
  });
});

describe("利用規約 第3条と特定商取引法の表記", () => {
  const terms = renderToStaticMarkup(<TermsPage />);
  const article3 = [.../第3条（オンラインショップについて）<\/h3><ul>(.*?)<\/ul>/.exec(terms)?.[1].matchAll(/<li>(.*?)<\/li>/g) ?? []].map(match => match[1]);
  it("第3条は、既存の3つの文を1文字も変えず、その後ろに4つの文を足す", () => {
    expect(article3).toEqual([
      "商品は注文確定後に焙煎し、7日以内に発送いたします。",
      "商品の性質上、お客様都合による返品・交換はお受けできません。",
      "商品に不備があった場合は、到着後7日以内にご連絡ください。",
      "上野原市内お届け・店頭受け取りは、購入画面で選べるときにご利用いただけます。",
      "上野原市内お届けは、お届け先が上野原市内の場合に限ります。注文確定後に焙煎し、7日以内に当店がポストへお届けします。",
      "店頭受け取りは、注文確定後に焙煎し、7日以内にご用意してメールでお知らせします。お知らせのあと、コーヒースタンドの営業日に見晴亭でお受け取りください。",
      "店頭受け取りの商品は、お知らせから2回目の営業日までにお受け取りください。難しい場合は、メールでご相談ください。",
      "店頭受け取りの商品に不備があった場合は、お受け取り後7日以内にご連絡ください。",
    ]);
    const source = read("src/app/terms/page.tsx");
    for (const sentence of article3.slice(0, 3)) expect(source).toContain(`<li>${sentence}</li>`);
    expect(article3.slice(0, 3)).toEqual([purchaseConditions.shipping, purchaseConditions.customerReturn, purchaseConditions.defect]);
  });
  it("規約のほかの条は変えていない（第3条に足した4行を除くと、変える前と同じ）", () => {
    // 変える前（layer3）の利用規約の表示の sha256。logs/layer4-baseline-render.json に控えてある。
    const added = Object.values(receivingTerms).map(sentence => `<li>${sentence}</li>`).join("");
    expect(terms).toContain(added);
    expect(sha256(terms.replace(added, ""))).toBe("189eb07e8f7a960b71581d44f6e64d1bf781ea613b3718d03a56bb7b84a3995e");
  });
  it("購入画面の条件の欄に出す受け取りの文は、規約と一字も違わない", () => {
    expect(receivingCopy.conditions.local_delivery[0].text).toBe(article3[4]);
    expect(receivingCopy.conditions.store_pickup[0].text).toBe(`${article3[5]}${article3[6]}`);
    expect(receivingTerms.storePickupDefect).toBe(article3[7]);
  });
  it("選べない時期に読んでも嘘にならない一文を、規約と特商法の表記の両方に置く", () => {
    expect(article3[3]).toContain("購入画面で選べるときにご利用いただけます");
    const legal = renderToStaticMarkup(<TokushohoPage />);
    expect(legal).toContain("配送のほか、上野原市内お届け・店頭受け取りは、購入画面で選べるときにご利用いただけます");
    // その一文は、市内お届け・店頭受け取りに初めて触れる行より前にある。
    const text = plain(legal);
    expect(text.indexOf(receivingLegalNotice.methods)).toBeLessThan(text.indexOf(receivingLegalNotice.fee));
    expect(text.indexOf(receivingLegalNotice.fee)).toBeLessThan(text.indexOf(receivingLegalNotice.handover));
    expect(text.indexOf(receivingLegalNotice.handover)).toBeLessThan(text.indexOf(receivingLegalNotice.place));
  });
  it("特商法の表記は、既存の送料と引き渡し時期の文を残し、その後ろに続ける", () => {
    const source = read("src/app/tokushoho/page.tsx");
    expect(source).toContain('["送料", `全国一律 ¥370（¥5,000以上で送料無料）。${receivingLegalNotice.fee}`],');
    expect(source).toContain('["商品の引き渡し時期", `ご注文をいただいてから焙煎するため、注文確定後7日以内に発送します。${receivingLegalNotice.handover}`],');
  });
});

describe("営業日の最新情報の「Instagram」はリンク（注文ありがとうの画面・購入画面の条件・特商法の表記）", () => {
  it("Instagram の語だけがリンク。新しいタブで開き、rel は noopener noreferrer。文は一字も変わらない", () => {
    expect(linkedGuide).toBe(`見晴亭（〒409-0113 山梨県上野原市新田1053-3・上野原駅北口から徒歩すぐ）。コーヒースタンドの営業日（毎週水曜 8:00〜9:30／10:30〜16:00）にお渡しします。営業日の最新情報は <a href="${pickupInstagramHref}" target="_blank" rel="noopener noreferrer" aria-label="Instagram（新しいタブで開きます）" class="text-karekusa underline decoration-usuzumi underline-offset-4 hover:decoration-karekusa focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karekusa">Instagram</a> でご確認ください。`);
    expect(plain(linkedGuide)).toBe(pickupPlaceGuide);
    expect(pickupInstagramHref).toBe("https://www.instagram.com/misoca_coffeestand");
    // Instagram を含まない文はそのまま（リンクを足さない）。
    expect(renderToStaticMarkup(<PickupGuideText text={receivingTerms.storePickup} />)).toBe(receivingTerms.storePickup);
  });
  it("3つの画面に出る。注文ありがとうの画面（ご用意中・ご用意済み）、購入画面の条件、特商法の表記", () => {
    for (const physical of ["preparing", "handed_over"] as const) expect(renderToStaticMarkup(<PhysicalStatus status={{ ...status, physical, receiving: "store_pickup" }} />)).toContain(`href="${pickupInstagramHref}" target="_blank" rel="noopener noreferrer"`);
    expect(renderToStaticMarkup(<PurchaseConditions method="store_pickup" />)).toContain(`href="${pickupInstagramHref}" target="_blank" rel="noopener noreferrer"`);
    const legal = renderToStaticMarkup(<TokushohoPage />);
    expect(legal.match(/href="https:\/\/www\.instagram\.com\/misoca_coffeestand"/g)).toHaveLength(1);
    expect(legal).toContain(`href="${pickupInstagramHref}" target="_blank" rel="noopener noreferrer"`);
  });
});

describe("店の場所と営業の案内は、サイトに載っている内容だけを使う", () => {
  const texts = [pickupPlaceGuide, ...Object.values(receivingTerms), receivingLegalNotice.methods, receivingLegalNotice.fee, receivingLegalNotice.handover, receivingLegalNotice.place,
    ...Object.values(receivingCopy.methods).flatMap(method => [method.name, method.label, method.description]),
    ...Object.values(receivingCopy.conditions).flatMap(rows => rows.map(row => row.text)), ...Object.values(receivingCopy.status.preparing), ...Object.values(receivingCopy.status.handedOver)];
  it("コーヒースタンドのページの営業情報と同じ", () => {
    const stand = JSON.parse(read("content/pages/stand.json")) as { info: { days: string; hours: string; location: string; address: string }; followUs: { bodyLine1: string; igHref: string } };
    // 「営業日の最新情報は Instagram」のリンク先は、コーヒースタンドのページで営業日を知らせているアカウントと同じ。
    expect(pickupInstagramHref).toBe(stand.followUs.igHref);
    expect(stand.info.address).toBe(pickupPlace.address);
    expect(stand.info.location).toBe(`${pickupPlace.name}（${pickupPlace.access}）`);
    expect(stand.info.days).toBe(`${pickupPlace.days}日`);
    expect(stand.info.hours.replace(/\s/g, "").replace("/", "／")).toBe(pickupPlace.hours);
    expect(stand.followUs.bodyLine1).toContain("Instagram");
    expect(pickupPlaceGuide).toBe("見晴亭（〒409-0113 山梨県上野原市新田1053-3・上野原駅北口から徒歩すぐ）。コーヒースタンドの営業日（毎週水曜 8:00〜9:30／10:30〜16:00）にお渡しします。営業日の最新情報は Instagram でご確認ください。");
  });
  it("電話番号・個人名・メールアドレスを足していない", () => {
    for (const text of texts) {
      expect(text).not.toMatch(/\d{2,4}-\d{2,4}-\d{4}|0\d{9,10}/);
      expect(text).not.toMatch(/稲福|後藤|@/);
    }
  });
});
