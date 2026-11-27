import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { cancelCopy, cancelDeadlineLabel, cancelRequestAnswerSchema, cancelRequestBody, cancelRequestBodyByKey, readCancelLink, readCancelRequestAnswer, statusCancelCopy, statusCancelView, type CancelRequestAnswer, type CancelView } from "../order-cancel";
import { OrderCancelView } from "../components/OrderCancelPanel";
import { StatusCancelBlock } from "../components/StatusCancel";
import { isUnmeasuredPath } from "@/shared/ui/SiteMeasurement";

const token = "a".repeat(64);
const answer = (state: CancelRequestAnswer["state"]): CancelRequestAnswer => ({ orderReference: "FIXTURE-0001", state, items: [{ name: "（試験用）豆A", unit: "300g・豆", quantity: 1 }], total: 3370 });
const render = (view: CancelView, lastAction: "preview" | "record" = "preview") => renderToStaticMarkup(<OrderCancelView view={view} busy={false} lastAction={lastAction} onRecord={() => {}} onRetry={() => {}} />);

describe("発送前のキャンセル受付（CHECKOUT-FORM-WIRE.md §5）", () => {
  it("リンクの o と t を確かめ、そのまま preview / record で送る（ほかの項目は付けない）", () => {
    const link = readCancelLink(`?o=FIXTURE-0001&t=${token}`)!;
    expect(cancelRequestBody(link, "preview")).toEqual({ orderReference: "FIXTURE-0001", token, action: "preview" });
    expect(Object.keys(cancelRequestBody(link, "record"))).toEqual(["orderReference", "token", "action"]);
    for (const bad of ["", "?o=x", `?o=a/b&t=${token}`, `?o=x&t=${"A".repeat(64)}`, `?o=x&t=${token}0`]) expect(readCancelLink(bad)).toBeNull();
  });
  it("答えの読み方: 200 は7つの状態（4c）、404/400 は使えないリンク、503/429/通信の失敗はもう一度", () => {
    expect(readCancelRequestAnswer(200, answer("open"))).toEqual({ kind: "answer", answer: answer("open") });
    expect(readCancelRequestAnswer(404, { error: "PURCHASE_NOT_AVAILABLE" }).kind).toBe("notAvailable");
    expect(readCancelRequestAnswer(400, { error: "INVALID_REQUEST" }).kind).toBe("notAvailable");
    for (const status of [503, 429, 0]) expect(readCancelRequestAnswer(status, null, answer("open"))).toEqual({ kind: "retry", answer: answer("open") });
    expect(readCancelRequestAnswer(200, { ...answer("open"), extra: 1 }).kind).toBe("retry");
    // Same answer shape as the shared transport.
    const transport = readFileSync("src/features/shop/ledger/purchase-server-transport.ts", "utf8");
    expect(transport).toContain('"cancel-request": cancelRequest');
    expect(transport).toContain('state: z.enum(["open", "requested", "recorded", "handled", "shipped", "expired", "closed"])');
    expect(transport).toContain("deadline: z.number().int().nonnegative().optional()");
    expect(cancelRequestAnswerSchema.safeParse(answer("closed")).success).toBe(true);
  });
  it("open: 注文の要約と、ボタン「キャンセルを申し込む」1つ（確かめの画面なし）", () => {
    const html = render({ kind: "answer", answer: answer("open") });
    expect(html).toContain("FIXTURE-0001"); expect(html).toContain("（試験用）豆A"); expect(html).toContain("¥3,370");
    expect(html.match(/<button/g)).toHaveLength(1); expect(html).toContain(`>${cancelCopy.button}</button>`);
  });
  it("recorded: 「受け付けました」とお店から連絡する旨。ボタンなし", () => {
    const html = render({ kind: "answer", answer: answer("recorded") }, "record");
    expect(html).toContain(">受け付けました</h1>"); expect(html).toContain("お店からご連絡します"); expect(html).not.toContain("<button");
  });
  it.each([["requested", cancelCopy.requested], ["shipped", cancelCopy.refused], ["closed", cancelCopy.refused]] as const)("%s は1行だけ・ボタンなし", (state, line) => {
    const html = render({ kind: "answer", answer: answer(state) });
    expect(html).toContain(line); expect(html).not.toContain("<button");
  });
  it("使えないリンクは1行。押した後の失敗は同じボタンをもう一度（記録は1回だけなので安全）", () => {
    const missing = render({ kind: "notAvailable" });
    expect(missing).toContain(cancelCopy.notAvailable); expect(missing).not.toContain("<button");
    expect(render({ kind: "retry", answer: answer("open") }, "record")).toContain(`>${cancelCopy.button}</button>`);
    expect(render({ kind: "retry" }, "preview")).toContain(`>${cancelCopy.again}</button>`);
  });
  it("合言葉つきのページ: 計測しない・検索に出さない・参照元を送らない・サイトの枠なし", () => {
    expect(isUnmeasuredPath("/shop/order-cancel")).toBe(true);
    const page = readFileSync("src/app/shop/order-cancel/page.tsx", "utf8");
    expect(page).toContain('robots: { index: false, follow: false }, referrer: "no-referrer"');
    expect(readFileSync("src/shared/ui/SiteShell.tsx", "utf8")).toContain('pathname === "/shop/order-cancel"');
    const panel = readFileSync("src/features/shop/components/OrderCancelPanel.tsx", "utf8");
    expect(panel).toContain('credentials: "omit"'); expect(panel).not.toMatch(/next\/(link|navigation)|<Link/);
    expect(panel.match(/ask\("record"/g)).toHaveLength(1);
  });
});

describe("round 4c: 2つの返事の形・期限・注文状況のページ", () => {
  const deadline = Date.UTC(2026, 11, 27, 14, 59); // 12月27日 23:59 JST
  it("今の管理側（v58・期限なし）と4c（期限つき・handled/expired）の返事をどちらも読む", () => {
    expect(readCancelRequestAnswer(200, answer("open")).kind).toBe("answer");
    for (const state of ["handled", "expired"] as const) expect(readCancelRequestAnswer(200, { ...answer(state), deadline }).kind).toBe("answer");
    expect(readCancelRequestAnswer(200, { ...answer("open"), deadline: -1 }).kind).toBe("retry");
  });
  it("期限は日本時間で「キャンセル受付期限：M月D日」。無ければ出さない", () => {
    expect(cancelDeadlineLabel(deadline)).toBe("キャンセル受付期限：12月27日");
    expect(cancelDeadlineLabel(Date.UTC(2026, 11, 27, 15, 0))).toBe("キャンセル受付期限：12月28日");
    expect(cancelDeadlineLabel(undefined)).toBeNull();
  });
  it("メールのリンクのページ: open は期限を出す。handled・expired は1行・ボタンなし", () => {
    expect(render({ kind: "answer", answer: { ...answer("open"), deadline } })).toContain("キャンセル受付期限：12月27日");
    expect(render({ kind: "answer", answer: answer("open") })).not.toContain("キャンセル受付期限");
    for (const [state, line] of [["handled", cancelCopy.handled], ["expired", cancelCopy.expired]] as const) {
      const html = render({ kind: "answer", answer: { ...answer(state), deadline } }); expect(html).toContain(line); expect(html).not.toContain("<button");
    }
  });
  it("注文状況のページからは購入キーだけを送る（合言葉なし・ほかの項目なし）", () => {
    expect(cancelRequestBodyByKey("b".repeat(64), "preview")).toEqual({ purchaseKey: "b".repeat(64), action: "preview" });
  });
  it("注文状況のページの見せ方: open だけボタン。requested は済みの1行。shipped/handled/expired/closed と 400・404・503 の確かめは黙って出さない", () => {
    expect(statusCancelView({ kind: "answer", answer: { ...answer("open"), deadline } }, "preview")).toEqual({ kind: "open", deadline });
    expect(statusCancelView({ kind: "answer", answer: answer("requested") }, "preview")).toEqual({ kind: "accepted", recordedNow: false });
    expect(statusCancelView({ kind: "answer", answer: answer("recorded") }, "record")).toEqual({ kind: "accepted", recordedNow: true });
    for (const state of ["shipped", "handled", "expired", "closed"] as const) expect(statusCancelView({ kind: "answer", answer: answer(state) }, "preview").kind).toBe("hidden");
    for (const status of [400, 404, 503, 429, 0]) expect(statusCancelView(readCancelRequestAnswer(status, null), "preview").kind).toBe("hidden");
    expect(statusCancelView(readCancelRequestAnswer(503, null), "record", deadline)).toEqual({ kind: "retry", deadline });
  });
  it("ボタン → その場の1行「本当にキャンセルしますか？ はい／いいえ」 → 受け付けの1行", () => {
    const block = (view: Parameters<typeof StatusCancelBlock>[0]["view"], confirming = false) => renderToStaticMarkup(<StatusCancelBlock view={view} confirming={confirming} busy={false} onAsk={() => {}} onYes={() => {}} onNo={() => {}} />);
    const open = block({ kind: "open", deadline });
    expect(open).toContain("キャンセル受付期限：12月27日"); expect(open.match(/<button/g)).toHaveLength(1); expect(open).toContain(`>${statusCancelCopy.button}</button>`);
    const asking = block({ kind: "open", deadline }, true);
    expect(asking).toContain(statusCancelCopy.confirm); expect(asking).toContain(">はい</button>"); expect(asking).toContain(">いいえ</button>"); expect(asking).not.toContain(`>${statusCancelCopy.button}</button>`);
    expect(block({ kind: "accepted", recordedNow: true })).toContain("キャンセルを受け付けました。お店から返金のご連絡をします。");
    expect(block({ kind: "accepted", recordedNow: false })).toContain("キャンセルを受け付け済みです");
    expect(block({ kind: "hidden" })).toBe("");
    expect(block({ kind: "open", deadline: undefined })).not.toContain("キャンセル受付期限");
  });
  it("注文状況のページは支払い確認済みのときだけ、status と同じ購入キーで1回だけ確かめる", () => {
    const status = readFileSync("src/features/shop/components/PurchaserStatusPanel.tsx", "utf8");
    expect(status).toContain('{data.payment === "confirmed" && view.purchaseKey ? <StatusCancel purchaseKey={view.purchaseKey} /> : null}');
    const part = readFileSync("src/features/shop/components/StatusCancel.tsx", "utf8");
    expect(part).toContain("if (asked.current === purchaseKey) return;"); expect(part).toContain('credentials: "omit"');
    expect(part.match(/send\(purchaseKey, "record"\)/g)).toHaveLength(1);
  });
});
