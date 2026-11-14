import type { Metadata } from "next";
import { PurchaserStatusPanel } from "@/features/shop/components/PurchaserStatusPanel";

export const metadata: Metadata = { title: "注文状況の確認 | 三十日珈琲", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function SuccessPage() { return <PurchaserStatusPanel />; }
