"use client";

/** Presentation pieces of the shop page, taken out of ShopCatalog so the
 * paused guide (ShopCatalog) and the purchase screen (PurchasePanel) share one
 * look. No data loading, prices or cart state live here. */
import Image from "next/image";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export function ArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
export function CartIcon({ className = "w-6 h-6", strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>;
}
export function CloseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
}
export function CheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>;
}
function PhotoPlaceholderIcon({ className }: { className: string }) {
  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}

const placeholder = {
  card: { icon: "w-10 h-10 text-haicha/30", label: "text-[10px] tracking-[0.2em] text-haicha/40" },
  modal: { icon: "w-12 h-12 text-haicha/30", label: "text-[11px] tracking-[0.2em] text-haicha/40" },
  thumb: { icon: "w-6 h-6 text-haicha/30", label: null },
} as const;

/** The product photo with its "NO IMAGE" fallback. Must sit in a `relative`
 * box with a fixed aspect ratio. The Notion image route is revocable media and
 * bypasses the optimizer cache (unoptimized); a load failure shows the fallback. */
export function ProductPhoto({ image, alt, failed, onError, sizes, variant = "card", className = "object-cover" }: {
  image: string; alt: string; failed: boolean; onError(): void; sizes: string; variant?: keyof typeof placeholder; className?: string;
}) {
  if (image && !failed) return <Image src={image} unoptimized={image.startsWith("/api/notion-image/")} alt={alt} fill className={className} sizes={sizes} onError={onError} />;
  const style = placeholder[variant];
  return <div className={`absolute inset-0 bg-tsuchikabe/40 flex ${style.label ? "flex-col gap-3" : ""} items-center justify-center`}>
    <PhotoPlaceholderIcon className={style.icon} />
    {style.label ? <span className={style.label}>NO IMAGE</span> : null}
  </div>;
}

/** New Arrival — ゆずインフューズドコーヒー (the approved banner of the shop page).
 * A plain anchor on purpose: these parts are also rendered by the unmeasured
 * purchase page, which is only ever left by a full page load (SiteMeasurement). */
export function NewArrivalBanner({ paused = false }: { paused?: boolean }) {
  return <section className="bg-tsuchikabe py-12 md:py-16 border-b border-usuzumi/30">
    <div className="max-w-4xl mx-auto px-6 md:px-8">
      <ScrollReveal>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-[family-name:var(--font-display)] text-[11px] tracking-[0.5em] text-gold font-light mb-3 uppercase">New Arrival</p>
            <h2 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-3">新商品: 上野原ゆずインフューズドコーヒー</h2>
            <p className="text-sm text-haicha leading-[2] tracking-wide">
              山梨県上野原市の規格外ゆずを生豆に漬け込んでから焙煎した一杯。
              {paused && <span className="block mt-1">焙煎豆の通販は休止中ですが、新商品の詳細ページは公開しています。</span>}
            </p>
          </div>
          <a href="/shop/uenohara-yuzu" className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500 flex-shrink-0 min-h-[44px]">
            商品ページを見る
            <ArrowIcon />
          </a>
        </div>
      </ScrollReveal>
    </div>
  </section>;
}

/** Freshness promise strip shown above the bean lineup while selling. */
export function FreshnessStrip() {
  return <section className="bg-konsumi py-6 overflow-hidden">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <p className="text-white/80 text-sm md:text-base tracking-wider font-light">
        すべてスペシャルティグレード ／ ご注文後7日以内に発送 ／ 全国一律
        ¥370（¥5,000以上で送料無料）
      </p>
    </div>
  </section>;
}

/** The detail grid of the product modal. Empty values are left out. */
export function ProductFactGrid({ facts }: { facts: readonly (readonly [label: string, value: string])[] }) {
  const shown = facts.filter(([, value]) => value.trim());
  if (!shown.length) return null;
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
    {shown.map(([label, value]) => <div key={label} className="min-w-0">
      <dt className="text-xs tracking-[0.2em] text-karekusa mb-1">{label}</dt>
      <dd className="text-sm text-haicha tracking-wide break-words">{value}</dd>
    </div>)}
  </dl>;
}
