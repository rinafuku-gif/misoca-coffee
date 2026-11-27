import { checkoutCopy, checkoutTermsRows, methodShortCopy } from "../checkout-copy";
import { receivingCopy, type DeliveryMethod } from "../receiving-method";
import { purchaseUi } from "./purchase-ui";

/** Receiving method, short. Native radios sharing one name (Tab enters the
 * group, arrows move); choosing one asks for the new total right away. */
export function MethodPicker({ methods, value, disabled = false, unavailable = [], onChange }: {
  methods: readonly DeliveryMethod[]; value: DeliveryMethod; disabled?: boolean; unavailable?: readonly DeliveryMethod[]; onChange(method: DeliveryMethod): void;
}) {
  if (!methods.length) return null;
  return <fieldset disabled={disabled} className="min-w-0">
    <legend className="text-sm font-medium tracking-wide text-konsumi">{receivingCopy.chooserHeading}</legend>
    <ul className="mt-2 divide-y divide-usuzumi/60 border-y border-usuzumi">
      {methods.map(method => <li key={method}>
        <label htmlFor={`checkout-method-${method}`} className="flex min-h-12 cursor-pointer items-start gap-3 py-3">
          <input id={`checkout-method-${method}`} type="radio" name="checkout-method" value={method} checked={value === method} disabled={unavailable.includes(method) && value !== method} onChange={() => onChange(method)} className={purchaseUi.checkbox} />
          <span className="min-w-0 text-sm"><span className="block text-sumi">{receivingCopy.methods[method].label}</span><span className="block text-xs leading-relaxed text-haicha">{methodShortCopy[method]}</span></span>
        </label>
      </li>)}
    </ul>
  </fieldset>;
}

const legalLinks = [
  { href: "/tokushoho", label: "特定商取引法に基づく表記" },
  { href: "/terms", label: "返品について" },
] as const;

/** The final-confirmation items next to the pay button, compact. */
export function CheckoutTerms({ method }: { method: DeliveryMethod }) {
  return <section aria-label="お支払い・お届け・返品" className="text-xs leading-relaxed text-haicha">
    <dl className="space-y-1.5">
      {checkoutTermsRows(method).map(row => <div key={row.term} className="grid grid-cols-[4.5em_1fr] gap-2"><dt className="text-karekusa">{row.term}</dt><dd className="min-w-0 break-words">{row.text}</dd></div>)}
    </dl>
    <ul className="mt-1 flex flex-wrap gap-x-5">
      {legalLinks.map(link => <li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs text-karekusa underline decoration-usuzumi underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa">{link.label}<span className="sr-only">（別のタブで開きます）</span></a></li>)}
    </ul>
  </section>;
}

/** Shown when this tab holds a checkout that was not paid (back from Stripe,
 * or its answer was unknown). Never a waiting wall: one press either way. */
export function PaymentPendingBanner({ canResume, resumeDisabled, busy, line, onResume, onRestart }: {
  canResume: boolean; resumeDisabled: boolean; busy: boolean; line: string; onResume(): void; onRestart(): void;
}) {
  return <section id="payment-pending" tabIndex={-1} aria-labelledby="payment-pending-title" className="scroll-mt-24 border-l-2 border-gold bg-tsuchikabe px-5 py-5 focus:outline-none sm:px-6">
    <p id="payment-pending-title" className="text-sm font-medium text-konsumi">{checkoutCopy.pendingLine}</p>
    {line ? <p role="alert" className="mt-2 text-sm text-sumi">{line}</p> : null}
    <div className="mt-4 flex flex-wrap gap-3">
      {canResume ? <button type="button" className={purchaseUi.primary} disabled={busy || resumeDisabled} onClick={onResume}>{checkoutCopy.resume}</button> : null}
      <button type="button" className={purchaseUi.secondary} disabled={busy} onClick={onRestart}>{checkoutCopy.restart}</button>
    </div>
  </section>;
}
