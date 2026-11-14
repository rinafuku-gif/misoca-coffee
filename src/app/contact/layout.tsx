import type { ReactNode } from "react";
import { serviceMetadata } from "@/shared/seo/service-metadata";

// The page is a client component and cannot export metadata, so its search
// and share text lives here. Both strings repeat words shown on the page.
export const metadata = serviceMetadata("/contact", {
  title: "お問い合わせ",
  description: "ご質問・ご相談をお送りください。予約の確定は担当者との確認後です。",
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
