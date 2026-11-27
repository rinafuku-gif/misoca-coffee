import { z } from "zod";
import type { DeliveryMethod } from "./receiving-method";

/** The purchase form (購入者・お届け先・送り主の表示・備考・メルマガ) and the ONE
 * mapping to the `form` part of the checkout request. Shape and rules follow
 * v38beans6/CHECKOUT-FORM-WIRE.md (v1, 2026-11-27) exactly; the server checks
 * the same rules and answers 400 INVALID_REQUEST when one is broken. */

export const PREFECTURES = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] as const;

/** 上野原市内お届けの郵便番号（日本郵便のデータで市区町村が上野原市の22件。管理側の設定と同じ）. */
export const UENOHARA_POSTAL_CODES: ReadonlySet<string> = new Set(["4010201", "4090100", "4090111", "4090112", "4090113", "4090114", "4090115", "4090121", "4090122", "4090123", "4090124", "4090125", "4090126", "4090131", "4090132", "4090133", "4090134", "4090135", "4090136", "4090137", "4090138", "4090141"]);

/** Wire limits (JavaScript `length`). */
export const LIMITS = { name: 40, email: 254, phone: 13, city: 40, line1: 60, line2: 60, remarks: 300 } as const;

export type Sender = "buyer" | "shop";
export interface CheckoutFormDraft {
  buyerName: string; buyerEmail: string; buyerPhone: string;
  sameAsBuyer: boolean; recipientName: string; recipientPhone: string;
  postalCode: string; prefecture: string; city: string; line1: string; line2: string;
  sender: Sender; remarks: string; newsletter: boolean;
}
export const emptyCheckoutForm: CheckoutFormDraft = {
  buyerName: "", buyerEmail: "", buyerPhone: "", sameAsBuyer: true, recipientName: "", recipientPhone: "",
  postalCode: "", prefecture: "", city: "", line1: "", line2: "", sender: "buyer", remarks: "", newsletter: false,
};
export type FormField = Exclude<keyof CheckoutFormDraft, "sameAsBuyer" | "sender" | "newsletter">;
export type FormErrors = Partial<Record<FormField, string>>;

const CONTROL = /[\u0000-\u001f\u007f\u2028\u2029]/g;
const CONTROL_EXCEPT_NEWLINE = /[\u0000-\u0009\u000b-\u001f\u007f\u2028\u2029]/g;
/** One-line text as sent: no control characters, no surrounding spaces. */
export const cleanLine = (value: string) => value.replace(CONTROL, "").trim();
/** 備考: line breaks kept (as \n), other control characters removed, no surrounding spaces. */
export const cleanRemarks = (value: string) => value.replace(/\r\n?/g, "\n").replace(CONTROL_EXCEPT_NEWLINE, "").trim();
/** 全角数字・ハイフンを直して7桁だけにする（例: 「４０９－０１１３」→ 4090113）. */
export function normalizePostalCode(value: string) {
  return value.trim().normalize("NFKC").replace(/[-−‐‑‒–—―ー\s]/g, "");
}
/** 電話番号: 半角数字とハイフンだけにする（全角→半角、いろいろなハイフン→「-」、空白・括弧は外す、+81 → 0）. */
export function normalizePhone(value: string) {
  const ascii = value.trim().normalize("NFKC").replace(/[−‐‑‒–—―ー]/g, "-").replace(/[\s()]/g, "");
  return ascii.startsWith("+81") ? `0${ascii.slice(3).replace(/^-/, "")}` : ascii;
}
const validPhone = (value: string) => value.length <= LIMITS.phone && /^[0-9]+(?:-[0-9]+)*$/.test(value) && /^0\d{9,10}$/.test(value.replaceAll("-", ""));
export const normalizeEmail = (value: string) => value.normalize("NFKC").replace(CONTROL, "").trim();
const emailShape = z.email();
const validEmail = (value: string) => value.length <= LIMITS.email && /^[\x21-\x7e]+$/.test(value) && !/[<>(),;:[\]"\\]/.test(value) && emailShape.safeParse(value).success;

export const needsAddress = (method: DeliveryMethod) => method !== "store_pickup";
/** Local delivery is possible only for a complete Uenohara postcode. An
 * incomplete code is not judged yet (no message while typing). */
export function localDeliveryAllowed(postalCode: string): boolean | null {
  const code = normalizePostalCode(postalCode);
  return /^\d{7}$/.test(code) ? UENOHARA_POSTAL_CODES.has(code) : null;
}

const message = {
  required: "入力してください",
  email: "メールアドレスの形を確かめてください",
  phone: "電話番号を数字で入れてください（10〜11桁）",
  postal: "郵便番号は7桁の数字です",
  prefecture: "都道府県を選んでください",
  tooLong: (max: number) => `${max}文字以内で入力してください`,
  local: "上野原市内のご住所のみお届けできます",
} as const;
export const formMessages = message;

/** Client-side check with the wire rules (the server checks again). One message per field. */
export function validateCheckoutForm(form: CheckoutFormDraft, method: DeliveryMethod): FormErrors {
  const errors: FormErrors = {};
  const text = (field: FormField, max: number, required = true) => {
    const value = field === "remarks" ? cleanRemarks(form[field]) : cleanLine(form[field]);
    if (required && !value) errors[field] = message.required;
    else if (value.length > max) errors[field] = message.tooLong(max);
  };
  const phone = (field: "buyerPhone" | "recipientPhone") => {
    const value = normalizePhone(form[field]);
    if (!value) errors[field] = message.required;
    else if (!validPhone(value)) errors[field] = message.phone;
  };
  text("buyerName", LIMITS.name);
  const email = normalizeEmail(form.buyerEmail);
  if (!email) errors.buyerEmail = message.required;
  else if (!validEmail(email)) errors.buyerEmail = message.email;
  phone("buyerPhone");
  if (needsAddress(method)) {
    if (!form.sameAsBuyer) { text("recipientName", LIMITS.name); phone("recipientPhone"); }
    const code = normalizePostalCode(form.postalCode);
    if (!code) errors.postalCode = message.required;
    else if (!/^\d{7}$/.test(code)) errors.postalCode = message.postal;
    else if (method === "local_delivery" && !UENOHARA_POSTAL_CODES.has(code)) errors.postalCode = message.local;
    if (!(PREFECTURES as readonly string[]).includes(form.prefecture)) errors.prefecture = message.prefecture;
    text("city", LIMITS.city); text("line1", LIMITS.line1); text("line2", LIMITS.line2, false);
  }
  text("remarks", LIMITS.remarks, false);
  return errors;
}

/** The `form` part of the checkout body, exactly as in CHECKOUT-FORM-WIRE.md §1–2.
 * Unknown keys are refused by the server, so the schema is strict too. */
const line = (max: number, min = 1) => z.string().min(min).max(max).refine(value => value === cleanLine(value));
const phoneSchema = z.string().refine(validPhone);
const deliverySchema = z.union([
  z.object({ sameAsBuyer: z.literal(true), postalCode: z.string().regex(/^\d{7}$/), prefecture: z.enum(PREFECTURES), city: line(LIMITS.city), line1: line(LIMITS.line1), line2: line(LIMITS.line2, 0) }).strict(),
  z.object({ sameAsBuyer: z.literal(false), name: line(LIMITS.name), phone: phoneSchema, postalCode: z.string().regex(/^\d{7}$/), prefecture: z.enum(PREFECTURES), city: line(LIMITS.city), line1: line(LIMITS.line1), line2: line(LIMITS.line2, 0) }).strict(),
]);
export const checkoutFormWireSchema = z.object({
  buyer: z.object({ name: line(LIMITS.name), email: z.string().refine(validEmail), phone: phoneSchema }).strict(),
  delivery: deliverySchema.nullable(),
  sender: z.enum(["buyer", "shop"]).optional(),
  remarks: z.string().max(LIMITS.remarks).refine(value => value === cleanRemarks(value)),
  newsletter: z.boolean(),
}).strict().refine(form => (form.delivery !== null && !form.delivery.sameAsBuyer) === (form.sender !== undefined));
export type CheckoutFormWire = z.infer<typeof checkoutFormWireSchema>;
/** Draft → wire. Throws if the draft does not pass the rules (call validateCheckoutForm first). */
export function checkoutFormWire(form: CheckoutFormDraft, method: DeliveryMethod): CheckoutFormWire {
  const address = { postalCode: normalizePostalCode(form.postalCode), prefecture: form.prefecture, city: cleanLine(form.city), line1: cleanLine(form.line1), line2: cleanLine(form.line2) };
  const delivery = !needsAddress(method) ? null
    : form.sameAsBuyer ? { sameAsBuyer: true as const, ...address }
      : { sameAsBuyer: false as const, name: cleanLine(form.recipientName), phone: normalizePhone(form.recipientPhone), ...address };
  return checkoutFormWireSchema.parse({
    buyer: { name: cleanLine(form.buyerName), email: normalizeEmail(form.buyerEmail), phone: normalizePhone(form.buyerPhone) },
    delivery,
    ...(delivery && !delivery.sameAsBuyer ? { sender: form.sender } : {}),
    remarks: cleanRemarks(form.remarks),
    newsletter: form.newsletter,
  });
}

/** The draft is kept in this tab only (sessionStorage), so a reload or the way
 * back from Stripe does not lose what was typed. Never sent anywhere by itself. */
export const CHECKOUT_FORM_STORAGE_KEY = "misoca-checkout-form-v1";
const draftText = z.string().max(1000);
const draftSchema = z.object({
  buyerName: draftText, buyerEmail: draftText, buyerPhone: draftText, sameAsBuyer: z.boolean(), recipientName: draftText, recipientPhone: draftText,
  postalCode: draftText, prefecture: draftText, city: draftText, line1: draftText, line2: draftText, sender: z.enum(["buyer", "shop"]), remarks: draftText, newsletter: z.boolean(),
}).strict() satisfies z.ZodType<CheckoutFormDraft>;
export function readCheckoutFormDraft(storage: Pick<Storage, "getItem">): CheckoutFormDraft {
  try { const parsed = draftSchema.safeParse(JSON.parse(storage.getItem(CHECKOUT_FORM_STORAGE_KEY) ?? "null")); return parsed.success ? parsed.data : emptyCheckoutForm; }
  catch { return emptyCheckoutForm; }
}
export function writeCheckoutFormDraft(storage: Pick<Storage, "setItem">, form: CheckoutFormDraft) {
  try { storage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(form)); } catch { /* Typing still works without storage. */ }
}
