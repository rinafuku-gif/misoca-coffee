import type { Metadata } from "next";
import { PurchasePanel } from "@/features/shop/components/PurchasePanel";
export const metadata: Metadata = { title: "商品と金額の確認", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function OrderPage() { return <PurchasePanel />; }
