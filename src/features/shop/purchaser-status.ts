import { z } from "zod";
import { buyerProductPublicationSchema } from "./product-publication-view";

/** Browser-safe wire contract: no ledger/native/auth imports. */
export const purchaserStatusSchema = z.object({
  orderReference: z.string().min(1).max(128), createdAt: z.number().int().nonnegative(),
  items: z.array(z.object({ skuId: z.string(), name: z.string(), unit: z.string(), quantity: z.number().int().positive(), unitPrice: z.number().int().nonnegative(), kind: z.enum(["physical", "gift"]), publication: buyerProductPublicationSchema.optional() }).strict()).max(20),
  total: z.number().int().nonnegative(), shipping: z.number().int().nonnegative(), refundedTotal: z.number().int().nonnegative(),
  payment: z.enum(["waiting", "confirmed", "under_review", "closed", "refunded", "partially_refunded"]),
  physical: z.enum(["not_applicable", "cancelled", "delivery_issue", "handed_over", "partially_handed_over", "waiting_payment", "not_started", "under_review", "awaiting_preparation", "replacement_preparing", "packed", "preparing"]),
  giftDelivery: z.enum(["not_applicable", "waiting_payment", "not_started", "under_review", "awaiting_preparation", "provider_accepted", "checking_delivery", "delivery_failed", "preparing"]),
  confirmationEmail: z.enum(["provider_accepted", "checking_delivery", "delivery_failed", "not_sent"]),
  cancellation: z.enum(["none", "checking", "closed", "payment_review"]),
}).strict();
export type BuyerStatus = z.infer<typeof purchaserStatusSchema>;
export const PURCHASE_STORAGE_KEY = "misoca-purchase-v1";
export const purchaseCancellationResultSchema = z.union([
  z.object({ cancellation: z.literal("not_created"), orderMayExist: z.literal(false) }).strict(),
  z.object({ cancellation: z.enum(["checking", "closed", "payment_review"]), status: purchaserStatusSchema }).strict().refine(value => value.cancellation === value.status.cancellation),
]);
export type PurchaseCancellationResult = z.infer<typeof purchaseCancellationResultSchema>;
export const cancellationCopy = {
  none: "",
  checking: "決済中止の結果を確認しています。受付終了はまだ確定していません。同じ内容を買い直さず、この依頼の確認を続けてください。",
  closed: "この決済の受付は終了しました。返金を実行したという意味ではありません。請求の心当たりがある場合は注文番号を添えて店舗へお問い合わせください。",
  payment_review: "支払い済み、または支払処理中の可能性があるため、店舗の確認が必要です。自動で取消・返金はしていません。注文番号を添えて店舗へお問い合わせください。",
};

export const paymentCopy: Record<BuyerStatus["payment"], { title: string; description: string }> = {
  waiting: { title: "お支払いの確認中です", description: "決済からのお知らせを待っています。同じ注文を買い直さず、しばらくしてから状況を確認してください。" },
  confirmed: { title: "お支払いを確認しました", description: "ご注文を記録しました。商品やギフト券の準備状況は下に表示します。" },
  under_review: { title: "店舗で注文を確認しています", description: "お支払いや配送情報などの確認が必要な状態です。同じ注文の買い直しはしないでください。" },
  closed: { title: "この注文の決済受付は終了しました", description: "この記録ではお支払いの完了を確認できていません。請求がある場合は、再購入する前に店舗へお問い合わせください。" },
  refunded: { title: "全額の返金記録があります", description: "返金額を下に表示します。口座やカードへの反映時期は、ご利用の決済方法によって異なります。" },
  partially_refunded: { title: "一部の返金記録があります", description: "返金額と配送の状況を下に表示します。不明な場合は注文番号を添えて店舗へお問い合わせください。" },
};
export const physicalCopy: Record<BuyerStatus["physical"], string> = {
  partially_handed_over: "一部の荷物を配送事業者へ引き渡した記録があります。残りの荷物の差出はまだ確認できていません",
  not_applicable: "配送する商品はありません", cancelled: "出荷を取り消しました（返金とは別の記録です）", delivery_issue: "配送に関する確認が必要です。店舗へお問い合わせください", handed_over: "配送事業者への引渡しを記録しました（到着済みではありません）",
  waiting_payment: "支払確認後に発送の準備へ進みます", not_started: "発送は始まっていません", under_review: "店舗での確認後にご案内します", awaiting_preparation: "発送準備の開始待ちです", replacement_preparing: "再送分を準備しています", packed: "梱包済みです。まだ発送していません", preparing: "発送の準備を進めています",
};
const shippingWindowStates: ReadonlySet<BuyerStatus["physical"]> = new Set(["awaiting_preparation", "preparing", "packed"]);
/** The status page repeats the published shipping window only while payment
 * is confirmed AND the first parcel has not left yet. Payment is checked on
 * its own because the two fields are independent in the schema: a refunded
 * order must never be shown a shipping promise. A re-shipment
 * (replacement_preparing) is not what the published sentence covers. */
export const showsShippingWindow = (status: Pick<BuyerStatus, "payment" | "physical">) =>
  status.payment === "confirmed" && shippingWindowStates.has(status.physical);
export const giftCopy: Record<BuyerStatus["giftDelivery"], string> = {
  not_applicable: "ギフト券はありません", waiting_payment: "支払確認後に券の準備へ進みます", not_started: "券の送付は始まっていません", under_review: "店舗での確認後にご案内します", awaiting_preparation: "券の準備開始待ちです", provider_accepted: "メール送信の受付を確認しました。受信箱への到着は未確認です", checking_delivery: "送信結果を確認しています。重ねて送りません", delivery_failed: "送信を受け付けられませんでした。店舗での対応が必要です", preparing: "券を準備しています。まだ送っていません",
};
export const emailCopy: Record<BuyerStatus["confirmationEmail"], string> = {
  provider_accepted: "送信の受付を確認しました。受信箱への到着は未確認です", checking_delivery: "送信結果を確認しています", delivery_failed: "送信を受け付けられませんでした", not_sent: "まだ送っていません。この画面で注文状況を確認できます",
};
