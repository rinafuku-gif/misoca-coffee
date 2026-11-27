import { z } from "zod";

/** 発送前のキャンセル受付 (CHECKOUT-FORM-WIRE.md §5). The page relays the link's
 * order number and token to POST /api/ec/purchase/cancel-request:
 * "preview" when the page opens (records nothing), "record" when the button is
 * pressed (recorded once on the server; pressing again records nothing more). */
export const CANCEL_REQUEST_PATH = "/api/ec/purchase/cancel-request";
export type CancelRequestAction = "preview" | "record";
export function readCancelLink(search: string): { orderReference: string; token: string } | null {
  const params = new URLSearchParams(search);
  const orderReference = params.get("o") ?? "", token = params.get("t") ?? "";
  return /^[A-Za-z0-9_-]{1,128}$/.test(orderReference) && /^[a-f0-9]{64}$/.test(token) ? { orderReference, token } : null;
}
export const cancelRequestBody = (link: { orderReference: string; token: string }, action: CancelRequestAction) =>
  ({ orderReference: link.orderReference, token: link.token, action });

/** Same shape the shared transport accepts for this answer. */
export const cancelRequestAnswerSchema = z.object({
  orderReference: z.string().min(1).max(128), state: z.enum(["open", "requested", "recorded", "shipped", "closed"]),
  items: z.array(z.object({ name: z.string(), unit: z.string(), quantity: z.number().int().positive() }).strict()).max(20), total: z.number().int().nonnegative(),
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

/** Wording: the state lines are the wire file's examples; the title after a
 * request is the coordinator's 「受け付けました」. */
export const cancelCopy = {
  title: "キャンセルのお申し込み",
  button: "キャンセルを申し込む",
  recordedTitle: "受け付けました",
  recorded: "お店からご連絡します。お金の払い戻しは自動では行いません。",
  requested: "お申し込みを受け付けています。店舗からご連絡します。",
  refused: "ここからはお申し込みいただけません。ご注文確認メールへの返信でご連絡ください。",
  notAvailable: "このリンクではお申し込みいただけません。ご注文確認メールへの返信でご連絡ください。",
  retry: "少し時間をおいて、もう一度お試しください。",
  again: "もう一度試す",
  loading: "確認しています…",
  orderNumber: "注文番号",
  total: "合計",
  back: "ショップに戻る",
} as const;
