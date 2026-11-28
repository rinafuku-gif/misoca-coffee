import type { productMerchandising } from "../product-merchandising";

type ProductBadge = ReturnType<typeof productMerchandising>["badge"];

export function ProductCardBadges({ badge, roast, recommendedRoast = false }: {
  badge?: ProductBadge; roast?: string; recommendedRoast?: boolean;
}) {
  const roastLabel = roast?.trim();
  if (!badge && !roastLabel) return null;
  return (
    <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex items-start gap-2 sm:inset-x-4 sm:top-4">
      {roastLabel ? (
        <span className="min-w-0 break-words bg-konsumi/80 px-2 py-1.5 text-xs tracking-wider text-white sm:px-3">
          {recommendedRoast ? <span className="block text-xs">おすすめ焙煎度</span> : null}
          {roastLabel}
        </span>
      ) : null}
      {badge ? (
        <span className={`ml-auto shrink-0 whitespace-nowrap border px-2.5 py-1 text-base leading-5 font-semibold tracking-wide ${
          badge === "NEW" ? "border-gold bg-kominka-white text-sumi" : "border-konsumi bg-konsumi text-white"
        }`}>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export function ProductCardDetails({ note, expanded = false }: { note?: string; expanded?: boolean }) {
  return note ? (
    <p className={`mb-3 text-sm leading-relaxed text-haicha ${expanded ? "break-words" : "line-clamp-2"}`}>{note}</p>
  ) : null;
}
