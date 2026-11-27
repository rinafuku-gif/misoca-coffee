import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import contact from "@content/pages/contact.json";
import { LineRecommendation } from "@/features/contact/LineRecommendation";

const read = (path: string) => readFileSync(path, "utf8");

describe("お問い合わせのページの言葉を、トップの Instagram の後にも（2026-11-28 店主の指示）", () => {
  it("言葉はお問い合わせのページのまま（1か所の JSON にまとめ、ページとトップが同じものを読む）", () => {
    expect(contact.hero).toEqual({ title: "CONTACT", subtitle: "お問い合わせ", description: "ご質問・ご相談をお送りください。予約の確定は担当者との確認後です。" });
    expect(contact.line).toEqual({
      eyebrow: "Recommended",
      heading: "LINEでのお問い合わせが便利です",
      bodyLine1: "焙煎体験の日程・人数のご相談やご質問は、LINE公式アカウントからも受け付けています。",
      bodyLine2: "お気軽にメッセージをお送りください。",
      href: "https://lin.ee/ihDBxM8",
      buttonLabel: "LINE公式アカウントを友だち追加",
      instagramNote: "Instagram DM（@misoca_coffee）でもお問い合わせいただけます",
      formLinkLabel: "お問い合わせフォーム",
    });
    // 二重に持たない: ページの部品の中に同じ文を直接書いていない。
    for (const path of ["src/app/contact/page.tsx", "src/app/contact/layout.tsx", "src/app/page.tsx", "src/features/contact/LineRecommendation.tsx"]) {
      const source = read(path);
      for (const words of [contact.line.heading, contact.line.bodyLine1, contact.hero.description]) expect(source, path).not.toContain(words);
    }
    // 「お問い合わせフォーム」はフッターで /contact へのリンクに使っている言葉。
    expect(read("src/shared/ui/Footer.tsx")).toContain('{ href: "/contact", label: "お問い合わせフォーム" }');
  });
  it("トップ: Instagram の欄のすぐ後、ページの最後の欄。トップの決まり（土壁の帯・本文・線のボタン）で、LINE のボタンとお問い合わせフォームへの文字リンク", () => {
    const home = read("src/app/page.tsx");
    const instagram = home.indexOf("{/* ─── 10. Instagram ─── */}"), block = home.indexOf('<LineRecommendation variant="home" />');
    expect(instagram).toBeGreaterThan(0); expect(block).toBeGreaterThan(instagram);
    expect(home.slice(block)).toMatch(/^<LineRecommendation variant="home" \/>\n {4}<\/>\n {2}\);\n}/);
    const html = renderToStaticMarkup(<LineRecommendation variant="home" />);
    expect(html).toContain('<section class="bg-tsuchikabe py-24 md:py-32">');
    for (const words of [contact.line.eyebrow, contact.line.heading, contact.line.bodyLine1, contact.line.bodyLine2, contact.line.buttonLabel]) expect(html).toContain(words);
    expect(html).toMatch(/<a href="https:\/\/lin\.ee\/ihDBxM8" data-journey-surface="contact" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 border border-karekusa\/30 text-karekusa text-xs tracking-\[0\.15em\] px-7 py-3\.5/);
    expect(html).toContain(`href="/contact"`); expect(html).toContain(`>${contact.line.formLinkLabel}</a>`);
    expect(html).not.toContain(contact.line.instagramNote);
  });
  it("お問い合わせのページ: 上部の言葉と LINE の案内は今までどおり（緑のボタン・Instagram DM の一言）で、フォームより前に一番に案内する", () => {
    const html = renderToStaticMarkup(<LineRecommendation variant="contact" />);
    expect(html).toContain('<section class="bg-tsuchikabe py-16 md:py-20 overflow-hidden">');
    expect(html).toContain("bg-[#06C755]"); expect(html).toContain(contact.line.instagramNote); expect(html).not.toContain('href="/contact"');
    const page = read("src/app/contact/page.tsx");
    expect(page).toContain("title={contactContent.hero.title}"); expect(page).toContain("description={contactContent.hero.description}");
    expect(page.indexOf('<LineRecommendation variant="contact" />')).toBeLessThan(page.indexOf("{/* フォームでのお問い合わせ */}"));
    expect(read("src/app/contact/layout.tsx")).toContain("description: contactContent.hero.description");
  });
  it("ヘッダー: 真ん中のメニューの LINE はお問い合わせ（/contact）。LINE への直接のリンクはヘッダーから無くなる", () => {
    const header = read("src/shared/ui/Header.tsx");
    expect(header).toContain('{ href: "/contact", label: "お問い合わせ" }');
    expect(header).not.toContain("lin.ee");
  });
});
