import type { BeanDisplay } from "../bean-display";
import { productMerchandising } from "../product-merchandising";

export function ProductCardDetails({ item, showRoast = false }: {
  item: { skuId: string; name: string; display: BeanDisplay | null };
  showRoast?: boolean;
}) {
  const { badge, note } = productMerchandising(item);
  const roast = showRoast ? item.display?.roast.trim() : undefined;
  return (
    <>
      {badge || roast ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {badge ? (
            <span className={`border px-2 py-0.5 text-xs tracking-wide ${
              badge === "NEW" ? "border-gold/40 bg-tsuchikabe text-karekusa" : "border-konsumi/30 bg-konsumi text-white"
            }`}>
              {badge}
            </span>
          ) : null}
          {roast ? (
            <span className="border border-karekusa/25 px-2 py-0.5 text-xs text-karekusa">{roast}</span>
          ) : null}
        </div>
      ) : null}
      {note ? <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-haicha">{note}</p> : null}
    </>
  );
}
