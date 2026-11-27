import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CHECKOUT_REFUSED_ERROR, isAttemptConflict, isCheckoutRefused, isFormRefused, readRestartOutcome } from "../checkout-outcome";
import { checkoutCopy, checkoutTermsRows, methodShortCopy, statusCopy } from "../checkout-copy";
import { CheckoutTerms, MethodPicker, PaymentPendingBanner } from "../components/CheckoutParts";
import { PurchaserStatusPanel, STATUS_POLL_LIMIT_MS, STATUS_POLL_MS } from "../components/PurchaserStatusPanel";
import { purchaseConditions } from "../components/PurchaseTerms";
import { receivingTerms } from "../receiving-method";
import type { BuyerStatus } from "../purchaser-status";

const read = (path: string) => readFileSync(path, "utf8");
const panel = read("src/features/shop/components/PurchasePanel.tsx");
const statusPanel = read("src/features/shop/components/PurchaserStatusPanel.tsx");
const status = (over: Partial<BuyerStatus> = {}): BuyerStatus => ({ orderReference: "order-fixture", createdAt: 1, items: [], total: 620, shipping: 370, refundedTotal: 0, payment: "waiting", physical: "waiting_payment", giftDelivery: "not_applicable", confirmationEmail: "not_sent", cancellation: "none", ...over });
const noop = () => {};

describe("サーバーの答えの読み方（1か所の変換・2026-11-27 決定の形）", () => {
  const closedStatus = status({ payment: "closed", cancellation: "closed" });
  it("やり直す: closed（支払いは閉じた）・not_created → 購入手続きへ戻る", () => {
    expect(readRestartOutcome(true, { cancellation: "closed", status: closedStatus }).kind).toBe("ended");
    expect(readRestartOutcome(true, { cancellation: "not_created", orderMayExist: false }).kind).toBe("ended");
  });
  it("やり直す: checking（支払いは under_review で届く）・503 → もう一度押してもらう。状況の画面へは行かない", () => {
    expect(readRestartOutcome(true, { cancellation: "checking", status: status({ payment: "under_review", cancellation: "checking" }) }).kind).toBe("retry");
    expect(readRestartOutcome(false, { error: "SERVICE_UNAVAILABLE" }).kind).toBe("retry");
    for (const body of [null, { cancellation: "closed" }, { cancellation: "not_created" }]) expect(readRestartOutcome(true, body).kind).toBe("retry");
  });
  it("やり直す: payment_review（支払い済み）→ 状況の画面へ", () => {
    expect(readRestartOutcome(true, { cancellation: "payment_review", status: status({ payment: "under_review", cancellation: "payment_review" }) }).kind).toBe("toStatus");
    expect(readRestartOutcome(true, { cancellation: "closed", status: status({ payment: "refunded", cancellation: "closed" }) }).kind).toBe("toStatus");
  });
  it("Stripeが断った: 409 ORDER_NOT_PAYABLE、または同じ鍵の 200（支払い画面なし・payment closed・cancellation none）", () => {
    expect(CHECKOUT_REFUSED_ERROR).toBe("ORDER_NOT_PAYABLE");
    expect(isCheckoutRefused(false, { error: "ORDER_NOT_PAYABLE" })).toBe(true);
    expect(isCheckoutRefused(true, { checkoutUrl: null, status: status({ payment: "closed", cancellation: "none" }) })).toBe(true);
    for (const [ok, body] of [
      [false, { error: "SERVICE_UNAVAILABLE" }], [false, { error: "CHECKOUT_REFUSED", orderMayExist: false }], [false, null],
      [true, { checkoutUrl: null, status: status({ payment: "confirmed" }) }],
      [true, { checkoutUrl: null, status: status({ payment: "closed", cancellation: "closed" }) }],
      [true, { checkoutUrl: "https://checkout.stripe.com/c/x", status: status({ payment: "closed" }) }],
      [true, { checkoutUrl: null, status: { payment: "closed" } }],
    ] as const) expect(isCheckoutRefused(ok, body)).toBe(false);
  });
});

describe("入力つきの決済の答え（CHECKOUT-FORM-WIRE.md §3）", () => {
  it("400 INVALID_REQUEST は入力の拒否（注文なし）。409 ATTEMPT_CONFLICT は同じ鍵で違う入力", () => {
    expect(isFormRefused(false, { error: "INVALID_REQUEST" })).toBe(true);
    expect(isAttemptConflict(false, { error: "ATTEMPT_CONFLICT" })).toBe(true);
    for (const [ok, body] of [[true, { error: "INVALID_REQUEST" }], [false, { error: "SERVICE_UNAVAILABLE" }], [false, null]] as const) { expect(isFormRefused(ok, body)).toBe(false); expect(isAttemptConflict(ok, body)).toBe(false); }
  });
  it("入力の拒否はバナーを出さず、支払いボタンのそばに1行。違う入力の 409 は1回だけ、前を終えて新しい鍵で続ける", () => {
    expect(panel).toContain("if (isFormRefused(result.ok, result.body)) { save({ ...latest, attempt: null, viewKey: null }); setFormRefused(true); setSubmitted(true); openCheckout(); return; }");
    expect(panel).toContain("{formRefused ? <p role=\"alert\"");
    expect(panel).toContain("if (isAttemptConflict(result.ok, result.body)) { await replaceAttempt(attempt); return; }");
    expect(panel).toContain("if (conflictHandled.current) { showPending(); return; }");
    expect(panel).toContain("const outcome = await endAttempt(previous.purchaseKey);");
    expect(panel).toContain("const purchaseKey = newPurchaseKey(), current = readPurchaseSession(sessionStorage);");
    expect(panel.match(/send\("cancel"/g)).toHaveLength(1);
  });
});

describe("止めない画面: お支払いに戻る / やり直す", () => {
  it("1行と2つのボタン。確認の画面や「確認を続けています」は出さない", () => {
    const html = renderToStaticMarkup(<PaymentPendingBanner canResume resumeDisabled={false} busy={false} line="" onResume={noop} onRestart={noop} />);
    expect(html).toContain(checkoutCopy.pendingLine);
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).toContain(">お支払いに戻る</button>"); expect(html).toContain(">やり直す</button>");
    expect(html).not.toMatch(/確認を続けています|type="checkbox"|中止の内容を確認/);
    expect(html.match(/min-h-12/g)).toHaveLength(2);
  });
  it("やり直しを依頼した後は、同じ支払い画面へは戻さない（やり直すだけ）。結果の一文を出す", () => {
    const html = renderToStaticMarkup(<PaymentPendingBanner canResume={false} resumeDisabled={false} busy={false} line={checkoutCopy.restartRetry} onResume={noop} onRestart={noop} />);
    expect(html.match(/<button/g)).toHaveLength(1); expect(html).toContain(">やり直す</button>");
    expect(html).toContain(`role="alert"`); expect(html).toContain("もう一度押してください");
  });
  it("文面は決めたとおり", () => {
    expect(checkoutCopy.pendingLine).toBe("お支払いはまだ完了していません。");
    expect(checkoutCopy.refused).toBe("お支払い画面を開けませんでした。もう一度お試しください。");
    expect([checkoutCopy.toCheckout, checkoutCopy.pay]).toEqual(["購入手続きへ", "お支払いへ進む"]);
  });
});

describe("購入手続きの部品", () => {
  it("受け取り方法は短い文で選ぶ（ラジオ・ラベルと結び付く）", () => {
    const html = renderToStaticMarkup(<MethodPicker methods={["shipping", "local_delivery", "store_pickup"]} value="local_delivery" onChange={noop} />);
    for (const text of Object.values(methodShortCopy)) expect(html).toContain(text);
    expect(html.match(/type="radio"/g)).toHaveLength(3);
    expect(html).toContain('for="checkout-method-store_pickup"');
    expect(renderToStaticMarkup(<MethodPicker methods={[]} value="shipping" onChange={noop} />)).toBe("");
  });
  it("最終確認の項目（支払いの時期と方法・引渡し・返品）と2つのリンク。文は既存の文か、その短縮だけ。金額は書かない", () => {
    const shipping = renderToStaticMarkup(<CheckoutTerms method="shipping" />);
    for (const text of [purchaseConditions.paymentMethod, "次の画面でのお手続きが完了したときに決済されます。", purchaseConditions.shipping, purchaseConditions.customerReturn, purchaseConditions.defect]) expect(shipping).toContain(text);
    for (const href of ["/tokushoho", "/terms"]) expect(shipping).toMatch(new RegExp(`<a href="${href}" target="_blank" rel="noopener noreferrer"`));
    expect(shipping).not.toMatch(/[¥￥]|\d+\s*円|type="checkbox"/);
    const pickup = renderToStaticMarkup(<CheckoutTerms method="store_pickup" />);
    expect(pickup).toContain(receivingTerms.storePickupDefect); expect(pickup).toContain("見晴亭でお受け取りください");
    expect(checkoutTermsRows("local_delivery")[1].text).toContain("上野原市内のみ");
  });
});

describe("購入画面の流れ（安全のきまりは変えない）", () => {
  it("確認のチェック・合計を出すための別ボタン・中止の確認の画面・長い説明を持たない", () => {
    for (const gone of ['type="checkbox"', "送料を含む合計を確認", "CheckoutCancellationPanel", "決済中止の確認を続けています", "この注文の状況を確認", "同じ内容の新しい注文は作らず", "このタブで確認した注文", "選ぶだけでは注文されません"]) expect(panel, gone).not.toContain(gone);
  });
  it("方法を選ぶ・手続きを開くと、合計はそのまま取りに行く（同じ組み合わせで1回だけ・失敗は自動で繰り返さない）", () => {
    expect(panel).toContain("lastQuoteKey.current = quoteKey; requestQuote();");
    expect(panel).toContain("lastQuoteKey.current === quoteKey) return;");
    expect(panel).toContain("{checkoutCopy.quoteRetry}");
  });
  it("やり直すは中止の依頼を1回だけ送り、応答は1か所の変換で読む。自動では送らない", () => {
    expect(panel.match(/send\("cancel"/g)).toHaveLength(1);
    expect(panel).toContain("const outcome = readRestartOutcome(result.ok, result.body);");
    expect(panel).toContain("onRestart={() => { void run(restart); }}");
    expect(panel.match(/run\(restart\)/g)).toHaveLength(1);
    // 1手続き1キー: 鍵は begin() で1回だけ作り、お支払いに戻るは同じ記録を送る。
    expect(panel.match(/crypto\.getRandomValues/g)).toHaveLength(1);
    // 購入の通信は1か所（purchase-catalog.ts の postPurchase）。Cookie を送らない。
    expect(panel).toContain("postPurchase as post");
    expect(readFileSync("src/features/shop/purchase-catalog.ts", "utf8")).toContain('credentials: "omit"');
  });
  it("断られたときは注文を残さず、同じボタンをもう一度押せる", () => {
    expect(panel).toContain("if (isCheckoutRefused(result.ok, result.body)) { save({ ...latest, attempt: null, viewKey: null }); setRefused(true); openCheckout(); return; }");
    // Checked before the null-URL success branch, so a replayed refused key never lands on the status page.
    expect(panel.indexOf("isCheckoutRefused(result.ok")).toBeLessThan(panel.indexOf("result.body.checkoutUrl === null"));
    expect(panel).toContain("setRefused(false);");
  });
  it("ページはいつも上から始まる（戻る・読み直しでフッターに飛ばない）", () => {
    for (const source of [panel, statusPanel]) expect(source).toContain("usePageStartsAtTop();");
    const hook = read("src/features/shop/components/use-page-top.ts");
    expect(hook).toContain('window.history.scrollRestoration = "manual";');
    expect(hook).toContain('window.scrollTo({ top: 0, behavior: "instant" });');
  });
});

describe("完了・注文状況の画面", () => {
  it("開いた直後は「お支払いを確認しています（数秒）」で、押すボタンは出さない", () => {
    const html = renderToStaticMarkup(<PurchaserStatusPanel />);
    expect(html).toContain(statusCopy.confirming);
    expect(html).not.toContain(`>${statusCopy.check}<`);
    expect(html).toContain(">ショップに戻る</a>");
    expect(html.match(/<main[ >]/g)).toHaveLength(1);
  });
  it("知らせが来るまで数秒ごとに自分で確かめ直し、30秒たったときだけボタンを出す", () => {
    expect(STATUS_POLL_MS).toBeLessThanOrEqual(3000); expect(STATUS_POLL_LIMIT_MS).toBe(30000);
    expect(statusPanel).toContain("if (Date.now() - startedAt.current >= STATUS_POLL_LIMIT_MS) setSlow(true); else void refresh();");
    expect(statusPanel).toContain("const showCheck = view.kind === \"busy\" || view.kind === \"offline\" || waiting && slow;");
    expect(statusPanel).not.toMatch(/CheckoutCancellationPanel|emailCopy|わからないときは/);
  });
});
