import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { cancelCopy, cancelRequestAnswerSchema, cancelRequestBody, readCancelLink, readCancelRequestAnswer, type CancelRequestAnswer, type CancelView } from "../order-cancel";
import { OrderCancelView } from "../components/OrderCancelPanel";
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
  it("答えの読み方: 200 は5つの状態、404/400 は使えないリンク、503/429/通信の失敗はもう一度", () => {
    expect(readCancelRequestAnswer(200, answer("open"))).toEqual({ kind: "answer", answer: answer("open") });
    expect(readCancelRequestAnswer(404, { error: "PURCHASE_NOT_AVAILABLE" }).kind).toBe("notAvailable");
    expect(readCancelRequestAnswer(400, { error: "INVALID_REQUEST" }).kind).toBe("notAvailable");
    for (const status of [503, 429, 0]) expect(readCancelRequestAnswer(status, null, answer("open"))).toEqual({ kind: "retry", answer: answer("open") });
    expect(readCancelRequestAnswer(200, { ...answer("open"), extra: 1 }).kind).toBe("retry");
    // Same answer shape as the shared transport.
    const transport = readFileSync("src/features/shop/ledger/purchase-server-transport.ts", "utf8");
    expect(transport).toContain('"cancel-request": cancelRequest');
    expect(transport).toContain('state: z.enum(["open", "requested", "recorded", "shipped", "closed"])');
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
