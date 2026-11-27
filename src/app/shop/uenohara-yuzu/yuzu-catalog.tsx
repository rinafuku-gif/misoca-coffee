"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { readPurchaseCatalog, type CatalogProduct } from "@/features/shop/purchase-catalog";
import { findShopItem, type ShopItemRef } from "@/features/shop/shop-item-link";

/** The shop's own purchase catalog, read once for the whole page (the same reading
 * as the shop and the home page), so the prices here are the shop's prices.
 * null = not read (yet, or it could not be read): the page keeps its written price. */
const YuzuCatalog = createContext<readonly CatalogProduct[] | null>(null);

export function YuzuCatalogProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly CatalogProduct[] | null>(null);
  useEffect(() => {
    let live = true;
    readPurchaseCatalog().then(catalog => { if (live) setItems(catalog.items); }).catch(() => { /* Keep the written prices. */ });
    return () => { live = false; };
  }, []);
  return <YuzuCatalog.Provider value={items}>{children}</YuzuCatalog.Provider>;
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

/** The price of one product as the shop sells it now. When the catalog says the
 * product is not listed or has no stock, the shop's own words instead of a price. */
export function YuzuPrice({ product, fallbackPrice, tax }: { product: ShopItemRef; fallbackPrice: number; tax: string }) {
  const view = yuzuPriceView(useContext(YuzuCatalog), product, fallbackPrice);
  if (view.kind === "notListed") return <span className="text-base text-white/80">ただいまショップに並んでいません</span>;
  if (view.kind === "soldOut") return <span className="text-base text-white/80">在庫なし</span>;
  return <>
    <span className="font-serif text-3xl font-light tracking-wider">{yen(view.price)}</span>
    <span className="text-base text-white/80">（{tax}）</span>
  </>;
}
