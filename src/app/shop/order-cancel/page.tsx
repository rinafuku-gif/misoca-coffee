import type { Metadata } from "next";
import { OrderCancelPanel } from "@/features/shop/components/OrderCancelPanel";

// The link carries a private token: not indexed, no referrer, not measured.
export const metadata: Metadata = { title: "キャンセルのお申し込み", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function OrderCancelPage() { return <OrderCancelPanel />; }
