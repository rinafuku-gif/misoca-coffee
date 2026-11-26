
import { purchaseUi } from "./purchase-ui";
import type { BuyerProductPublication } from "../product-publication-view";
export function ProductPublicationDetails({ publication, purchased = false }: { publication?: BuyerProductPublication; purchased?: boolean }) {
  if (!publication) return null;
  const c = publication.content;
  const facts = [["産地", c.origin], ["農園", c.farm], ["品種", c.variety], ["精製", c.process]].filter(([, value]) => value.trim());
  if (!purchased) return <div className="mt-5 max-w-xl text-sm leading-loose text-sumi">
    {c.description.trim() ? <p className="whitespace-pre-wrap break-words">{c.description}</p> : null}
    {facts.length ? <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-l border-usuzumi pl-4 text-sm">
      {facts.map(([label, value]) => <div key={label} className="contents"><dt className="text-haicha">{label}</dt><dd className="min-w-0 break-words">{value}</dd></div>)}
    </dl> : null}
  </div>;
  return <details className={`mt-3 text-sm leading-relaxed ${purchaseUi.inset}`}><summary className="min-h-12 cursor-pointer content-center font-medium">{purchased ? "注文時点の商品説明" : "商品説明を確認"}</summary><dl className="mt-2 space-y-1">{[["産地", c.origin], ["農園", c.farm], ["品種", c.variety], ["精製", c.process]].filter(([, value]) => value.trim()).map(([label, value]) => <div key={label} className="break-words"><dt className="inline font-medium">{label}：</dt><dd className="inline">{value}</dd></div>)}</dl><p className="mt-3 whitespace-pre-wrap break-words">{c.description}</p>{purchased ? <p className="mt-3">注文を受け付けた時点の説明です。後から商品紹介が変わっても、この注文の内容は変えません。</p> : null}</details>;
}
