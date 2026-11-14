import { purchaseUi } from "./PurchaseBrand";

export function UnlistedCartItems({ lines, busy, onRemove }: {
  lines: { skuId: string; quantity: number; label: string }[];
  busy: boolean;
  onRemove: (skuId: string) => void;
}) {
  if (!lines.length) return null;
  return <div className="mt-8 border-t border-usuzumi py-6">
    <h3 className="font-serif text-lg font-normal tracking-wide text-konsumi">一覧に表示されていない選択</h3>
    <p className="mt-3 text-sm leading-loose text-haicha">まだ読み込んでいないか、販売状況が変わった商品です。選択には残っています。必要がなければ外せます。</p>
    <ul className="mt-4 divide-y divide-usuzumi/60">{lines.map(line => <li key={line.skuId} className="py-4">
      <p className="break-words">{line.label} × {line.quantity}点</p>
      <button className={purchaseUi.link} disabled={busy} aria-label={`${line.label}を選択から外す`} onClick={() => onRemove(line.skuId)}>選択から外す</button>
    </li>)}</ul>
  </div>;
}
