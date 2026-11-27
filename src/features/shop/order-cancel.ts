import { z } from "zod";

/** 発送前のキャンセル受付 (CHECKOUT-FORM-WIRE.md §5, round 4c). Two ways in:
 * (a) the mail link page relays the link's order number and token;
 * (b) the order status page relays the purchase key it already uses for status.
 * "preview" records nothing; "record" is stored once on the server. */
export const CANCEL_REQUEST_PATH = "/api/ec/purchase/cancel-request";
export type CancelRequestAction = "preview" | "record";
export function readCancelLink(search: string): { orderReference: string; token: string } | null {
  const params = new URLSearchParams(search);
  const orderReference = params.get("o") ?? "", token = params.get("t") ?? "";
  return /^[A-Za-z0-9_-]{1,128}$/.test(orderReference) && /^[a-f0-9]{64}$/.test(token) ? { orderReference, token } : null;
}
export const cancelRequestBody = (link: { orderReference: string; token: string }, action: CancelRequestAction) =>
  ({ orderReference: link.orderReference, token: link.token, action });
/** (b) from the order status page. Until management runs 4c this body is answered 400. */
export const cancelRequestBodyByKey = (purchaseKey: string, action: CancelRequestAction) => ({ purchaseKey, action });

/** Same shape the shared transport accepts for this answer. `deadline` is optional:
 * the live management release (v58, 4b) does not send it; 4c always does. */
export const cancelRequestAnswerSchema = z.object({
  orderReference: z.string().min(1).max(128), state: z.enum(["open", "requested", "recorded", "handled", "shipped", "expired", "closed"]),
  items: z.array(z.object({ name: z.string(), unit: z.string(), quantity: z.number().int().positive() }).strict()).max(20), total: z.number().int().nonnegative(),
  deadline: z.number().int().nonnegative().optional(),
}).strict();
export type CancelRequestAnswer = z.infer<typeof cancelRequestAnswerSchema>;

export type CancelView =
  | { kind: "loading" }
  | { kind: "answer"; answer: CancelRequestAnswer }
  | { kind: "notAvailable" }   // wrong token / no such order / malformed link (not told apart)
  | { kind: "retry"; answer?: CancelRequestAnswer };  // 503 / 429 / network: press again
export function readCancelRequestAnswer(status: number, body: unknown, previous?: CancelRequestAnswer): CancelView {
  if (status === 200) { const parsed = cancelRequestAnswerSchema.safeParse(body); return parsed.success ? { kind: "answer", answer: parsed.data } : { kind: "retry", answer: previous }; }
  if (status === 404 || status === 400) return { kind: "notAvailable" };
  return { kind: "retry", answer: previous };
}

/** 「キャンセル受付期限：M月D日」 in Japan time (the deadline is UTC ms). */
export function cancelDeadlineLabel(deadline: number | undefined): string | null {
  if (deadline === undefined) return null;
  const parts = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric" }).formatToParts(new Date(deadline));
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  return `キャンセル受付期限：${get("month")}月${get("day")}日`;
}

/** キャンセルのお申し込みの前後で伝えること（メールのリンクのページと注文状況のページで共通）。
 * 事実: 申し込みの時点では未確定／お店が発送の状況を確かめる／確定したらメールで知らせ、全額を返金する
 * （明細に出る時期はカード会社などによる）／発送の準備が進んでいればお受けできないことがあり、その場合も
 * メールで知らせる。申し込みを受け付けたことのメールは送らない（2026-11-28 店主の判断）。日数は約束しない。 */
export const cancelFlowCopy = {
  before: "お申し込みの時点では、まだキャンセルは確定していません。お店で発送の状況を確かめ、キャンセルが確定したらメールでお知らせします。発送の準備が進んでいる場合は、お受けできないことがあります（その場合もメールでお知らせします）。",
  acceptedTitle: "キャンセルのお申し込みを受け付けました",
  requestedTitle: "キャンセルのお申し込みは受け付け済みです",
  /** 受付後・申し込み済みのどちらでも、見出しのすぐ下に目立たせて出す。 */
  notYet: "まだキャンセルは確定していません。キャンセルが確定したら、メールでお知らせします。",
  stepsHeading: "このあとの流れ",
  steps: [
    "お店で発送の状況を確かめます。",
    "キャンセルが確定したら、メールでお知らせし、お支払いの全額を返金します（明細に表示される時期は、カード会社などによって異なります）。",
    "発送の準備が進んでいてお受けできない場合も、メールでお知らせします。",
  ],
} as const;

/** Wording of the mail-link page (/shop/order-cancel). handled / expired / refused /
 * notAvailable are the wire file's examples. */
export const cancelCopy = {
  title: "キャンセルのお申し込み",
  open: cancelFlowCopy.before,
  button: "キャンセルを申し込む",
  recordedTitle: cancelFlowCopy.acceptedTitle,
  requestedTitle: cancelFlowCopy.requestedTitle,
  refused: "ここからはお申し込みいただけません。ご注文確認メールへの返信でご連絡ください。",
  handled: "このお申し込みは、店舗で対応が済んでいます。くわしくはお送りしたメールをご覧ください。",
  expired: "キャンセルの受付期限を過ぎています。ご注文確認メールへの返信でご連絡ください。",
  notAvailable: "このリンクではお申し込みいただけません。ご注文確認メールへの返信でご連絡ください。",
  retry: "少し時間をおいて、もう一度お試しください。",
  again: "もう一度試す",
  loading: "確認しています…",
  orderNumber: "注文番号",
  total: "合計",
  back: "ショップに戻る",
} as const;

/** The order status page's part. */
export const statusCancelCopy = {
  button: "キャンセルを申し込む",
  confirm: "キャンセルを申し込みますか？",
  confirmNote: cancelFlowCopy.before,
  yes: "はい",
  no: "いいえ",
  recordedTitle: cancelFlowCopy.acceptedTitle,
  requestedTitle: cancelFlowCopy.requestedTitle,
  retry: "少し時間をおいて、もう一度お試しください。",
} as const;
/** What the status page shows for a preview/record answer. Anything other than
 * a readable 200 hides the part without a word on preview (e.g. 400 until
 * management runs 4c, 404 after ~30 days); a failed record keeps the button. */
export type StatusCancelView = { kind: "hidden" } | { kind: "open"; deadline: number | undefined } | { kind: "accepted"; recordedNow: boolean } | { kind: "retry"; deadline: number | undefined };
export function statusCancelView(view: CancelView, action: CancelRequestAction, previousDeadline?: number): StatusCancelView {
  if (view.kind === "answer") {
    const { state, deadline } = view.answer;
    if (state === "open") return { kind: "open", deadline };
    if (state === "recorded") return { kind: "accepted", recordedNow: true };
    if (state === "requested") return { kind: "accepted", recordedNow: false };
    return { kind: "hidden" };  // handled / shipped / expired / closed
  }
  if (view.kind === "retry" && action === "record") return { kind: "retry", deadline: previousDeadline };
  return { kind: "hidden" };
}
