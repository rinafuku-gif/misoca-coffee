import { purchaseConditions } from "./components/PurchaseTerms";
import { pickupPlace, receivingTerms, shippingFeeNotation, type DeliveryMethod } from "./receiving-method";

/** Every sentence of the new purchase flow. Policy wording is never written
 * here from scratch: each line is the existing text, or a shortened form of it
 * (the source is named next to it; SHOP-UI-NOTES-3.md lists before/after). */
export const checkoutCopy = {
  // Owner's spec (CHECKOUT-UX-SPEC-20261127 §画面 4).
  pendingLine: "お支払いはまだ完了していません。",
  resume: "お支払いに戻る",
  restart: "やり直す",
  // Coordinator (round 3): cancel not settled in one request / Stripe refused the payment page.
  restartRetry: "まだ終えられませんでした。もう一度押してください。",
  refused: "お支払い画面を開けませんでした。もう一度お試しください。",
  // 400 INVALID_REQUEST for the purchase form (CHECKOUT-FORM-WIRE.md §3).
  formRefused: "入力を受け付けられませんでした。入力を確かめてください。",
  // Spec §画面 2–3.
  toCheckout: "購入手続きへ",
  checkoutHeading: "購入手続き",
  pay: "お支払いへ進む",
  // Shortened from the old 429 notice and the old run() failure notice.
  busy: "混み合っています。少し待ってからもう一度お試しください。",
  network: "通信できませんでした。もう一度お試しください。",
  // Shortened from 「合計を確認できませんでした。商品と数量を見直してください。この操作では注文・請求は始まりません。」
  quoteFailed: "合計を出せませんでした。商品と数量を見直してください。",
  quoteRetry: "もう一度計算する",
  // Existing (ShopCatalog).
  loadFailed: "商品を読み込めませんでした",
  backToCart: "カートに戻る",
} as const;

/** Receiving-method choices, short. Shortened from receivingCopy.methods[*].description. */
export const methodShortCopy: Record<DeliveryMethod, string> = {
  shipping: `送料は${shippingFeeNotation}。`,
  local_delivery: "送料無料。上野原市内にお住まいの方限定。",
  store_pickup: `送料無料。${pickupPlace.name}（${pickupPlace.days}）でお受け取り。`,
};

/** 最終確認の表示（特定商取引法）: お支払い・お届け・返品. Shipping and returns are the
 * terms' own sentences; the two non-shipping delivery lines are shortened from 利用規約 第3条. */
export function checkoutTermsRows(method: DeliveryMethod): { term: string; text: string }[] {
  const delivery = method === "local_delivery"
    ? "注文確定後に焙煎し、7日以内に当店がポストへお届けします（上野原市内のみ）。"
    : method === "store_pickup"
      ? `注文確定後に焙煎し、7日以内にご用意してメールでお知らせします。お知らせから2回目の営業日までに${pickupPlace.name}でお受け取りください。`
      : purchaseConditions.shipping;
  return [
    { term: "お支払い", text: `${purchaseConditions.paymentMethod}。次の画面でのお手続きが完了したときに決済されます。` },
    { term: method === "store_pickup" ? "受け取り" : "お届け", text: delivery },
    { term: "返品", text: `${purchaseConditions.customerReturn}${method === "store_pickup" ? receivingTerms.storePickupDefect : purchaseConditions.defect}` },
  ];
}

/** Order status page. 「お支払いを確認しています（数秒）」 is the owner's spec; the
 * slow line is shortened from paymentCopy.waiting.description. */
export const statusCopy = {
  thanks: "ご注文ありがとうございます",
  confirming: "お支払いを確認しています（数秒）",
  slow: "決済からのお知らせを待っています。",
  check: "状況を確認",
  back: "ショップに戻る",
  orderNumber: "注文番号",
  // Shortened from the old long notices of the status page.
  missing: "このブラウザには注文の記録がありません。",
  unavailable: "注文を照合できませんでした。",
  offline: "現在、注文状況を確認できません。",
  contact: "お問い合わせ",
} as const;
