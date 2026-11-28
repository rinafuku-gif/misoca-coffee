import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const place = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => place.pathname }));
vi.mock("@next/third-parties/google", () => ({ GoogleAnalytics: ({ gaId }: { gaId: string }) => <i data-ga={gaId} /> }));
vi.mock("@vercel/analytics/react", () => ({ Analytics: ({ beforeSend }: { beforeSend?: unknown }) => <i data-visits={typeof beforeSend} /> }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: ({ beforeSend }: { beforeSend?: unknown }) => <i data-speed={typeof beforeSend} /> }));

import { SiteMeasurement, dropUnmeasured, isUnmeasuredPath } from "../SiteMeasurement";

const at = (pathname: string, gaId?: string) => {
  place.pathname = pathname;
  return renderToStaticMarkup(<SiteMeasurement gaId={gaId} />);
};

describe("購入のページと注文状況のページは計測しない", () => {
  beforeEach(() => { place.pathname = "/"; });

  it.each(["/shop/order", "/shop/success", "/shop/order/", "/shop/success/anything", "/shop/order-cancel"])("%s では計測の部品を1つも出さない", pathname => {
    expect(isUnmeasuredPath(pathname)).toBe(true);
    expect(at(pathname, "G-TEST")).toBe("");
  });

  it.each(["/", "/shop", "/shop/orders", "/shop/gift-ticket", "/shop/uenohara-yuzu", "/contact", "/tokushoho"])("%s では今までどおり3つとも出す", pathname => {
    expect(isUnmeasuredPath(pathname)).toBe(false);
    const html = at(pathname, "G-TEST");
    expect(html).toContain('data-ga="G-TEST"');
    expect(html).toContain('data-visits="function"');
    expect(html).toContain('data-speed="function"');
  });

  it("計測IDが無いときは、今までどおりGoogleの部品だけ出さない", () => {
    const html = at("/");
    expect(html).not.toContain("data-ga");
    expect(html).toContain("data-visits");
    expect(html).toContain("data-speed");
  });

  it("読み込み済みの計測が、購入のページへ移った後の記録を送らない", () => {
    const origin = "https://misoca-coffee.vercel.app";
    for (const url of [`${origin}/shop/order`, `${origin}/shop/success?x=1`, "/shop/order", "http://[bad"]) {
      expect(dropUnmeasured({ url })).toBeNull();
    }
    const kept = { url: `${origin}/shop`, type: "pageview" };
    expect(dropUnmeasured(kept)).toBe(kept);
  });

  it("共通の枠は計測の部品を直接は置かず、この部品だけを通す", () => {
    const layout = readFileSync(resolve("src/app/layout.tsx"), "utf8");
    expect(layout).toContain("<SiteMeasurement gaId={gaId} />");
    for (const direct of ["@next/third-parties/google", "@vercel/analytics", "@vercel/speed-insights", "<Analytics", "<SpeedInsights", "<GoogleAnalytics"]) {
      expect(layout).not.toContain(direct);
    }
  });
});

/** Google's script has no "drop before sending" hook, so the guarantee for all
 * three scripts is structural: a measured page and an unmeasured page are
 * never shown by the same loaded document. Every way across is a full load. */
describe("計測するページと計測しないページの行き来は、ページの読み込み直しだけ", () => {
  const read = (path: string) => readFileSync(resolve(path), "utf8");
  const walk = (dir: string): string[] => readdirSync(resolve(dir), { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? (entry.name === "__tests__" ? [] : walk(path)) : /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
  const components = "src/features/shop/components";
  // Everything the two pages render (their imports, followed by hand).
  const insideOnly = ["PurchaseBrand.tsx", "PurchaserStatusPanel.tsx", "CheckoutCancellationPanel.tsx", "PurchaseTerms.tsx", "ProductPublicationDetails.tsx", "UnlistedCartItems.tsx",
    // 2026-11-26: the purchase screen's cards, detail and cart (and their shared parts).
    "BeanCard.tsx", "BeanDetailModal.tsx", "CartDrawer.tsx", "shop-catalog-parts.tsx", "ProductCardDetails.tsx",
    // 2026-11-27: the compact checkout section and the pending-payment banner.
    "CheckoutParts.tsx",
    // 2026-11-27: the purchase form (購入者・お届け先・送り主・備考・メルマガ).
    "CheckoutForm.tsx", "RoastPreferenceFields.tsx",
    // 2026-11-27 (4c): the status page's cancel request.
    "StatusCancel.tsx",
    // 2026-11-28: the pickup guide's Instagram link (plain <a>, new tab) and the steps after a cancel request.
    "PickupGuideText.tsx", "CancelFlow.tsx"].map(name => join(components, name));

  it("2つのページが使う部品は、この一覧のとおり（増えたらこの試験を見直す）", () => {
    expect(read("src/app/shop/order/page.tsx")).toContain('from "@/features/shop/components/PurchasePanel"');
    expect(read("src/app/shop/success/page.tsx")).toContain('from "@/features/shop/components/PurchaserStatusPanel"');
    const imported = (file: string) => [...read(join(components, file)).matchAll(/from "\.\/([A-Za-z]+)"/g)].map(match => match[1]).filter(name => /^[A-Z]/.test(name)).sort();
    expect(imported("PurchasePanel.tsx")).toEqual(["BeanCard", "BeanDetailModal", "CartDrawer", "CheckoutForm", "CheckoutParts", "PurchaseBrand", "PurchaseTerms", "RoastPreferenceFields", "UnlistedCartItems"]);
    // Lower-case modules are not caught by the pattern above; list them by hand.
    expect([...read(join(components, "PurchasePanel.tsx")).matchAll(/from "\.\/([a-z][a-z-]*)"/g)].map(match => match[1]).sort()).toEqual(["shop-catalog-parts", "use-page-top"]);
    expect([...read(join(components, "PurchaserStatusPanel.tsx")).matchAll(/from "\.\/([a-z][a-z-]*)"/g)].map(match => match[1])).toEqual(["use-page-top"]);
    expect(read(join(components, "use-page-top.ts"))).not.toMatch(/next\/(link|navigation)|<Link/);
    expect(imported("PurchaserStatusPanel.tsx")).toEqual(["PickupGuideText", "PurchaseBrand", "PurchaseTerms", "StatusCancel"]);
    expect(read(join(components, "ProductCardDetails.tsx"))).not.toMatch(/next\/(link|navigation)|<Link|<a\b/);
    const known = new Set(insideOnly.map(path => path.slice(components.length + 1, -".tsx".length)));
    for (const path of insideOnly) for (const name of imported(path.slice(components.length + 1))) expect(known.has(name), `${path} → ${name}`).toBe(true);
  });

  it("計測するページから2つのページへ、読み込み直しなしで入る道が無い", () => {
    const sources = walk("src");
    expect(sources.length).toBeGreaterThan(100);
    const soft = sources.filter(path => /<Link\b[^>]*\/shop\/(order|success)/.test(read(path)));
    // 2026-11-27: the status page now leaves only by plain anchors, so no soft link remains.
    expect(soft).toEqual([]);
    const scripted = sources.filter(path => /\b(push|replace|prefetch|redirect|permanentRedirect)\(\s*[`'"][^`'"]*\/shop\/(order|success)/.test(read(path)));
    expect(scripted).toEqual([]);
    // The patterns above cannot see a renamed import or an address built from
    // variables. So the files that both name one of the two pages and are able
    // to move within the app are listed: a new one must be read by a person.
    const able = sources.filter(path => { const source = read(path); return /\/shop\/(order|success)/.test(source) && /from "next\/(link|navigation)"/.test(source); });
    expect(able.sort()).toEqual([
      join(components, "PurchasePanel.tsx"),          // leaves by location.assign / <a>; its one Link is pinned below
      "src/shared/ui/Header.tsx",                     // a list of light-background pages, no link
      "src/shared/ui/SiteMeasurement.tsx",            // the exclusion itself
      "src/shared/ui/SiteShell.tsx",                  // chooses the page frame, no link
    ]);
    // SiteShell also names /shop/order-cancel (2026-11-27: the cancel-request page has no site frame either).
    expect((read("src/shared/ui/Header.tsx").match(/\/shop\/(order|success)/g) ?? []).length).toBeLessThanOrEqual(2);
    expect((read("src/shared/ui/SiteShell.tsx").match(/\/shop\/(order|success)/g) ?? []).length).toBeLessThanOrEqual(3);
  });

  it("2つのページから外へ出るリンクは、読み込み直しになる書き方だけ", () => {
    for (const path of insideOnly) {
      const source = read(path);
      expect(source, path).not.toMatch(/useRouter|next\/navigation/);
      expect(source, path).not.toMatch(/<Link\b[^>]*href=\{/);
      for (const [, target] of source.matchAll(/<Link\b[^>]*href="([^"]*)"/g)) expect(isUnmeasuredPath(target), `${path} → ${target}`).toBe(true);
    }
    expect(read(join(components, "PurchaseBrand.tsx"))).not.toContain("next/link");
    // PurchasePanel is also the reopened /shop page (shopRoot), a measured page:
    // its single in-app link exists only there and stays among measured pages.
    const panel = read(join(components, "PurchasePanel.tsx"));
    expect(panel).not.toMatch(/useRouter|next\/navigation/);
    expect(panel.match(/<Link\b/g)).toHaveLength(1);
    expect(panel).toContain('{shopRoot ? <Link href="/" ');
    expect(panel).toContain(': <a href="/shop" ');
  });
});
