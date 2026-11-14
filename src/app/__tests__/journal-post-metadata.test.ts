import { describe, expect, it, vi } from "vitest";
import { siteOrigin } from "@/shared/seo/site-entities";

vi.mock("@/features/journal/notion", () => ({
  getJournalPostById: vi.fn(async (id: string) => id === "missing" ? null : { id: "post-1", title: "記事の題", excerpt: id === "bare" ? "" : "記事の要約" }),
  getPageBlocks: vi.fn(async () => []),
}));

import { generateMetadata } from "../blog/[id]/page";

describe("journal post search/share metadata", () => {
  it("points a published post at its own address with a complete social block", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: "anything" }) });
    const url = `${siteOrigin}/blog/post-1`;
    expect(metadata.title).toBe("記事の題");
    expect(metadata.description).toBe("記事の要約");
    expect(metadata.alternates?.canonical).toBe(url);
    expect(metadata.openGraph).toMatchObject({ url, title: "記事の題 | 三十日珈琲", description: "記事の要約", type: "article", locale: "ja_JP", images: ["/images/hero/hero-interior-atmosphere.jpg"] });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "記事の題 | 三十日珈琲", images: ["/images/hero/hero-interior-atmosphere.jpg"] });
    expect(metadata.robots).toBeUndefined();
  });
  it("falls back to the title when a post has no excerpt", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: "bare" }) });
    expect(metadata.description).toBe("記事の題 - 三十日珈琲ジャーナル");
    expect(metadata.openGraph?.description).toBe(metadata.description);
  });
  it("keeps a missing post out of search and gives it no canonical", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ id: "missing" }) });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeUndefined();
  });
});
