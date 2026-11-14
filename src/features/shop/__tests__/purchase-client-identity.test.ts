import { describe, expect, it } from "vitest";
import { createVercelPurchaseClientIdentity } from "../ledger/purchase-client-identity";
describe("購入の負荷制御だけに使う端末のヒント", () => {
  it("同じ日の同じIPだけ同じHMACとなり、日と鍵を変えると変わる", () => {
    const request = new Request("https://example.invalid", { headers: { "x-forwarded-for": "192.0.2.1" } });
    const first = createVercelPurchaseClientIdentity("a".repeat(64), () => 0)(request);
    expect(first).toMatch(/^[a-f0-9]{64}$/); expect(first).not.toContain("192.0.2.1");
    expect(createVercelPurchaseClientIdentity("a".repeat(64), () => 100)(request)).toBe(first);
    expect(createVercelPurchaseClientIdentity("a".repeat(64), () => 86400000)(request)).not.toBe(first);
    expect(createVercelPurchaseClientIdentity("b".repeat(64), () => 0)(request)).not.toBe(first);
  });
  it.each([undefined, "unknown", "192.0.2.1, 198.51.100.1", "192.0.2.1:123"])("不明なIPや別proxyの列を推測で採用しない %s", ip => {
    const request = new Request("https://example.invalid", { headers: ip ? { "x-forwarded-for": ip } : {} });
    expect(() => createVercelPurchaseClientIdentity("a".repeat(64))(request)).toThrow("PURCHASE_CLIENT_UNAVAILABLE");
  });
});
