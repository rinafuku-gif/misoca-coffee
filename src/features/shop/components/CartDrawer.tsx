"use client";

import { AnimatePresence, motion } from "framer-motion";
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

/** Cart drawer (ShopCatalog's). Lists the saved selection; its main button
 * goes to the existing quote step. It shows no subtotal, shipping or total:
 * those are only ever the quote's answer. */
export function CartDrawer({ open, lines, count, busy, locked, stale, images, failedImages, onImageError, onChange, onClose, onQuote }: {
  open: boolean; lines: readonly DrawerLine[]; count: number; busy: boolean; locked: boolean; stale: boolean;
  images: ReadonlyMap<string, string>; failedImages: ReadonlySet<string>; onImageError(skuId: string): void;
  onChange(skuId: string, quantity: number): void; onClose(): void; onQuote(): void;
}) {
  const panel = useDialog<HTMLDivElement>(open, onClose);
  const disabled = busy || locked;
  return <AnimatePresence>
    {open ? <div className="fixed inset-0 z-50">
      <motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" tabIndex={-1}
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-kominka-white shadow-lg focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-usuzumi/30 px-6 py-4">
          <h2 id="cart-drawer-title" className="font-serif text-lg text-konsumi tracking-wider font-light">カート（{count}点）</h2>
          <button type="button" data-autofocus onClick={onClose} aria-label="閉じる" className="flex h-11 w-11 items-center justify-center rounded-sm text-haicha transition-colors hover:bg-tsuchikabe hover:text-konsumi focus-visible:outline-2 focus-visible:outline-karekusa"><CloseIcon /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!lines.length ? <div className="py-16 text-center">
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
        {lines.length ? <div className="space-y-3 border-t border-usuzumi/30 bg-tsuchikabe/50 p-6">
          {stale ? <p className="text-sm leading-loose text-haicha">現在は更新前の商品一覧です。更新できるまで決済には進めません。選択から外す操作はできます。</p> : null}
          <p className="text-sm leading-relaxed text-haicha">送料と合計は、お支払いの前に確認できます。</p>
          <button type="button" className={`${purchaseUi.primary} w-full`} disabled={disabled || stale || !count} onClick={onQuote}>送料を含む合計を確認</button>
          <p className="text-center text-xs text-haicha">選ぶだけでは注文されません</p>
        </div> : null}
      </motion.div>
    </div> : null}
  </AnimatePresence>;
}
