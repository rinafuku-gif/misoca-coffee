import type { Metadata } from "next";
import { siteOrigin } from "./site-entities";

type ServicePath = "/experience" | "/about" | "/catering" | "/mobile-roasting" | "/faq" | "/community" | "/privacy" | "/terms" | "/tokushoho" | "/contact";

// Use the existing editorial text, not generated claims, prices or availability.
// Nested metadata is replaced by Next.js, so each social block is complete.
export function serviceMetadata(
  path: ServicePath,
  seo: { title: string; description: string },
  image = "/images/hero/hero-interior-atmosphere.jpg",
): Metadata {
  const url = siteOrigin + path;
  const title = `${seo.title} | 三十日珈琲`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: { title, description: seo.description, url, siteName: "三十日珈琲 Shared Roasting", type: "website", locale: "ja_JP", images: [image] },
    twitter: { card: "summary_large_image", title, description: seo.description, images: [image] },
  };
}
