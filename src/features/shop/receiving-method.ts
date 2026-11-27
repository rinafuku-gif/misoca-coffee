import { z } from "zod";
import { RECEIVING_METHODS, physicalCopy, type BuyerStatus } from "./purchaser-status";
import type { CheckoutFormWire } from "./checkout-form";

/** Website-only rules and wording for the receiving method
 * (配送／上野原市内お届け／店頭受け取り).
 *
 * purchaser-status.ts and ledger/purchase-server-transport.ts are kept
 * byte-identical with the management side, so everything only the website
 * needs lives here. Three rules from the shared contract:
 *  1. A shipping order sends exactly the request it always sent: no
 *     `deliveryMethod` key at all.
 *  2. No amount is computed or held here. The fee and the total shown to the
 *     buyer are always the values in the quote / order-status answer.
 *  3. Which methods can be chosen comes from the catalog answer
 *     (`deliveryMethods`). The website holds no open/closed switch. */
export const DELIVERY_METHODS = ["shipping", ...RECEIVING_METHODS] as const;
export type DeliveryMethod = typeof DELIVERY_METHODS[number];
export type ReceivingMethod = typeof RECEIVING_METHODS[number];

/** The agreed shape of the catalog answer field: 1–3 known names, "shipping"
 * first, the rest in the fixed order, no repeats. The transport copy checks
 * names and count; the order is checked here, in the browser. */
export const deliveryMethodsSchema = z.array(z.enum(DELIVERY_METHODS)).min(1).max(3).refine(methods =>
  methods[0] === "shipping" && methods.every((method, index) => index === 0 || DELIVERY_METHODS.indexOf(method) > DELIVERY_METHODS.indexOf(methods[index - 1])));
/** How the purchase screen reads that field. A value that does not have the
 * agreed shape (wrong order, not starting with shipping, repeats, not an
 * array…) is read as if the field were absent: shipping only, no chooser, no
 * `deliveryMethod` sent. It never fails the catalog itself, so buying with
 * shipping keeps working exactly as before. */
export const catalogDeliveryMethodsSchema = deliveryMethodsSchema.optional().catch(undefined);

type CartLines = readonly { skuId: string; quantity: number }[];

/** The choices to show. Empty means no chooser: shipping only, as before.
 * Shown only when the catalog offers something besides shipping AND the cart
 * holds a product that is shipped (a gift-ticket-only cart never chooses). */
export function selectableMethods(offered: readonly DeliveryMethod[] | undefined, cartHasPhysical: boolean): readonly DeliveryMethod[] {
  return offered && cartHasPhysical && offered.some(method => method !== "shipping") ? offered : [];
}
/** The method a request carries. A saved choice that cannot be chosen right
 * now (not offered, no chooser) is never sent: the request is plain shipping. */
export function requestedMethod(saved: ReceivingMethod | undefined, selectable: readonly DeliveryMethod[]): DeliveryMethod {
  return saved !== undefined && selectable.includes(saved) ? saved : "shipping";
}
/** Shipping keeps the body the website has always sent, byte for byte. */
export function quoteRequestBody(lines: CartLines, method: DeliveryMethod) {
  return method === "shipping" ? { lines } : { lines, deliveryMethod: method };
}
/** Built only from the saved attempt, so returning to the same payment sends
 * the same method as the first request (or none, for shipping). */
export function checkoutRequestBody(attempt: { purchaseKey: string; lines: CartLines; acceptedQuote: string; deliveryMethod?: ReceivingMethod; form?: CheckoutFormWire }) {
  const body = { purchaseKey: attempt.purchaseKey, lines: attempt.lines, acceptedQuote: attempt.acceptedQuote };
  const withMethod = attempt.deliveryMethod === undefined ? body : { ...body, deliveryMethod: attempt.deliveryMethod };
  // PROVISIONAL key until CHECKOUT-FORM-WIRE.md: absent unless the attempt carries the form.
  return attempt.form === undefined ? withMethod : { ...withMethod, form: attempt.form };
}

// ---------------------------------------------------------------------------
// 文面（仮）。店主が後で直す文は、すべてこの下に集めてある。
// 店の場所と営業の案内は、コーヒースタンドのページ（content/pages/stand.json）
// と同じ内容だけを使う。電話番号・個人名は書かない。
// ---------------------------------------------------------------------------

/** 特定商取引法に基づく表記の「送料」と同じ書き方（試験で突き合わせる）。表示だけに使い、計算や判定には使わない。 */
export const shippingFeeNotation = "全国一律 ¥370（¥5,000以上で送料無料）";

export const pickupPlace = {
  name: "見晴亭",
  address: "〒409-0113 山梨県上野原市新田1053-3",
  access: "上野原駅北口から徒歩すぐ",
  days: "毎週水曜",
  hours: "8:00〜9:30／10:30〜16:00",
  latest: "営業日の最新情報は Instagram でご確認ください",
} as const;
/** 「営業日の最新情報は Instagram」の Instagram。コーヒースタンドのページ（content/pages/stand.json の
 * followUs.igHref）と同じ住所（試験で突き合わせる）。営業日のお知らせはこのアカウントで出している。 */
export const pickupInstagramHref = "https://www.instagram.com/misoca_coffeestand";
/** 受け取りの場所と営業の案内（購入画面の条件の欄・注文の状況の画面）。 */
export const pickupPlaceGuide = `${pickupPlace.name}（${pickupPlace.address}・${pickupPlace.access}）。コーヒースタンドの営業日（${pickupPlace.days} ${pickupPlace.hours}）にお渡しします。${pickupPlace.latest}。`;

/** 利用規約 第3条に足す文。購入画面の条件の欄も同じ文を使う（食い違いを作らない）。 */
export const receivingTerms = {
  availability: "上野原市内お届け・店頭受け取りは、購入画面で選べるときにご利用いただけます。",
  localDelivery: "上野原市内お届けは、お届け先が上野原市内の場合に限ります。注文確定後に焙煎し、7日以内に当店がポストへお届けします。",
  storePickup: "店頭受け取りは、注文確定後に焙煎し、7日以内にご用意してメールでお知らせします。お知らせのあと、コーヒースタンドの営業日に見晴亭でお受け取りください。",
  storePickupHold: "店頭受け取りの商品は、お知らせから2回目の営業日までにお受け取りください。難しい場合は、メールでご相談ください。",
  storePickupDefect: "店頭受け取りの商品に不備があった場合は、お受け取り後7日以内にご連絡ください。",
} as const;

/** 特定商取引法に基づく表記に足す文（既存の文の後ろに続ける・行を足す）。 */
export const receivingLegalNotice = {
  methodsTerm: "受け取り方法",
  methods: "配送のほか、上野原市内お届け・店頭受け取りは、購入画面で選べるときにご利用いただけます",
  fee: "上野原市内お届け・店頭受け取りは無料",
  handover: "上野原市内お届けは7日以内にポストへお届けします。店頭受け取りは7日以内にご用意し、メールでお知らせしたあとの営業日にお渡しします",
  placeTerm: "店頭受け取りの場所",
  place: `${pickupPlace.name}（${pickupPlace.address}）。${pickupPlace.days} ${pickupPlace.hours}。${pickupPlace.latest}`,
} as const;

export const receivingCopy = {
  chooserHeading: "受け取り方法",
  saveFailed: "受け取り方法を保存できません。内容を保持できるまで決済は始めません。",
  /** name = 送料の行や案内で使う呼び名。label と description = 選ぶ欄の文。 */
  methods: {
    shipping: { name: "配送", label: "配送（全国）", description: `送料は${shippingFeeNotation}。郵便でポストに届きます。` },
    local_delivery: { name: "上野原市内お届け", label: "上野原市内へお届け", description: "送料無料。上野原市内にお住まいの方限定で、当店が直接ポストへお届けします。" },
    store_pickup: { name: "店頭受け取り", label: "店頭で受け取る", description: `送料無料。ご用意ができましたらメールでお知らせします。お知らせのあと、コーヒースタンドの営業日（${pickupPlace.days}）に、${pickupPlace.name}（${pickupPlace.access}）でお受け取りください。` },
  },
  /** 条件の欄の「発送」「お届け先」に代わる行。金額は書かない（金額は見積もりの表示だけ）。 */
  conditions: {
    local_delivery: [
      { term: "お届け", text: receivingTerms.localDelivery },
      { term: "お届け先", text: "次のStripeの画面で入力します（上野原市内のご住所のみ）。市外のご住所の場合は、当店からご連絡します。" },
    ],
    store_pickup: [
      { term: "受け取り", text: `${receivingTerms.storePickup}${receivingTerms.storePickupHold}` },
      { term: "受け取り場所", text: pickupPlaceGuide },
      { term: "お名前", text: "住所の入力はありません。次のStripeの画面でお名前を入力します。" },
    ],
  },
  /** 注文の状況の画面。ここに無い状態は、今までの文（physicalCopy）をそのまま使う。 */
  status: {
    heading: "商品の受け取り",
    shippingHeading: "商品の発送",
    preparing: {
      local_delivery: "焙煎とお届けの準備を進めています",
      store_pickup: "焙煎とご用意を進めています。ご用意ができましたらメールでお知らせします",
    },
    handedOver: {
      local_delivery: "ポストへお届けした記録があります",
      store_pickup: "ご用意ができました。営業日に見晴亭でお受け取りください",
    },
  },
} as const;

/** 「送料」「送料（店頭受け取り）」「送料（上野原市内お届け）」。金額は呼び出し側が応答の値を出す。 */
export const shippingFeeLabel = (method: DeliveryMethod) => method === "shipping" ? "送料" : `送料（${receivingCopy.methods[method].name}）`;

type ReceivingStatus = Pick<BuyerStatus, "payment" | "physical"> & Pick<Partial<BuyerStatus>, "receiving">;
const beforeHandover: ReadonlySet<BuyerStatus["physical"]> = new Set(["awaiting_preparation", "preparing", "packed"]);

/** 配送以外の注文だけ、発送の言葉が残る2つの状態（支払いの確認待ち／決済の受付が終わった）を
 * 受け取り用の言い方に差し替える。共有ファイル（purchaser-status.ts）の physicalCopy は変えない。 */
const receivingPhysicalOverride: Partial<Record<BuyerStatus["physical"], string>> = {
  waiting_payment: "支払確認後に準備へ進みます",
  not_started: "準備は始まっていません",
};

/** Heading and wording for the physical part of an order. Without
 * `receiving` (every shipping order) this is exactly the previous output. */
export function physicalStatusView(status: ReceivingStatus) {
  const receiving = status.receiving;
  if (receiving === undefined) return { heading: receivingCopy.status.shippingHeading, text: physicalCopy[status.physical], place: null };
  const text = beforeHandover.has(status.physical) ? receivingCopy.status.preparing[receiving]
    : status.physical === "handed_over" ? receivingCopy.status.handedOver[receiving]
    : receivingPhysicalOverride[status.physical] ?? physicalCopy[status.physical];
  const place = receiving === "store_pickup" && (beforeHandover.has(status.physical) || status.physical === "handed_over") ? pickupPlaceGuide : null;
  return { heading: receivingCopy.status.heading, text, place };
}

/** The status page repeats the published shipping window only while payment
 * is confirmed AND the first parcel has not left yet. Payment is checked on
 * its own because the two fields are independent in the schema: a refunded
 * order must never be shown a shipping promise. A re-shipment
 * (replacement_preparing) is not what the published sentence covers.
 * The sentence is about shipping, so an order received another way
 * (`receiving` present) never shows it. */
export const showsShippingWindow = (status: ReceivingStatus) =>
  status.receiving === undefined && status.payment === "confirmed" && beforeHandover.has(status.physical);
