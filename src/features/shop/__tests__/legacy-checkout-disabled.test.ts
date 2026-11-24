import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ products: vi.fn(), stripe: vi.fn() }));
vi.mock("@/features/shop/policy", async importOriginal => ({
  ...await importOriginal<typeof import("../policy")>(), SHOP_PAUSED: false,
}));
vi.mock("@/features/shop/notion", () => ({ getProducts: mocks.products }));
vi.mock("@/shared/payments/stripe", () => ({ getStripe: mocks.stripe }));

import { LEGACY_CHECKOUT_ENABLED } from "../policy";
import { POST } from "@/app/api/checkout/route";

afterEach(() => vi.clearAllMocks());

describe("新ショップの受付設定だけで旧決済経路を再開しない", () => {
  it("旧経路は独立して無効", () => expect(LEGACY_CHECKOUT_ENABLED).toBe(false));

  it.each(["{}", "invalid-json", JSON.stringify({ items: [{ id: "dummy-coffee", quantity: 1 }] })])(
    "本文・商品データ・決済に触れず固定応答を返す: %s", async body => {
      const request = new NextRequest("http://localhost/api/checkout", { method: "POST", body });
      const read = vi.spyOn(request, "json");
      const response = await POST(request);
      expect(response.status).toBe(410);
      expect(await response.json()).toEqual({
        code: "LEGACY_CHECKOUT_DISABLED",
        error: "この注文経路は現在利用できません。ショップで受付状況をご確認ください。",
      });
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(read).not.toHaveBeenCalled();
      expect(request.bodyUsed).toBe(false);
      expect(mocks.products).not.toHaveBeenCalled();
      expect(mocks.stripe).not.toHaveBeenCalled();
    },
  );
});
