import { purchaseUi } from "./purchase-ui";

/** Shipping and return sentences are copied from the published terms page
 * (第3条); the payment method is copied from the published legal notice.
 * purchase-terms.test.tsx fails when those pages and this file drift apart,
 * so the purchase screen never promises something the public pages do not say. */
export const purchaseConditions = {
  shipping: "商品は注文確定後に焙煎し、7日以内に発送いたします。",
  // Purchase screen only: the reason shown right after the shipping sentence.
  shippingReason: "焙煎したてをお届けするため、少しお時間をいただいています。",
  customerReturn: "商品の性質上、お客様都合による返品・交換はお受けできません。",
  defect: "商品に不備があった場合は、到着後7日以内にご連絡ください。",
  paymentMethod: "クレジットカード（Stripe）",
  contact: "misocacoffee@gmail.com",
} as const;

const legalPages = [
  { href: "/tokushoho", label: "特定商取引法に基づく表記" },
  { href: "/terms", label: "利用規約" },
  { href: "/privacy", label: "プライバシーポリシー" },
] as const;

/** Opens in another tab: leaving the purchase tab would drop the confirmed total. */
function LegalLinkList() {
  return <>
    <ul className="flex flex-wrap gap-x-6">
      {legalPages.map(page => <li key={page.href}><a href={page.href} target="_blank" rel="noopener noreferrer" className={purchaseUi.link}>{page.label}<span className="sr-only">（別のタブで開きます）</span></a></li>)}
    </ul>
    <p className="text-xs leading-relaxed text-haicha">別のタブで開きます。選んだ内容はこのタブに残ります。</p>
  </>;
}

/** Shown beside the total, before the buyer confirms and moves to payment. */
export function PurchaseConditions() {
  return <section aria-labelledby="purchase-conditions-title" className={purchaseUi.inset}>
    <h3 id="purchase-conditions-title" className="text-sm font-medium tracking-wide text-konsumi">お届けと返品について</h3>
    <dl className="mt-3 space-y-3 text-sm leading-relaxed">
      <div><dt className="text-haicha">お支払い</dt><dd>{purchaseConditions.paymentMethod}。次の画面でのお手続きが完了したときに決済されます。</dd></div>
      <div><dt className="text-haicha">発送</dt><dd>{purchaseConditions.shipping}{purchaseConditions.shippingReason}</dd></div>
      <div><dt className="text-haicha">お届け先</dt><dd>発送する商品があるときは、次のStripeの画面で入力します（日本国内のみ）。</dd></div>
      <div><dt className="text-haicha">返品・交換</dt><dd>{purchaseConditions.customerReturn}{purchaseConditions.defect}</dd></div>
      <div><dt className="text-haicha">お問い合わせ</dt><dd><a href={`mailto:${purchaseConditions.contact}`} className="inline-flex min-h-12 items-center break-all underline underline-offset-4">{purchaseConditions.contact}</a></dd></div>
    </dl>
    <LegalLinkList />
  </section>;
}

/** Always reachable, also before a total exists and on the order status screen. */
export function PurchaseLegalLinks() {
  return <nav aria-label="お取引に関する案内" className="mt-10 border-t border-usuzumi pt-6">
    <LegalLinkList />
  </nav>;
}
