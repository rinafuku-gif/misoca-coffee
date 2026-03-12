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
    "山梨県上野原市、築300年の古民家で焙煎体験。コーヒーを入口に、暮らしの体験を届ける。都心から少し足を伸ばして、自分だけのコーヒーを焙煎する特別な時間。",
  metadataBase: new URL("https://misoca-coffee.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "三十日珈琲 Shared Roasting",
    title: "三十日珈琲 | コーヒーと暮らす。古くて新しい、みんなの焙煎所",
    description:
      "山梨県上野原市、築300年の古民家で焙煎体験。都心から少し足を伸ばして、自分だけのコーヒーを焙煎する特別な時間。",
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
      "山梨県上野原市、築300年の古民家で焙煎体験。都心から少し足を伸ばして、自分だけのコーヒーを焙煎する特別な時間。",
    images: ["/images/hero/hero-interior-atmosphere.jpg"],
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://misoca-coffee.vercel.app/#business",
      name: "三十日珈琲",
      alternateName: "Misoca Coffee Shared Roasting",
      description:
        "山梨県上野原市、築300年の古民家で焙煎体験。スペシャルティコーヒーの焙煎所。",
      url: "https://misoca-coffee.vercel.app",
      image: "https://misoca-coffee.vercel.app/images/hero/hero-interior-atmosphere.jpg",
      email: "misocacoffee@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "松留939",
        addressLocality: "上野原市",
        addressRegion: "山梨県",
        postalCode: "409-0115",
        addressCountry: "JP",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 35.6306,
        longitude: 139.1106,
      },
      sameAs: [
        "https://www.instagram.com/misoca_coffee/",
        "https://luma.com/misoca_coffee",
        "https://my.prairie.cards/u/misocacoffee",
      ],
      priceRange: "¥800〜¥8,800",
    },
    {
      "@type": "WebSite",
      "@id": "https://misoca-coffee.vercel.app/#website",
      url: "https://misoca-coffee.vercel.app",
      name: "三十日珈琲",
      publisher: { "@id": "https://misoca-coffee.vercel.app/#business" },
      inLanguage: "ja",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
              }}
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
