import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
const { Header, HeaderCtas, headerCtaCopy } = await import("../Header");

const source = readFileSync("src/shared/ui/Header.tsx", "utf8");
const anchors = (html: string) => [...html.matchAll(/<a [^>]*>[^<]*<\/a>/g)].map(match => match[0]);

describe("ヘッダー: オンラインショップと焙煎体験の予約を、同じ格のボタンで並べる", () => {
  it("真ん中のナビからオンラインショップを外す（ボタンに移す）", () => {
    const nav = source.slice(source.indexOf("const navItems"), source.indexOf("];", source.indexOf("const navItems")));
    expect(nav).not.toContain("オンラインショップ");
    expect(nav).not.toContain('"/shop"');
    for (const label of ["体験する", "コーヒースタンド", "知る", "アクセス", "お問い合わせ"]) expect(nav).toContain(label);
    // 2026-11-28: the menu's LINE became お問い合わせ (/contact, where LINE is offered first).
    expect(nav).toContain('{ href: "/contact", label: "お問い合わせ" }'); expect(nav).not.toContain("lin.ee");
    const html = renderToStaticMarkup(<Header />);
    const desktopNav = html.slice(html.indexOf('<nav class="hidden lg:flex'), html.indexOf("</nav>"));
    expect(desktopNav).not.toContain(headerCtaCopy.shop);
  });
  it("横長の画面: オンラインショップ → 焙煎体験の順。大きさ・文字組みは同じ、焙煎体験の見た目は今までどおり（金の塗り）", () => {
    const html = renderToStaticMarkup(<HeaderCtas pathname="/" variant="bar" />);
    expect(html.startsWith('<div class="hidden lg:flex items-center gap-2">')).toBe(true);
    const [shop, experience] = anchors(html);
    expect(shop).toContain('href="/shop"'); expect(shop).toContain(`>${headerCtaCopy.shop}</a>`);
    expect(experience).toContain('href="/experience#reservation"'); expect(experience).toContain(`>${headerCtaCopy.experience}</a>`);
    const size = "inline-block whitespace-nowrap px-3 xl:px-7 py-2.5 text-sm font-medium tracking-wide transition-all duration-300";
    expect(shop).toContain(`class="${size} bg-karekusa/90 hover:bg-karekusa text-white"`);
    expect(experience).toContain(`class="${size} bg-gold/90 hover:bg-gold text-white"`);
  });
  it("スマホのメニュー: 横幅いっぱいのボタンを2つ、焙煎体験 → オンラインショップの順で縦に並べる（どちらも押しやすい高さ）", () => {
    const html = renderToStaticMarkup(<HeaderCtas pathname="/" variant="drawer" onNavigate={() => {}} />);
    expect(html.startsWith('<div class="space-y-3">')).toBe(true);
    const [experience, shop] = anchors(html);
    expect(experience).toContain('href="/experience#reservation"'); expect(shop).toContain('href="/shop"');
    expect(experience).toContain('class="block w-full text-center bg-gold hover:bg-gold-dark text-white py-3.5 text-sm font-medium tracking-wide transition-colors"');
    expect(shop).toContain('class="block w-full text-center bg-karekusa hover:bg-karekusa-dark text-white py-3.5 text-sm font-medium tracking-wide transition-colors"');
  });
  it("横長の画面のナビは、言葉の途中で折り返さない（1024px でも1行）", () => {
    const html = renderToStaticMarkup(<Header />);
    const desktopNav = html.slice(html.indexOf('<nav class="hidden lg:flex'), html.indexOf("</nav>"));
    const items = desktopNav.match(/<(a|button)[^>]*class="relative [^"]*"/g) ?? [];
    expect(items).toHaveLength(5);
    for (const item of items) expect(item).toContain("whitespace-nowrap");
  });
  it("焙煎体験のページでは、予約ボタンは同じページの予約欄へ（今までどおり）", () => {
    for (const variant of ["bar", "drawer"] as const) {
      const html = renderToStaticMarkup(<HeaderCtas pathname="/experience" variant={variant} />);
      expect(html).toContain('href="#reservation"'); expect(html).toContain('href="/shop"');
    }
  });
});
