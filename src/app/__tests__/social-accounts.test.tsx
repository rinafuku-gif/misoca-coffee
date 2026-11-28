import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import home from "@content/pages/home.json";
import stand from "@content/pages/stand.json";
import contact from "@content/pages/contact.json";
import { instagramAccounts, lineAccount } from "@/shared/ui/social-accounts";
import { LineRecommendation } from "@/features/contact/LineRecommendation";
import { InstagramAccounts } from "@/features/contact/InstagramAccounts";
import { Footer } from "@/shared/ui/Footer";

const read = (path: string) => readFileSync(path, "utf8");
const anchors = (html: string) => [...html.matchAll(/<a [^>]*>/g)].map(m => m[0]);

describe("Instagram は本店とコーヒースタンドの2つ、LINE も（2026-11-28 店主の指示）", () => {
  it("住所はサイトのページにあるものだけ（トップの Instagram・コーヒースタンドのページ・お問い合わせのページの LINE）", () => {
    expect(instagramAccounts).toEqual([
      { key: "main", label: "三十日珈琲", handle: "@misoca_coffee", href: home.instagram.href },
      { key: "stand", label: "コーヒースタンド", handle: "@misoca_coffeestand", href: stand.followUs.igHref },
    ]);
    expect(stand.followUs.igHref).toBe("https://www.instagram.com/misoca_coffeestand");
    expect(lineAccount).toEqual({ label: "LINE公式アカウント", href: contact.line.href });
    expect(contact.line.href).toBe("https://lin.ee/ihDBxM8");
    // フッターからは、コーヒーが飲める場所としてスタンドを案内する。
    expect(read("src/shared/ui/Footer.tsx")).toContain('{ href: "/stand", label: "コーヒーが飲める場所" }');
  });
  it("トップ: Instagram は単独の欄にせず、LINE の欄の中（見出しは1つ）。2つのアカウントを添え書きつきで並べる", () => {
    const html = renderToStaticMarkup(<LineRecommendation variant="home"><InstagramAccounts /></LineRecommendation>);
    expect(html.match(/<section/g)).toHaveLength(1); expect(html.match(/<h2/g)).toHaveLength(1);
    expect(html.indexOf(contact.line.heading)).toBeLessThan(html.indexOf(home.instagram.bodyLine1));
    for (const words of [home.instagram.bodyLine1, home.instagram.bodyLine2, "三十日珈琲", "コーヒースタンド", "@misoca_coffee", "@misoca_coffeestand"]) expect(html).toContain(words);
    const links = anchors(html).filter(a => a.includes("instagram.com"));
    expect(links).toHaveLength(2);
    for (const a of links) { expect(a).toContain('target="_blank"'); expect(a).toContain('rel="noopener noreferrer"'); expect(a).toContain("min-h-11"); }
    expect(links[1]).toContain('href="https://www.instagram.com/misoca_coffeestand"');
    expect(links[1]).toContain('aria-label="コーヒースタンドのInstagram @misoca_coffeestand（新しいタブで開きます）"');
    // 単独の Instagram の欄はもう無い。
    expect(read("src/app/page.tsx")).not.toContain("homeContent.instagram");
  });
  it("フッターの下の段: Instagram（本店・コーヒースタンド）と LINE 公式アカウント。どれも押せる高さ44px・文字で名前・新しいタブ", () => {
    const html = renderToStaticMarkup(<Footer />);
    for (const href of ["https://www.instagram.com/misoca_coffee/", "https://www.instagram.com/misoca_coffeestand", "https://lin.ee/ihDBxM8"]) {
      const link = anchors(html).filter(a => a.includes(`href="${href}"`) && a.includes("min-h-11"));
      expect(link, href).toHaveLength(1);
      expect(link[0]).toContain('target="_blank"'); expect(link[0]).toContain('rel="noopener noreferrer"');
    }
    for (const name of ['<span class="tracking-wide">@misoca_coffee</span>', '<span class="tracking-wide">@misoca_coffeestand</span>', '<span class="tracking-wide">LINE公式アカウント</span>']) expect(html).toContain(name);
  });
});
