import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { CheckoutInputSchema } from "../checkout-input";
import { MAX_CHECKOUT_QUANTITY, SHOP_PAUSED } from "../policy";

const mocks = vi.hoisted(() => ({ send: vi.fn(), stripe: vi.fn(), products: vi.fn() }));
vi.mock("@/shared/email/mail", () => ({
  sendGiftTicketEmailWithBody: mocks.send, buildGiftTicketEmailBody: vi.fn(),
}));
vi.mock("@/shared/payments/stripe", () => ({ getStripe: mocks.stripe }));
vi.mock("@/features/shop/notion", () => ({ getProducts: mocks.products }));
const item = { id: "dummy-coffee", name: "ダミー豆", price: 900, quantity: 1, unit: "100g" };
afterEach(() => vi.clearAllMocks());

describe("数量の制限", () => {
  it.each([0, -1, 1.5, MAX_CHECKOUT_QUANTITY + 1, "2", null, NaN, Infinity])("不正な数量 %s を拒否", quantity => {
    expect(CheckoutInputSchema.safeParse({ items: [{ ...item, quantity }] }).success).toBe(false);
  });
  it.each([1, MAX_CHECKOUT_QUANTITY])("範囲内整数 %s を許可", quantity => {
    expect(CheckoutInputSchema.safeParse({ items: [{ ...item, quantity }] }).success).toBe(true);
  });
  it("空カート・重複商品を拒否", () => {
    expect(CheckoutInputSchema.safeParse({ items: [] }).success).toBe(false);
    expect(CheckoutInputSchema.safeParse({ items: [item, item] }).success).toBe(false);
  });
});
describe("休止中の注文", () => {
  it("共通設定は休止中", () => expect(SHOP_PAUSED).toBe(true));
  it.each([JSON.stringify({ items: [item] }), "invalid-json"])("bodyを処理せず停止し外部部品を呼ばない", async body => {
    const { POST } = await import("@/app/api/checkout/route");
    const response = await POST(new NextRequest("http://localhost/api/checkout", { method: "POST", body }));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("SHOP_PAUSED");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.stripe).not.toHaveBeenCalled();
    expect(mocks.products).not.toHaveBeenCalled();
  });
});
describe("旧ギフト送信経路は閉鎖", () => {
  it.each(["GET", "POST"] as const)("%sは固定画面だけでメールもtokenも返さない", async method => {
    const route = await import("@/app/api/admin/send-gift-ticket/route");
    const response = await route[method]();
    const html = await response.text();
    expect(response.status).toBe(410);
    expect(html).toContain("この画面からはメールを送信できません");
    expect(html).not.toMatch(/<form|<script|name="token"|textarea|session_id/i);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-security-policy")).toContain("form-action 'none'");
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.stripe).not.toHaveBeenCalled();
  });
});
