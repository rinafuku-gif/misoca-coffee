import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteShell } from "@/shared/ui/SiteShell";
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
  weight: ["400"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://misoca-coffee.vercel.app"),
  title: {
    default: "三十日珈琲 Shared Roasting | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    template: "%s | 三十日珈琲",
  },
  description:
    "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。都心から少し足を伸ばして、自分だけのコーヒーを焙煎する特別な時間。",
  openGraph: {
    title: "三十日珈琲 Shared Roasting | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    description:
      "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。都心から少し足を伸ばして、自分だけのコーヒーを焙煎する特別な時間。",
    images: ["/images/hero/hero-interior-atmosphere.jpg"],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "三十日珈琲 Shared Roasting | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    description:
      "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。都心から少し足を伸ばして、自分だけのコーヒーを焙煎する特別な時間。",
    images: ["/images/hero/hero-interior-atmosphere.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // env値に末尾改行・空白が混入してもインラインscriptを壊さないようtrimする
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: "三十日珈琲 Shared Roasting",
                image: "https://misoca-coffee.vercel.app/images/hero/hero-interior-atmosphere.jpg",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "松留939",
                  addressLocality: "上野原市",
                  addressRegion: "山梨県",
                  postalCode: "409-0115",
                  addressCountry: "JP",
                },
                url: "https://misoca-coffee.vercel.app",
                email: "misocacoffee@gmail.com",
                description:
                  "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "三十日珈琲 Shared Roasting",
                url: "https://misoca-coffee.vercel.app",
              },
            ]),
          }}
        />
      </head>
      <body className="antialiased">
        <SiteShell>{children}</SiteShell>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
