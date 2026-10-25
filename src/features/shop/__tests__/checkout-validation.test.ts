import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  create: vi.fn(), products: vi.fn(), stripe: vi.fn(),
}));
// 検証用モジュールだけ再開状態を模擬。本番のpolicy.tsはtrueのまま。
vi.mock("@/features/shop/policy", async importOriginal => ({
  ...await importOriginal<typeof import("../policy")>(), SHOP_PAUSED: false,
}));
vi.mock("@/features/shop/notion", () => ({ getProducts: mocks.products }));
vi.mock("@/shared/payments/stripe", () => ({ getStripe: mocks.stripe }));

import { POST } from "@/app/api/checkout/route";
const item = { id: "dummy-coffee", name: "ダミー", price: 1, quantity: 1, unit: "100g" };
afterEach(() => vi.resetAllMocks());

describe("再開を模擬しても注文数量をサーバーで検証", () => {
  it("販売休止フラグを変えても旧メール送信は再開しない", async () => {
    const route = await import("@/app/api/admin/send-gift-ticket/route");
    expect((await route.GET()).status).toBe(410);
    expect((await route.POST()).status).toBe(410);
    expect(mocks.stripe).not.toHaveBeenCalled();
  });
  it.each([0, -1, 0.5, 21, "1", null])("数量 %s は決済部品を呼ばず400", async quantity => {
    const res = await POST(new NextRequest("http://localhost/api/checkout", {
      method: "POST", body: JSON.stringify({ items: [{ ...item, quantity }] }),
    }));
    expect(res.status).toBe(400);
    expect(mocks.products).not.toHaveBeenCalled();
    expect(mocks.stripe).not.toHaveBeenCalled();
  });
  it("不正JSONも外部部品を呼ばない", async () => {
    const res = await POST(new NextRequest("http://localhost/api/checkout", { method: "POST", body: "{" }));
    expect(res.status).toBe(400);
    expect(mocks.products).not.toHaveBeenCalled();
    expect(mocks.stripe).not.toHaveBeenCalled();
  });
  it("正常な数量は偽物のCheckoutにだけ渡し、クライアント価格を採用しない", async () => {
    mocks.products.mockResolvedValue([{ id: item.id, price: 900 }]);
    mocks.create.mockResolvedValue({ url: "https://example.invalid/dummy-checkout" });
    mocks.stripe.mockReturnValue({ checkout: { sessions: { create: mocks.create } } });
    const res = await POST(new NextRequest("http://localhost/api/checkout", {
      method: "POST", body: JSON.stringify({ items: [item] }),
    }));
    expect(res.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(900);
  });
});
