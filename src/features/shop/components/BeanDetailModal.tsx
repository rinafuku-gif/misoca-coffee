"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AddToCartButton, yen, type BeanItem } from "./BeanCard";
import { ProductPublicationDetails } from "./ProductPublicationDetails";
import { CloseIcon, ProductFactGrid, ProductPhoto } from "./shop-catalog-parts";
import { useDialog } from "./use-dialog";

/** Product detail (ShopCatalog's modal). Text comes only from the Notion
 * display row, or from the approved publication when the catalog carries one. */
export function BeanDetailModal({ item, quantity, blocked, added, imageFailed, onImageError, onAdd, onClose }: {
  item: BeanItem | null; quantity: number; blocked: boolean; added: boolean; imageFailed: boolean;
  onImageError(): void; onAdd(): void; onClose(): void;
}) {
  const panel = useDialog<HTMLDivElement>(item !== null, onClose);
  const d = item?.display ?? null;
  return <AnimatePresence>
    {item ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby="bean-detail-title" tabIndex={-1}
        initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-kominka-white overflow-y-auto rounded-sm shadow-lg focus:outline-none"
      >
        <button type="button" data-autofocus onClick={onClose} aria-label="閉じる" className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-sm bg-kominka-white/80 text-haicha backdrop-blur-sm transition-colors hover:bg-tsuchikabe hover:text-konsumi focus-visible:outline-2 focus-visible:outline-karekusa">
          <CloseIcon />
        </button>
        <div className="relative aspect-[3/2] md:aspect-[16/9] overflow-hidden">
          <ProductPhoto image={d?.image ?? ""} alt={item.name} failed={imageFailed} onError={onImageError} sizes="(max-width: 768px) 100vw, 672px" variant="modal" />
          {d?.roast ? <span className="absolute top-4 left-4 bg-konsumi/80 text-white text-xs px-3 py-1.5 tracking-wider">{d.roast}</span> : null}
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          {d?.origin ? <p className="text-xs tracking-[0.3em] text-karekusa uppercase mb-2">{d.origin}</p> : null}
          <h2 id="bean-detail-title" className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-4 leading-snug break-words">{item.name}</h2>
          {d?.flavor ? <p className="text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-6">{d.flavor}</p> : null}
          {item.publication ? <div className="mb-8"><ProductPublicationDetails publication={item.publication} /></div> : <>
            {d?.description ? <p className="text-sm text-haicha leading-[2.2] tracking-wide mb-6 whitespace-pre-wrap break-words">{d.description}</p> : null}
            <ProductFactGrid facts={[["地域", d?.region ?? ""], ["農園", d?.farm ?? ""], ["精製", d?.process ?? ""], ["品種", d?.variety ?? ""], ["標高", d?.altitude ?? ""]]} />
          </>}
          <div className="w-full h-px bg-karekusa/15 mb-6" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-karekusa text-2xl font-light tracking-wider">
              {yen(item.unitPrice)}
              <span className="text-sm text-haicha ml-2">/ {item.unit}</span>
            </p>
            <AddToCartButton item={item} quantity={quantity} blocked={blocked} added={added} onAdd={onAdd} large />
          </div>
          {quantity > 0 ? <p className="mt-4 text-sm tracking-wide text-karekusa">{quantity}点を選択中</p> : null}
        </div>
      </motion.div>
    </div> : null}
  </AnimatePresence>;
}
