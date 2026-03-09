import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "三十日珈琲 Shared Roasting | コーヒーから始まる、もうひとつの日常",
    template: "%s | 三十日珈琲",
  },
  description:
    "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。東京から約1時間、自分だけのコーヒーを焙煎する特別な時間。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
