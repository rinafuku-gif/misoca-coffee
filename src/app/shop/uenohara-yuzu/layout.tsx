import type { Metadata } from "next";
import { siteOrigin } from "@/shared/seo/site-entities";
import { yuzuPagePhotos } from "./yuzu-lp-content";

// 題名の後ろには、サイト共通の「 | 三十日珈琲」が付く（app/layout.tsx の template）。
const title = "ゆずインフューズドコーヒー｜ドリップバッグと焙煎豆300g（山梨・上野原のゆず）";
const description =
  "山梨県上野原市のゆずをコーヒーの生豆に漬け込み、香りを移してから焙煎した、ゆずインフューズドコーヒー。1杯分のドリップバッグと、焙煎豆300g（豆のまま）から選べます。中浅煎り。香料は使っていません。オンラインショップで買えます。";
const url = `${siteOrigin}/shop/uenohara-yuzu`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title: `${title} | 三十日珈琲`, description, url, type: "website", locale: "ja_JP",
    images: [yuzuPagePhotos.pour.src],
  },
  twitter: {
    card: "summary_large_image", title: `${title} | 三十日珈琲`, description,
    images: [yuzuPagePhotos.pour.src],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
