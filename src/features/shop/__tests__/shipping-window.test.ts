import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SHOP_PAUSED } from "../policy";

describe("confirmed shipping window without reopening checkout", () => {
  it.each(["src/app/terms/page.tsx", "src/app/tokushoho/page.tsx", "src/app/shop/page.tsx", "src/app/shop/success/page.tsx", "content/pages/faq.json"])("uses seven days for shipping in %s", path => {
    const source = readFileSync(resolve(path), "utf8");
    expect(source).toContain("7日以内に発送");
    expect(source).not.toContain("3日以内に発送");
  });
  it("keeps shopping paused and shipping charges unchanged", () => {
    expect(SHOP_PAUSED).toBe(true);
    const source = readFileSync(resolve("src/app/tokushoho/page.tsx"), "utf8");
    expect(source).toContain("全国一律 ¥370（¥5,000以上で送料無料）");
  });
});
