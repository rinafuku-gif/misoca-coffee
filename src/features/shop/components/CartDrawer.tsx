"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { checkoutCopy } from "../checkout-copy";
import type { DrawerLine } from "../bean-cart";
import { purchaseUi } from "./purchase-ui";
import { yen } from "./BeanCard";
import { CartIcon, CloseIcon, ProductPhoto } from "./shop-catalog-parts";
import { useDialog } from "./use-dialog";

/** Floating cart button (ShopCatalog's), shown once something is selected. */
export function CartButton({ count, onOpen }: { count: number; onOpen(): void }) {
  return <>
    <p className="sr-only" role="status" aria-live="polite">{count > 0 ? `カート（${count}点）` : ""}</p>
    <AnimatePresence>
      {count > 0 ? <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={onOpen}
        aria-label={`カートを開く（${count}点）`}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-sm bg-karekusa text-white shadow-lg transition-colors hover:bg-konsumi focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa"
      >
        <CartIcon />
        <motion.span key={count} initial={{ scale: 0.5 }} animate={{ scale: 1 }} aria-hidden="true" className="absolute -top-1.5 -right-1.5 flex h-[22px] min-w-[22px] items-center justify-center rounded-sm bg-gold px-1 text-xs font-medium text-sumi">
          {count}
        </motion.span>
      </motion.button> : null}
    </AnimatePresence>
  </>;
}

const stepper = "flex h-11 w-11 items-center justify-center rounded-sm border border-usuzumi text-base text-sumi transition-colors hover:bg-tsuchikabe disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-karekusa";

/** Cart drawer (ShopCatalog's look, Hayari's flow): step "cart" lists the
 * selection with 小計 and one button 「購入手続きへ」; step "checkout" shows the
 * purchase section (`checkout` / `checkoutFooter`, rendered by PurchasePanel)
 * in the same panel. Changing step starts the panel at its top. */
export function CartDrawer({ open, step = "cart", lines, count, subtotal, busy, locked, stale, images, failedImages, onImageError, onChange, onClose, onCheckout, onBack, checkout, checkoutFooter }: {
  open: boolean; step?: "cart" | "checkout"; lines: readonly DrawerLine[]; count: number; subtotal: number; busy: boolean; locked: boolean; stale: boolean;
  images: ReadonlyMap<string, string>; failedImages: ReadonlySet<string>; onImageError(skuId: string): void;
  onChange(skuId: string, quantity: number): void; onClose(): void; onCheckout(): void; onBack?(): void;
  checkout?: ReactNode; checkoutFooter?: ReactNode;
}) {
  const panel = useDialog<HTMLDivElement>(open, onClose);
  const disabled = busy || locked;
  const inCheckout = step === "checkout" && lines.length > 0;
  return <AnimatePresence>
    {open ? <div className="fixed inset-0 z-50">
      <motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" tabIndex={-1}
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-kominka-white shadow-lg focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-usuzumi/30 px-6 py-4">
          {inCheckout && onBack ? <button type="button" onClick={onBack} className={`${purchaseUi.link} -ml-1`}><span aria-hidden="true" className="mr-1">←</span>{checkoutCopy.backToCart}</button> : null}
          <h2 id="cart-drawer-title" className="font-serif text-lg text-konsumi tracking-wider font-light">{inCheckout ? checkoutCopy.checkoutHeading : `カート（${count}点）`}</h2>
          <button type="button" data-autofocus onClick={onClose} aria-label="閉じる" className="flex h-11 w-11 items-center justify-center rounded-sm text-haicha transition-colors hover:bg-tsuchikabe hover:text-konsumi focus-visible:outline-2 focus-visible:outline-karekusa"><CloseIcon /></button>
        </div>
        <div key={inCheckout ? "checkout" : "cart"} className="flex-1 overflow-y-auto p-6">
          {inCheckout ? checkout : !lines.length ? <div className="py-16 text-center">
            <CartIcon className="mx-auto mb-4 h-12 w-12 text-usuzumi" strokeWidth={1.5} />
            <p className="text-sm text-haicha">カートは空です</p>
            <button type="button" onClick={onClose} className={`mt-4 ${purchaseUi.link}`}>商品を見る</button>
          </div> : <ul className="space-y-5">
            {lines.map(line => {
              const image = images.get(line.skuId) ?? "";
              const atMax = !line.item || line.quantity >= line.item.maxQuantity;
              return <li key={line.skuId} className="flex gap-4 border-b border-usuzumi/30 pb-5">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm">
                  <ProductPhoto image={image} alt="" failed={failedImages.has(line.skuId)} onError={() => onImageError(line.skuId)} sizes="80px" variant="thumb" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-sm leading-relaxed tracking-wide text-konsumi break-words">{line.item ? line.item.name : line.label}</p>
                  {line.item ? <p className="text-xs text-haicha">{yen(line.item.unitPrice)} / {line.item.unit}</p> : <p className="text-xs leading-relaxed text-haicha">一覧に表示されていない選択</p>}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <button type="button" className={stepper} disabled={disabled} aria-label={`${line.label}の数量を1つ減らす`} onClick={() => onChange(line.skuId, line.quantity - 1)}>−</button>
                      <span className="w-8 text-center text-sm font-medium text-konsumi" aria-label={`${line.label}の数量`}>{line.quantity}</span>
                      <button type="button" className={stepper} disabled={disabled || atMax} aria-label={`${line.label}の数量を1つ増やす`} onClick={() => onChange(line.skuId, line.quantity + 1)}>+</button>
                    </div>
                    <button type="button" className={purchaseUi.link} disabled={disabled} aria-label={`${line.label}を選択から外す`} onClick={() => onChange(line.skuId, 0)}>選択から外す</button>
                  </div>
                </div>
              </li>;
            })}
          </ul>}
        </div>
        {inCheckout ? <div className="space-y-3 border-t border-usuzumi/30 bg-tsuchikabe/50 p-6">{checkoutFooter}</div>
          : lines.length ? <div className="space-y-4 border-t border-usuzumi/30 bg-tsuchikabe/50 p-6">
          <div className="flex items-baseline justify-between gap-4 text-sm"><span className="text-haicha">小計</span><span className="font-serif text-xl text-konsumi">{yen(subtotal)}</span></div>
          <button type="button" className={`${purchaseUi.primary} w-full`} disabled={disabled || stale || !count} onClick={onCheckout}>{checkoutCopy.toCheckout}</button>
        </div> : null}
      </motion.div>
    </div> : null}
  </AnimatePresence>;
}
