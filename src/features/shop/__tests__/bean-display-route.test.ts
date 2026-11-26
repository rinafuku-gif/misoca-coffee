import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/shared/notion/client", async importOriginal => ({
  ...await importOriginal<typeof import("@/shared/notion/client")>(),
  notion: { dataSources: { query: mocks.query } },
}));
import { BEAN_DISPLAY_REUSE_MS, createBeanDisplayReader, readSellingBeanDisplays } from "../bean-display-server";

const fixed = "db3bf889-2b85-44cf-9cb5-0c8403d283c9";
const pageA = "11111111-1111-4111-8111-111111111111", pageB = "22222222-2222-4222-8222-222222222222";
const rich = (text: string) => ({ type: "rich_text", rich_text: text ? [{ plain_text: text }] : [] });
function page(id: string, over: { status?: string; image?: unknown; parent?: string; extra?: object } = {}) {
  return {
    object: "page", id, in_trash: false, archived: false,
    parent: { type: "data_source_id", data_source_id: over.parent ?? fixed },
    properties: {
      名前: { type: "title", title: [{ plain_text: "架空の豆" }] }, エリア: { type: "select", select: { name: "架空産地" } },
      焙煎度合: { type: "multi_select", multi_select: [{ name: "中煎り" }, { name: "深煎り" }] }, フレーバー: rich("架空の風味"),
      生産処理: { type: "select", select: { name: "架空精製" } }, 品種: { type: "multi_select", multi_select: [{ name: "架空品種" }] },
      地域: rich("架空地域"), "農園・WS": rich("架空農園"), 標高: rich("1,000m"), コメント: rich(""), テキスト: rich("架空の説明"),
      "100g豆売売価": { type: "number", number: 900 }, 原価: { type: "number", number: 123 }, 仕入先メール: rich("private@example.invalid"),
      EC販売ステータス: { type: "status", status: { name: over.status ?? "販売中" } },
      画像: over.image ?? { type: "files", files: [{ type: "file", file: { url: "https://prod-files-secure.s3.us-west-2.amazonaws.com/x.png?sig=secret" } }] },
      ...over.extra,
    },
  };
}
beforeEach(() => {
  vi.stubEnv("NOTION_API_KEY", "dummy-not-a-key"); vi.stubEnv("NOTION_DATABASE_ID", fixed); vi.stubEnv("MISOCA_SITE_VISIBILITY_AUTHORITY", "emdash");
  mocks.query.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); vi.resetModules(); });

describe("販売中の豆の表示データ（読み取りのみ）", () => {
  it("販売中のページだけを、表示の項目だけで返す（値段・原価・連絡先・署名付きURLは出さない）", async () => {
    mocks.query.mockResolvedValue({ object: "list", results: [
      page(pageA),
      page(pageB, { image: { type: "files", files: [{ type: "external", external: { url: "https://drive.example.invalid/x.jpg" } }] } }),
      page("33333333-3333-4333-8333-333333333333", { status: "完売" }),
      page("44444444-4444-4444-8444-444444444444", { parent: "55555555-5555-4555-8555-555555555555" }),
      { ...page("66666666-6666-4666-8666-666666666666"), in_trash: true },
      page(pageA),
    ] });
    const items = await readSellingBeanDisplays();
    expect(items).toEqual([
      { id: pageA.replaceAll("-", ""), name: "架空の豆", origin: "架空産地", roast: "中煎り・深煎り", flavor: "架空の風味", process: "架空精製", variety: "架空品種", region: "架空地域", farm: "架空農園", altitude: "1,000m", description: "架空の説明", image: `/api/notion-image/${pageA.replaceAll("-", "")}` },
      expect.objectContaining({ id: pageB.replaceAll("-", ""), image: "" }),
    ]);
    const json = JSON.stringify(items);
    for (const secret of ["900", "123", "private@", "sig=secret", "drive.example"]) expect(json).not.toContain(secret);
    expect(mocks.query).toHaveBeenCalledWith(expect.objectContaining({ data_source_id: fixed.replaceAll("-", ""), page_size: 100, filter: { property: "EC販売ステータス", status: { equals: "販売中" } } }));
  });
  it.each([
    ["鍵が無い", { NOTION_API_KEY: "" }],
    ["EmDashで決まった元以外", { NOTION_DATABASE_ID: pageA }],
    ["不明な設定", { MISOCA_SITE_VISIBILITY_AUTHORITY: "other" }],
    ["IDが不正", { NOTION_DATABASE_ID: "not-an-id" }],
  ])("%sなら読まない", async (_label, env) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    await expect(readSellingBeanDisplays()).rejects.toThrow("BEAN_DISPLAY_UNAVAILABLE");
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it("応答が来ないときは8秒で打ち切る", async () => {
    vi.useFakeTimers(); mocks.query.mockReturnValue(new Promise(() => {}));
    const pending = readSellingBeanDisplays(); const outcome = expect(pending).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(8000); await outcome;
  });
  it("成功は1分だけ使い回し、失敗は残さない", async () => {
    let now = 1_000_000; const read = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue([]);
    const cached = createBeanDisplayReader(read, () => now);
    await expect(cached()).rejects.toThrow(); await cached(); await cached();
    expect(read).toHaveBeenCalledTimes(2);
    now += BEAN_DISPLAY_REUSE_MS; await cached(); expect(read).toHaveBeenCalledTimes(3);
  });
  it("経路は短い共有キャッシュで返し、失敗はキャッシュしない", async () => {
    mocks.query.mockResolvedValue({ object: "list", results: [page(pageA)] });
    const { GET } = await import("@/app/api/shop/bean-display/route");
    const ok = await GET();
    expect(ok.status).toBe(200); expect(ok.headers.get("cache-control")).toBe("public, max-age=60, s-maxage=60");
    expect((await ok.json()).items).toHaveLength(1);
    vi.resetModules(); vi.stubEnv("NOTION_API_KEY", "");
    const { GET: again } = await import("@/app/api/shop/bean-display/route");
    const failed = await again();
    expect(failed.status).toBe(503); expect(failed.headers.get("cache-control")).toBe("no-store");
    expect(await failed.text()).not.toMatch(/notion|key|secret/i);
  });
});
