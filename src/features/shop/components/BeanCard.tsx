"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BeanDisplay } from "../bean-display";
import { addButtonState, type CatalogItemView } from "../bean-cart";
import type { ProductCardSettings } from "../product-card-settings";
import type { BuyerProductPublication } from "../product-publication-view";
import { ProductCardDetails } from "./ProductCardDetails";
import { CheckIcon, ProductPhoto } from "./shop-catalog-parts";

/** A sellable catalog item with its (optional) Notion display row. Name, unit
 * and price always come from the purchase catalog. */
export type BeanItem = CatalogItemView & { kind: "physical" | "gift"; publication?: BuyerProductPublication; merchandising?: ProductCardSettings; display: BeanDisplay | null };
export const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;

export function AddToCartButton({ item, quantity, blocked, added, onAdd, large = false }: {
  item: BeanItem; quantity: number; blocked: boolean; added: boolean; onAdd(): void; large?: boolean;
}) {
  const state = addButtonState(item, quantity, blocked);
  const size = large ? "px-7 py-3.5 text-xs tracking-[0.15em]" : "px-5 py-2.5 text-xs tracking-[0.1em]";
  return <motion.button
    type="button"
    onClick={onAdd}
    disabled={state.disabled}
    whileTap={state.disabled ? undefined : { scale: 0.97 }}
    aria-label={state.label === "在庫なし" ? `${item.name} ${item.unit}は在庫なし` : `${item.name} ${item.unit}をカートに入れる`}
    className={`relative inline-flex min-h-11 flex-shrink-0 items-center justify-center gap-2 transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa ${size} ${added
      ? "bg-konsumi text-white"
      : "border border-karekusa/30 text-karekusa enabled:hover:bg-karekusa enabled:hover:text-white"}`}
  >
    <AnimatePresence mode="wait" initial={false}>
      {added ? <motion.span key="added" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-1">
        <CheckIcon />追加しました
      </motion.span> : <motion.span key="add" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>{state.label}</motion.span>}
    </AnimatePresence>
  </motion.button>;
}

/** The product card of the shop page (ShopCatalog's layout). */
export function BeanCard({ item, quantity, blocked, added, imageFailed, onImageError, onOpen, onAdd }: {
  item: BeanItem; quantity: number; blocked: boolean; added: boolean; imageFailed: boolean;
  onImageError(): void; onOpen(): void; onAdd(): void;
}) {
  const d = item.display;
  return <article className="group flex h-full flex-col">
    <button type="button" onClick={onOpen} aria-label={`${item.name}の詳細を見る`} className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-karekusa">
      <div className="relative aspect-[4/5] overflow-hidden mb-6">
        <ProductPhoto image={d?.image ?? ""} alt={item.name} failed={imageFailed} onError={onImageError} sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
        {d?.roast ? <span className="absolute top-4 left-4 bg-konsumi/80 text-white text-xs px-3 py-1.5 tracking-wider">{d.roast}</span> : null}
        {item.maxQuantity === 0 ? <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-sm tracking-[0.2em]">在庫なし</span></div> : null}
      </div>
      {d?.origin ? <p className="text-xs tracking-[0.3em] text-karekusa uppercase mb-2">{d.origin}</p> : null}
      <h3 className="font-serif text-base text-konsumi mb-3 tracking-wider font-light leading-snug break-words">{item.name}</h3>
      <ProductCardDetails item={item} />
      {d?.process || d?.variety ? <div className="flex flex-wrap gap-1.5 mb-4">
        {[d.process, d.variety].filter(Boolean).map(tag => <span key={tag} className="text-xs text-haicha border border-karekusa/15 px-2 py-0.5 tracking-wide">{tag}</span>)}
      </div> : null}
    </button>
    <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <p className="text-karekusa text-sm tracking-wider">
        {yen(item.unitPrice)}
        <span className="text-xs text-haicha ml-2">/ {item.unit}</span>
      </p>
      <AddToCartButton item={item} quantity={quantity} blocked={blocked} added={added} onAdd={onAdd} />
    </div>
    {quantity > 0 ? <p className="mt-3 text-xs tracking-wide text-karekusa">{quantity}点を選択中</p> : null}
  </article>;
}
