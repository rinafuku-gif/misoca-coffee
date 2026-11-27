import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import config from "../../../next.config";
import sitemap from "../sitemap";
import { Footer } from "@/shared/ui/Footer";

const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? (name === "__tests__" ? [] : walk(path)) : [path];
});

describe("コミュニティのページを消す（2026-11-28 店主の指示）", () => {
  it("ページそのものが無い", () => {
    expect(existsSync("src/app/community")).toBe(false);
    expect(existsSync("content/pages/community.json")).toBe(false);
  });
  it("サイトの中に /community を指す所・「コミュニティ」の言葉が残っていない（メニュー・フッター・サイトマップ・検索向けデータ・計測）", () => {
    for (const path of [...walk("src"), ...walk("content"), "public/cms/config.yml"]) {
      const source = readFileSync(path, "utf8");
      expect(source, path).not.toMatch(/["'`]\/community\b/);
      expect(source, path).not.toMatch(/コミュニティ|COMMUNITY/);
    }
    expect(sitemap().map(entry => new URL(entry.url).pathname)).not.toContain("/community");
  });
  it("フッターの「つながる」は LINE・イベント情報・お問い合わせ（コミュニティを外す）", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).not.toContain("/community");
    for (const href of ["https://lin.ee/ihDBxM8", "https://luma.com/misoca_coffee", "/contact", "/about"]) expect(html).toContain(`href="${href}"`);
  });
  it("以前の住所 /community とその下のすべての住所は、恒久的な転送で「三十日珈琲について」へ", async () => {
    const rules = await config.redirects!();
    expect(rules).toContainEqual(expect.objectContaining({ source: "/community", destination: "/about", permanent: true }));
    expect(rules).toContainEqual(expect.objectContaining({ source: "/community/:path*", destination: "/about", permanent: true }));
    // 転送先はコミュニティの中身を持たない（ページそのものが無い）。
    expect(existsSync("src/app/about/page.tsx") || existsSync("src/app/about")).toBe(true);
    expect(readFileSync("content/pages/about.json", "utf8")).not.toMatch(/コミュニティ|community/i);
  });
});
