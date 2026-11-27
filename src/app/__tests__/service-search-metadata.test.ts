import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { metadata as experience } from "../experience/page";
import { metadata as about } from "../about/page";
import { metadata as catering } from "../catering/page";
import { metadata as mobile } from "../mobile-roasting/page";
import { metadata as faq } from "../faq/page";
import { metadata as privacy } from "../privacy/page";
import { metadata as terms } from "../terms/page";
import { metadata as legal } from "../tokushoho/page";
import { metadata as contact } from "../contact/layout";
import experienceContent from "@content/pages/experience.json";
import aboutContent from "@content/pages/about.json";
import cateringContent from "@content/pages/catering.json";
import mobileContent from "@content/pages/mobile-roasting.json";
import faqContent from "@content/pages/faq.json";
import { siteOrigin } from "@/shared/seo/site-entities";
import sitemap from "../sitemap";

const pages = [
  ["/experience", experience, experienceContent],
  ["/about", about, aboutContent],
  ["/catering", catering, cateringContent],
  ["/mobile-roasting", mobile, mobileContent],
  ["/faq", faq, faqContent],
] as const;
const informationPages = [
  ["/privacy", privacy, "プライバシーポリシー"],
  ["/terms", terms, "利用規約"],
  ["/tokushoho", legal, "特定商取引法に基づく表記"],
  ["/contact", contact, "お問い合わせ"],
] as const;

describe("service and FAQ search/share metadata", () => {
  it.each(pages)("uses the existing text and self URL for %s", (path, metadata, content) => {
    const url = siteOrigin + path;
    expect(metadata.title).toBe(content.seo.title);
    expect(metadata.description).toBe(content.seo.description);
    expect(metadata.alternates?.canonical).toBe(url);
    expect(metadata.openGraph).toMatchObject({ url, title: `${content.seo.title} | 三十日珈琲`, description: content.seo.description, type: "website", locale: "ja_JP" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: `${content.seo.title} | 三十日珈琲`, description: content.seo.description });
    const images = metadata.openGraph?.images as string[];
    expect(images).toHaveLength(1);
    expect(images[0]).toMatch(/^\/images\//);
    expect(existsSync(resolve(process.cwd(), "public" + images[0]))).toBe(true);
    expect(metadata.twitter).toMatchObject({ images });
    expect(sitemap().filter(row => row.url === url)).toHaveLength(1);
    expect(metadata.robots).toBeUndefined();
  });
  it("keeps every service's social title and canonical distinct", () => {
    expect(new Set(pages.map(([, value]) => value.alternates?.canonical)).size).toBe(5);
    expect(new Set(pages.map(([, value]) => value.openGraph?.title)).size).toBe(5);
  });
  it.each(informationPages)("keeps %s discoverable with its own canonical and complete social metadata", (path, value, title) => {
    expect(value.title).toBe(title);
    expect(value.description).toBeTruthy();
    expect(value.alternates?.canonical).toBe(siteOrigin + path);
    expect(value.openGraph).toMatchObject({ title: `${title} | 三十日珈琲`, url: siteOrigin + path, description: value.description, locale: "ja_JP", type: "website", images: ["/images/hero/hero-interior-atmosphere.jpg"] });
    expect(value.twitter).toMatchObject({ card: "summary_large_image", title: `${title} | 三十日珈琲`, description: value.description, images: ["/images/hero/hero-interior-atmosphere.jpg"] });
    expect(value.robots).toBeUndefined();
    expect(sitemap().filter(row => row.url === siteOrigin + path)).toHaveLength(1);
  });
  it("does not reuse the service or homepage canonical for information pages", () => {
    const urls = [...pages, ...informationPages].map(([, value]) => value.alternates?.canonical);
    // 2026-11-28: the community page was removed (10 → 9 pages).
    expect(new Set(urls).size).toBe(9);
    expect(urls).not.toContain(siteOrigin + "/");
  });
});
