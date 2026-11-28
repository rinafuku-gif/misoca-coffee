"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { readPurchaseCatalog, type Catalog } from "@/features/shop/purchase-catalog";
import { beanPageId, readBeanDisplays } from "@/features/shop/bean-display";
import { receptionPauseNotice } from "@/features/shop/reception-notice";
import { checkoutCopy } from "@/features/shop/checkout-copy";
import { ProductPhoto } from "@/features/shop/components/shop-catalog-parts";
import { findShopItem, shopItemAddHref, shopItemHref, type ShopItemRef } from "@/features/shop/shop-item-link";

/** The shop's own purchase catalog, read once for the whole page (the same reading
 * as the shop and the home page), so prices and stock here are the shop's.
 * loading: not read yet (the page shows its written prices; 「カートに入れる」 still works,
 * the shop decides). failed: could not be read (as the shop: nothing can be put in the cart). */
export type CatalogState = { state: "loading" } | { state: "failed" } | { state: "ready"; catalog: Catalog };
const YuzuCatalog = createContext<CatalogState>({ state: "loading" });

export function YuzuCatalogProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<CatalogState>({ state: "loading" });
  useEffect(() => {
    let live = true;
    readPurchaseCatalog()
      .then(catalog => { if (live) setValue({ state: "ready", catalog }); })
      .catch(() => { if (live) setValue({ state: "failed" }); });
    return () => { live = false; };
  }, []);
  return <YuzuCatalog.Provider value={value}>{children}</YuzuCatalog.Provider>;
}

const yen = (value: number) => `¥${value.toLocaleString("ja-JP")}`;

/** What to show for one product. items = the catalog's items, or null while it is not
 * read (or could not be read): then the written price. */
export function yuzuPriceView(items: readonly { skuId: string; name: string; unitPrice: number; maxQuantity: number }[] | null, product: ShopItemRef, fallbackPrice: number):
  { kind: "price"; price: number } | { kind: "notListed" } | { kind: "soldOut" } {
  if (items === null) return { kind: "price", price: fallbackPrice };
  const item = findShopItem(product, items);
  if (!item) return { kind: "notListed" };
  return item.maxQuantity === 0 ? { kind: "soldOut" } : { kind: "price", price: item.unitPrice };
}

const itemsOf = (value: CatalogState) => value.state === "ready" ? value.catalog.items : null;

/** The price of one product as the shop sells it now. When the catalog says the
 * product is not listed or has no stock, the shop's own words instead of a price. */
export function YuzuPrice({ product, fallbackPrice, tax }: { product: ShopItemRef; fallbackPrice: number; tax: string }) {
  const view = yuzuPriceView(itemsOf(useContext(YuzuCatalog)), product, fallbackPrice);
  if (view.kind === "notListed") return <span className="text-base text-white/80">ただいまショップに並んでいません</span>;
  if (view.kind === "soldOut") return <span className="text-base text-white/80">在庫なし</span>;
  return <>
    <span className="font-serif text-3xl font-light tracking-wider">{yen(view.price)}</span>
    <span className="text-base text-white/80">（{tax}）</span>
  </>;
}

/** What the 「カートに入れる」 of one product does, decided as the shop does:
 * add = go to the shop, which puts one in its cart and opens the cart;
 * soldOut / unavailable = cannot be pressed; notListed = only look at the shop. */
export function yuzuCartAction(value: CatalogState, product: ShopItemRef): "add" | "soldOut" | "unavailable" | "notListed" {
  if (value.state === "failed") return "unavailable";
  if (value.state === "loading") return "add";
  const view = yuzuPriceView(value.catalog.items, product, 0);
  return view.kind === "price" ? "add" : view.kind;
}

export function YuzuAddToCart({ product, label, styles }: { product: ShopItemRef; label: string; styles: { add: string; look: string; disabled: string } }) {
  const action = yuzuCartAction(useContext(YuzuCatalog), product);
  if (action === "add") return <Link href={shopItemAddHref(product)} aria-label={label} className={styles.add}>カートに入れる</Link>;
  if (action === "notListed") return <Link href={shopItemHref(product)} className={styles.look}>ショップで見る</Link>;
  return <button type="button" disabled aria-label={label} className={styles.disabled}>{action === "soldOut" ? "在庫なし" : "カートに入れる"}</button>;
}

/** One line under the products, the shop's own words: the catalog could not be read,
 * or orders are not being taken right now. Nothing otherwise. */
export function YuzuCartNotice() {
  const value = useContext(YuzuCatalog);
  const text = value.state === "failed" ? `${checkoutCopy.loadFailed}。少し時間をおいて、もう一度お試しください。`
    : value.state === "ready" && !value.catalog.acceptingOrders ? receptionPauseNotice(value.catalog.reception) ?? "現在は注文を受け付けていません。金額の確認はできますが、決済へは進めません。"
    : null;
  return text ? <p role="status" className="mt-1 border-l-2 border-gold pl-4 text-base text-white leading-[1.9] tracking-wide">{text}</p> : null;
}

/** The product photo registered for a product in the shop (the same display data and
 * image route as the shop's card), not stored again here. Nothing at all when there is
 * no photo or it cannot be read. */
export function YuzuShopPhoto({ product, alt, className = "" }: { product: ShopItemRef; alt: string; className?: string }) {
  const [image, setImage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const id = beanPageId(product);
    if (!id) return;
    let live = true;
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000);
    void readBeanDisplays(controller.signal).then(items => { if (live) setImage(items.find(item => item.id === id)?.image ?? ""); }).finally(() => clearTimeout(timer));
    return () => { live = false; clearTimeout(timer); controller.abort(); };
  }, [product]);
  if (!image || failed) return null;
  return <div className={`relative aspect-[3/2] overflow-hidden ${className}`}>
    <ProductPhoto image={image} alt={alt} failed={failed} onError={() => setFailed(true)} sizes="(max-width: 768px) 100vw, 768px" />
  </div>;
}
