"use client";

import { useRef, useState, type ReactNode } from "react";
import { LIMITS, PREFECTURES, formMessages, localDeliveryAllowed, needsAddress, normalizePostalCode, type CheckoutFormDraft, type FormErrors, type FormField } from "../checkout-form";
import { lookupPostalAddress } from "../postal-address";
import type { DeliveryMethod } from "../receiving-method";
import { purchaseUi } from "./purchase-ui";

export const formCopy = {
  buyer: "ご購入者", recipient: "お届け先", sender: "送り主の表示",
  name: "お名前", email: "メールアドレス", phone: "電話番号", same: "ご購入者と同じ",
  postalCode: "郵便番号", prefecture: "都道府県", city: "市区町村", line1: "番地", line2: "建物名・部屋番号（任意）",
  choose: "選んでください", senderBuyer: "ご購入者のお名前", senderShop: "三十日珈琲",
  remarks: "備考（任意）", remarksHint: "お届け希望日時などがあればご記入ください（ご希望に添えない場合があります）",
  newsletter: "三十日珈琲からのお知らせをメールで受け取る",
  newsletterNote: "チェックを入れたままご購入いただくと、三十日珈琲からのお知らせメールの配信に同意したことになります。不要な方はチェックを外してください。配信はメール内のリンクからいつでも止められます。",
  checkLine1: "番地を確かめてください", notFound: "この郵便番号の住所が見つかりませんでした",
} as const;

const input = "mt-1 block min-h-12 w-full rounded-sm border border-usuzumi bg-kominka-white px-3 text-base text-sumi aria-[invalid=true]:border-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karekusa";
export const fieldId = (field: FormField) => `checkout-${field}`;

function Field({ field, label, error, hint, children }: { field: FormField; label: string; error?: string; hint?: string; children: ReactNode }) {
  return <div>
    <label htmlFor={fieldId(field)} className="block text-sm text-konsumi">{label}</label>
    {children}
    {error ? <p id={`${fieldId(field)}-error`} className="mt-1 border-l-2 border-error pl-2 text-xs leading-relaxed text-sumi">{error}</p>
      : hint ? <p id={`${fieldId(field)}-hint`} role="status" className="mt-1 text-xs leading-relaxed text-karekusa">{hint}</p> : null}
  </div>;
}
export const newsletterNoteId = "checkout-newsletter-note";
/** 言葉の途中で折り返さないまとまり（390px で「…お知らせを／メールで受け取る」と切れる）。 */
export const newsletterKeepTogether = "メールで受け取る";
/** メルマガのチェック（既定でオン・16px・中くらいの太さ＝見出しの役）と、6px あけたすぐ下の説明（同意の意味を示す。16px・本文と同じ墨色・行間は詰めてひとまとまりに）。押せる範囲は label 全体のまま（説明は label に重ねない）。
 * 説明は <p> にしない: globals.css の `p { line-height: 2 }` が行間の指定より強く、詰められないため。 */
export function NewsletterField({ checked, disabled, onToggle }: { checked: boolean; disabled: boolean; onToggle(checked: boolean): void }) {
  return <div>
    <label className="flex min-h-12 cursor-pointer items-center gap-3 text-base font-medium">
      <input type="checkbox" checked={checked} disabled={disabled} aria-describedby={newsletterNoteId} onChange={event => onToggle(event.target.checked)} className={purchaseUi.checkbox} />
      <span>{formCopy.newsletter.slice(0, -newsletterKeepTogether.length)}<span className="whitespace-nowrap">{newsletterKeepTogether}</span></span>
    </label>
    <div id={newsletterNoteId} className="mt-1.5 pl-8 text-base leading-relaxed text-sumi">{formCopy.newsletterNote}</div>
  </div>;
}
const described = (field: FormField, error?: string, hint?: string) =>
  ({ "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${fieldId(field)}-error` : hint ? `${fieldId(field)}-hint` : undefined });

/** 購入者・お届け先・送り主の表示・備考・メルマガ (in the checkout section). */
export function CheckoutFormFields({ form, method, errors, disabled, onChange, onBlur }: {
  form: CheckoutFormDraft; method: DeliveryMethod; errors: FormErrors; disabled: boolean;
  onChange(update: (current: CheckoutFormDraft) => CheckoutFormDraft): void; onBlur(field: FormField): void;
}) {
  const [postalHint, setPostalHint] = useState<"" | "filled" | "notFound">("");
  const looked = useRef("");
  const set = (field: keyof CheckoutFormDraft) => (value: string | boolean) => onChange(current => ({ ...current, [field]: value }));
  function text(field: FormField, label: string, options: { type?: string; autoComplete: string; max: number; inputMode?: "numeric" | "tel" | "email"; hint?: string }) {
    const error = errors[field];
    return <Field field={field} label={label} error={error} hint={options.hint}>
      <input id={fieldId(field)} name={field} type={options.type ?? "text"} value={form[field]} maxLength={options.max} autoComplete={options.autoComplete} inputMode={options.inputMode}
        {...described(field, error, options.hint)} className={input} onChange={event => { set(field)(event.target.value); if (field === "line1") setPostalHint(hint => hint === "filled" ? "" : hint); }} onBlur={() => onBlur(field)} />
    </Field>;
  }
  async function changePostal(value: string) {
    set("postalCode")(value);
    const code = normalizePostalCode(value);
    if (!/^\d{7}$/.test(code) || code === looked.current) return;
    looked.current = code; setPostalHint("");
    try {
      const address = await lookupPostalAddress(code, AbortSignal.timeout(6000));
      if (!address) { setPostalHint("notFound"); return; }
      onChange(current => normalizePostalCode(current.postalCode) !== code ? current
        : { ...current, prefecture: address.prefecture, city: address.city, line1: current.line1.trim() ? current.line1 : address.town });
      setPostalHint("filled");
    } catch { setPostalHint("notFound"); }
  }
  const local = method === "local_delivery" ? localDeliveryAllowed(form.postalCode) : null;
  const postalError = errors.postalCode ?? (local === false ? formMessages.local : undefined);
  return <div className="space-y-8">
    <fieldset disabled={disabled} className="min-w-0 space-y-4">
      <legend className="mb-1 text-sm font-medium tracking-wide text-konsumi">{formCopy.buyer}</legend>
      {text("buyerName", formCopy.name, { autoComplete: "name", max: LIMITS.name })}
      {text("buyerEmail", formCopy.email, { type: "email", autoComplete: "email", max: LIMITS.email, inputMode: "email" })}
      {text("buyerPhone", formCopy.phone, { type: "tel", autoComplete: "tel", max: LIMITS.phone, inputMode: "tel" })}
    </fieldset>
    {needsAddress(method) ? <fieldset disabled={disabled} className="min-w-0 space-y-4">
      <legend className="mb-1 text-sm font-medium tracking-wide text-konsumi">{formCopy.recipient}</legend>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" checked={form.sameAsBuyer} onChange={event => set("sameAsBuyer")(event.target.checked)} className={purchaseUi.checkbox} />{formCopy.same}
      </label>
      {!form.sameAsBuyer ? <>
        {text("recipientName", formCopy.name, { autoComplete: "shipping name", max: LIMITS.name })}
        {text("recipientPhone", formCopy.phone, { type: "tel", autoComplete: "shipping tel", max: LIMITS.phone, inputMode: "tel" })}
      </> : null}
      <Field field="postalCode" label={formCopy.postalCode} error={postalError} hint={postalHint === "notFound" ? formCopy.notFound : undefined}>
        <input id={fieldId("postalCode")} name="postalCode" value={form.postalCode} maxLength={10} autoComplete="shipping postal-code" inputMode="numeric"
          {...described("postalCode", postalError, postalHint === "notFound" ? formCopy.notFound : undefined)} className={`${input} max-w-48`}
          onChange={event => { void changePostal(event.target.value); }} onBlur={() => onBlur("postalCode")} />
      </Field>
      <Field field="prefecture" label={formCopy.prefecture} error={errors.prefecture}>
        <select id={fieldId("prefecture")} name="prefecture" value={form.prefecture} autoComplete="shipping address-level1" {...described("prefecture", errors.prefecture)}
          className={`${input} max-w-48`} onChange={event => set("prefecture")(event.target.value)} onBlur={() => onBlur("prefecture")}>
          <option value="">{formCopy.choose}</option>{PREFECTURES.map(name => <option key={name}>{name}</option>)}
        </select>
      </Field>
      {text("city", formCopy.city, { autoComplete: "shipping address-level2", max: LIMITS.city })}
      {text("line1", formCopy.line1, { autoComplete: "shipping address-line1", max: LIMITS.line1, hint: postalHint === "filled" ? formCopy.checkLine1 : undefined })}
      {text("line2", formCopy.line2, { autoComplete: "shipping address-line2", max: LIMITS.line2 })}
    </fieldset> : null}
    {needsAddress(method) && !form.sameAsBuyer ? <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-1 text-sm font-medium tracking-wide text-konsumi">{formCopy.sender}</legend>
      {([["buyer", formCopy.senderBuyer], ["shop", formCopy.senderShop]] as const).map(([value, label]) => <label key={value} htmlFor={`checkout-sender-${value}`} className="flex min-h-12 cursor-pointer items-center gap-3 text-sm">
        <input id={`checkout-sender-${value}`} type="radio" name="checkout-sender" value={value} checked={form.sender === value} onChange={() => set("sender")(value)} className={purchaseUi.checkbox} />{label}
      </label>)}
    </fieldset> : null}
    <Field field="remarks" label={formCopy.remarks} error={errors.remarks}>
      <p id={`${fieldId("remarks")}-note`} className="mt-1 text-xs leading-relaxed text-haicha">{formCopy.remarksHint}</p>
      <textarea id={fieldId("remarks")} name="remarks" value={form.remarks} maxLength={LIMITS.remarks} rows={3} aria-describedby={`${fieldId("remarks")}-note`} aria-invalid={errors.remarks ? true : undefined}
        className={`${input} py-2`} onChange={event => set("remarks")(event.target.value)} onBlur={() => onBlur("remarks")} />
    </Field>
    <NewsletterField checked={form.newsletter} disabled={disabled} onToggle={set("newsletter")} />
  </div>;
}
