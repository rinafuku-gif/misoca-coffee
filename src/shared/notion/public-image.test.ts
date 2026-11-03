import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getImageProps } from "next/image";
import { hasLocalMatch } from "next/dist/shared/lib/match-local-pattern";
import config from "../../../next.config";
const mocks = vi.hoisted(() => ({ page: vi.fn(), block: vi.fn(), fetch: vi.fn() }));
vi.mock("./client", () => ({ notion: { pages: { retrieve: mocks.page }, blocks: { retrieve: mocks.block } } }));
import { GET as query } from "@/app/api/notion-image/route";
import { GET as path } from "@/app/api/notion-image/[pageId]/route";

const root = "11111111-1111-4111-8111-111111111111", blockId = "22222222-2222-4222-8222-222222222222";
const products = "33333333-3333-4333-8333-333333333333", journal = "44444444-4444-4444-8444-444444444444";
const signed = "https://prod-files-secure.s3.us-west-2.amazonaws.com/dummy/image.png?dummy-signature=fixture";
const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
const file = (url = signed) => ({ type: "file", file: { url } });
function page(kind: "product" | "journal" = "product", status = kind === "product" ? "販売中" : "公開") {
  return { object: "page", id: root, in_trash: false, parent: { type: "data_source_id", data_source_id: kind === "product" ? products : journal }, properties: kind === "product" ? {
    EC販売ステータス: { type: "status", status: { name: status } }, 画像: { type: "files", files: [file()] },
  } : { ステータス: { type: "select", select: { name: status } }, カバー画像: { type: "files", files: [file()] } } };
}
const request = (route = `/api/notion-image/${root}`, headers?: HeadersInit) => new NextRequest("https://misoca-coffee.vercel.app" + route, { headers });
const readPath = (value = root, headers?: HeadersInit) => path(request(`/api/notion-image/${value}`, headers), { params: Promise.resolve({ pageId: value }) });
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("NOTION_API_KEY", "dummy-not-a-key"); vi.stubEnv("NOTION_DATABASE_ID", products); vi.stubEnv("NOTION_JOURNAL_DB_ID", journal);
  mocks.page.mockResolvedValue(page()); mocks.block.mockRejectedValue(new Error("DUMMY_NOT_FOUND"));
  mocks.fetch.mockImplementation(async () => new Response(png, { headers: { "content-type": "image/png" } })); vi.stubGlobal("fetch", mocks.fetch);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals();vi.restoreAllMocks(); });
describe("public Notion image boundary", () => {
  it.each(["path", "query"])("serves the live public product via %s without caching or credentials", async route => {
    const response = route === "path" ? await readPath() : await query(request(`/api/notion-image?pageId=${root}&property=${encodeURIComponent("画像")}`));
    expect(response.status).toBe(200); expect(new Uint8Array(await response.arrayBuffer())).toEqual(png);
    expect(response.headers.get("cache-control")).toBe("private, no-store"); expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
    expect(mocks.fetch).toHaveBeenCalledWith(signed, expect.objectContaining({ redirect: "error", credentials: "omit", cache: "no-store", signal: expect.any(AbortSignal) }));
    expect(mocks.page).toHaveBeenCalledTimes(2);
  });
  it("serves a public article cover from its own data source", async () => { mocks.page.mockResolvedValue(page("journal")); expect((await readPath()).status).toBe(200); });
  it.each(["下書き", "非公開", "公開 "])("rejects article status %s before remote fetch", async status => {
    mocks.page.mockResolvedValue(page("journal", status)); expect((await readPath()).status).toBe(404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects wrong source, deleted/archived/partial/mismatched pages", async () => {
    for (const value of [{ ...page(), in_trash: true }, { ...page(), in_trash: undefined }, { ...page(), archived: true }, { ...page(), is_archived: true }, { ...page(), id: blockId }, { ...page(), parent: { type: "data_source_id", data_source_id: blockId } }, { id: root }]) {
      mocks.page.mockResolvedValue(value); expect((await readPath()).status).toBe(404);
    }
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects ambiguous or missing data-source configuration", async () => {
    vi.stubEnv("NOTION_JOURNAL_DB_ID", products); expect((await readPath()).status).toBe(404);
    vi.stubEnv("NOTION_DATABASE_ID", ""); vi.stubEnv("NOTION_JOURNAL_DB_ID", ""); expect((await readPath()).status).toBe(404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects invalid IDs and arbitrary file properties before data access", async () => {
    expect((await readPath("invalid")).status).toBe(404);
    expect((await query(request(`/api/notion-image?pageId=${root}&property=private-document`))).status).toBe(404);
    expect(mocks.page).not.toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each(["https://misoca-coffee.vercel.app.attacker.invalid", "https://attacker.invalid", "null"])("rejects a misleading origin %s", async origin => {
    expect((await readPath(root, { origin })).status).toBe(403); expect(mocks.page).not.toHaveBeenCalled();
  });
  it("checks referer independently and permits a real same-origin request", async () => {
    expect((await readPath(root, { origin: "https://misoca-coffee.vercel.app", referer: "https://attacker.invalid/x" })).status).toBe(403);
    expect((await readPath(root, { referer: "https://misoca-coffee.vercel.app/shop" })).status).toBe(200);
  });
  it.each(["http://127.0.0.1/x", "https://169.254.169.254/x", "https://prod-files-secure.s3.us-west-2.amazonaws.com.attacker.invalid/x", "https://u:p@prod-files-secure.s3.us-west-2.amazonaws.com/x", "https://prod-files-secure.s3.us-west-2.amazonaws.com:8443/x", "https://s3.us-west-2.amazonaws.com/unapproved-bucket/x"])("rejects server fetch target %s", async url => {
    const value = page(); value.properties.画像!.files = [file(url)]; mocks.page.mockResolvedValue(value);
    expect((await readPath()).status).toBe(404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("does not turn an external file URL into server-fetch permission", async () => {
    const value = page(); mocks.page.mockResolvedValue({ ...value, properties: { ...value.properties, 画像: { type: "files", files: [{ type: "external", external: { url: signed } }] } } });
    expect((await readPath()).status).toBe(404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it.each(["image/svg+xml", "text/html", "application/octet-stream"])("rejects active or unknown content type %s", async type => {
    mocks.fetch.mockResolvedValue(new Response(png, { headers: { "content-type": type } })); expect((await readPath()).status).toBe(404);
  });
  it("rejects HTML masquerading as PNG, excessive declared and streamed sizes", async () => {
    mocks.fetch.mockResolvedValueOnce(new Response("<html>dummy</html>", { headers: { "content-type": "image/png" } })); expect((await readPath()).status).toBe(404);
    mocks.fetch.mockResolvedValueOnce(new Response(png, { headers: { "content-type": "image/png", "content-length": "8388609" } })); expect((await readPath()).status).toBe(404);
    mocks.fetch.mockResolvedValueOnce(new Response(new Uint8Array(8388609), { headers: { "content-type": "image/png" } })); expect((await readPath()).status).toBe(404);
  });
  it("does not forward a redirect or expose signed URLs/errors", async () => {
    mocks.fetch.mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private", "content-type": "image/png" } })); expect((await readPath()).status).toBe(404);
    mocks.fetch.mockRejectedValueOnce(new Error(signed)); const response = await readPath(); expect(response.status).toBe(404); expect(await response.text()).toBe(""); expect(response.headers.get("location")).toBeNull();
  });
  it("discards downloaded bytes if publication or the image changes during fetch", async () => {
    mocks.fetch.mockImplementationOnce(async () => { mocks.page.mockResolvedValue(page("product", "非公開")); return new Response(png, { headers: { "content-type": "image/png" } }); });
    expect((await readPath()).status).toBe(404);
  });
  it('uses EmDash publication for product images, even when Notion says 完売',async()=>{
    vi.stubEnv('MISOCA_SITE_VISIBILITY_AUTHORITY','emdash');vi.stubEnv('MISOCA_SITE_PRODUCT_CATALOG_URL','https://management.example.invalid/api/site-products/catalog');vi.stubEnv('MISOCA_SITE_CATALOG_READ_KEY','a'.repeat(64));vi.stubEnv('NOTION_DATABASE_ID','db3bf889-2b85-44cf-9cb5-0c8403d283c9');
    const value=page('product','完売');value.parent.data_source_id='db3bf889-2b85-44cf-9cb5-0c8403d283c9';mocks.page.mockResolvedValue(value);
    mocks.fetch.mockImplementation(async(input:string,init?:RequestInit)=>{if(input===signed){expect(new Headers(init?.headers).has('authorization')).toBe(false);return new Response(png,{headers:{'content-type':'image/png'}});}expect(input).toBe('https://management.example.invalid/api/site-products/catalog');expect(new Headers(init?.headers).get('authorization')).toBe('Bearer '+'a'.repeat(64));return Response.json({format:2,products:[{sourceId:root,name:'公開の豆',origin:'',farm:'',variety:'',process:'',description:''}]});});
    expect((await readPath()).status).toBe(200);expect(mocks.fetch).toHaveBeenCalledTimes(2);
  });
  it('revokes a managed image during fetch and never falls back to Notion 販売中',async()=>{
    let time=Date.now()+100000;vi.spyOn(Date,'now').mockImplementation(()=>time);
    vi.stubEnv('MISOCA_SITE_VISIBILITY_AUTHORITY','emdash');vi.stubEnv('MISOCA_SITE_PRODUCT_CATALOG_URL','https://management.example.invalid/api/site-products/catalog');vi.stubEnv('MISOCA_SITE_CATALOG_READ_KEY','a'.repeat(64));vi.stubEnv('NOTION_DATABASE_ID','db3bf889-2b85-44cf-9cb5-0c8403d283c9');
    const value=page();value.parent.data_source_id='db3bf889-2b85-44cf-9cb5-0c8403d283c9';mocks.page.mockResolvedValue(value);let visible=true;
    mocks.fetch.mockImplementation(async(input:string)=>{if(input===signed){visible=false;time+=30000;return new Response(png,{headers:{'content-type':'image/png'}});}return Response.json({format:2,products:visible?[{sourceId:root,name:'公開の豆',origin:'',farm:'',variety:'',process:'',description:''}]:[]});});
    expect((await readPath()).status).toBe(404);expect(mocks.fetch).toHaveBeenCalledTimes(3);
    mocks.fetch.mockClear();expect((await readPath()).status).toBe(404);expect(mocks.fetch).not.toHaveBeenCalled();
    time+=30000;mocks.fetch.mockResolvedValue(Response.json({private:'PRIVATE_PROVIDER_DIAGNOSTIC'},{status:503}));expect((await readPath()).status).toBe(404);
  });
  it('cannot serve managed product images with missing read credentials or the old anonymous index',async()=>{
    vi.stubEnv('MISOCA_SITE_VISIBILITY_AUTHORITY','emdash');vi.stubEnv('MISOCA_SITE_PRODUCT_INDEX_URL','https://management.example.invalid/api/site-products/index');vi.stubEnv('MISOCA_SITE_PRODUCT_CATALOG_URL','');vi.stubEnv('MISOCA_SITE_CATALOG_READ_KEY','');vi.stubEnv('NOTION_DATABASE_ID','db3bf889-2b85-44cf-9cb5-0c8403d283c9');const value=page();value.parent.data_source_id='db3bf889-2b85-44cf-9cb5-0c8403d283c9';mocks.page.mockResolvedValue(value);expect((await readPath()).status).toBe(404);expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("requires a live bounded block ancestry ending in a public article", async () => {
    mocks.page.mockImplementation(async ({ page_id }: { page_id: string }) => { if (page_id === root) return page("journal"); throw new Error("DUMMY_NOT_PAGE"); });
    mocks.block.mockResolvedValue({ object: "block", id: blockId, type: "image", in_trash: false, parent: { type: "page_id", page_id: root }, image: file() });
    expect((await readPath(blockId)).status).toBe(200);
    mocks.page.mockImplementation(async ({ page_id }: { page_id: string }) => { if (page_id === root) return page("journal", "下書き"); throw new Error("DUMMY_NOT_PAGE"); });
    mocks.fetch.mockClear(); expect((await readPath(blockId)).status).toBe(404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects cycles and deleted blocks rather than falling through to a file", async () => {
    mocks.page.mockRejectedValue(new Error("DUMMY_NOT_PAGE"));
    mocks.block.mockResolvedValue({ id: blockId, type: "image", in_trash: false, parent: { type: "block_id", block_id: blockId }, image: file() });
    expect((await readPath(blockId)).status).toBe(404); expect(mocks.block).toHaveBeenCalledTimes(1);
    mocks.block.mockResolvedValue({ id: blockId, type: "image", in_trash: true, parent: { type: "page_id", page_id: root }, image: file() });
    expect((await readPath(blockId)).status).toBe(404); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("prevents optimizer-cache bypass while retaining static image optimization", () => {
    expect(hasLocalMatch(config.images?.localPatterns, `/api/notion-image/${root}`)).toBe(false);
    expect(hasLocalMatch(config.images?.localPatterns, `/api/notion-image?pageId=${root}`)).toBe(false);
    expect(hasLocalMatch(config.images?.localPatterns, "/images/hero/hero-4.jpg")).toBe(true);
    const { props } = getImageProps({ src: `/api/notion-image/${root}`, alt: "架空", width: 10, height: 10, unoptimized: true });
    expect(props.src).toBe(`/api/notion-image/${root}`); expect(props.srcSet).toBeUndefined();
  });
});
