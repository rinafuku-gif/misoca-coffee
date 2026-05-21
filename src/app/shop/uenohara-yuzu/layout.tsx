import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ゆずインフューズドコーヒー | 山梨・上野原のゆずから生まれた一杯 | 三十日珈琲",
  description:
    "山梨県上野原市の規格外ゆずを使ったインフューズドコーヒー。コーヒー生豆にゆずの香りを移してから焙煎した、紅茶のように楽しむ新しい一杯です。",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
