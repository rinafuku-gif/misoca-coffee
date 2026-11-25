import type { Metadata } from "next";
import ShopCatalog from "@/features/shop/components/ShopCatalog";
import { PurchasePanel } from "@/features/shop/components/PurchasePanel";
import { WhyOnline } from "@/features/shop/components/WhyOnline";
import { SHOP_PAUSED } from "@/features/shop/policy";

const title = "オンラインショップ";
const description = SHOP_PAUSED
  ? "三十日珈琲 Shared Roastingのコーヒー豆とギフトのご案内。現在、Webでの注文受付を休止しています。"
  : "三十日珈琲 Shared Roastingのコーヒー豆とギフトのご案内。商品と購入方法をご確認いただけます。";
const url = "https://misoca-coffee.vercel.app/shop";

// Page-level metadata avoids making /shop the canonical of child order pages.
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: url },
  openGraph: {
    title: `${title} | 三十日珈琲`, description, url, type: "website", locale: "ja_JP",
    images: ["/images/experience/coffee-beans-close.jpg"],
  },
  twitter: {
    card: "summary_large_image", title: `${title} | 三十日珈琲`, description,
    images: ["/images/experience/coffee-beans-close.jpg"],
  },
};

export default function ShopPage() {
  // Keep the current pause and its product guide. Once reopening is approved,
  // use the ledger-backed flow, never revive the legacy checkout/cart.
  // While paused, ShopCatalog itself places WhyOnline right before 配送について.
  // After reopening, the same section follows the purchase panel.
  return SHOP_PAUSED ? <ShopCatalog /> : <><PurchasePanel shopRoot /><WhyOnline /></>;
}
