import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ products: vi.fn() }));
vi.mock("@/features/shop/notion", () => ({ getProducts: mocks.products }));
import { GET } from "@/app/api/products/route";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("本物の商品と取得不能を区別", () => {
  it("接続未設定は空商品ではなく503、外部アクセスなし", async () => {
    vi.stubEnv("NOTION_API_KEY", ""); vi.stubEnv("NOTION_DATABASE_ID", "");
    const r = await GET(new Request('https://misoca-coffee.vercel.app/api/products')); expect(r.status).toBe(503); expect(mocks.products).not.toHaveBeenCalled();
  });
  it("正常な空一覧は200で返す", async () => {
    vi.stubEnv("NOTION_API_KEY", "dummy"); vi.stubEnv("NOTION_DATABASE_ID", "dummy");
    mocks.products.mockResolvedValue([]); const r = await GET(new Request('https://misoca-coffee.vercel.app/api/products')); expect(r.status).toBe(200); expect(await r.json()).toEqual([]);expect(r.headers.get('vercel-cdn-cache-control')).toBeNull();
  });
});
