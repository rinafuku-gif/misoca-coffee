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
    default: "三十日珈琲 Shared Roasting | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    template: "%s | 三十日珈琲",
  },
  description:
    "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。東京から約1時間、自分だけのコーヒーを焙煎する特別な時間。",
  metadataBase: new URL("https://misoca-coffee.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "三十日珈琲 Shared Roasting",
    title: "三十日珈琲 | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    description:
      "山梨県上野原市、築300年の古民家で焙煎体験。東京から約1時間、自分だけのコーヒーを焙煎する特別な時間。",
    images: [
      {
        url: "/images/hero/hero-interior-atmosphere.jpg",
        width: 1200,
        height: 630,
        alt: "三十日珈琲 築300年の古民家焙煎所",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "三十日珈琲 | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    description:
      "山梨県上野原市、築300年の古民家で焙煎体験。東京から約1時間、自分だけのコーヒーを焙煎する特別な時間。",
    images: ["/images/hero/hero-interior-atmosphere.jpg"],
  },
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
