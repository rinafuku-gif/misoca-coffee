import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ retrieve: vi.fn(), query: vi.fn(), blocks: vi.fn() }));
vi.mock("@/shared/notion/client", async (original) => ({
  ...await original<typeof import("@/shared/notion/client")>(),
  notion: { pages: { retrieve: mocks.retrieve }, dataSources: { query: mocks.query }, blocks: { children: { list: mocks.blocks } } },
}));
import { getJournalPostById, getJournalPosts, getPageBlocks } from "./notion";
import { GET } from "@/app/api/journal/route";
import BlogPostPage, { generateMetadata } from "@/app/blog/[id]/page";

const id = "11111111-1111-4111-8111-111111111111";
const source = "22222222-2222-4222-8222-222222222222";
function page(status = "公開") {
  return { object: "page", id, in_trash: false, archived: false, parent: { type: "data_source_id", data_source_id: source }, properties: {
    タイトル: { type: "title", title: [{ plain_text: "架空の公開記事" }] },
    ステータス: { type: "select", select: { name: status } },
  } };
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("NOTION_API_KEY", "dummy-not-a-key"); vi.stubEnv("NOTION_JOURNAL_DB_ID", source);
  mocks.retrieve.mockResolvedValue(page()); mocks.query.mockResolvedValue({ results: [page()] });
  mocks.blocks.mockResolvedValue({ results: [{ id: "dummy-block", in_trash: false, type: "paragraph" }], has_more: false });
});
afterEach(() => vi.unstubAllEnvs());

describe("public journal publication boundary", () => {
  it("allows a public page only from the configured data source", async () => {
    expect(await getJournalPostById(id)).toMatchObject({ id, status: "公開" });
    vi.stubEnv("NOTION_JOURNAL_DB_ID", source.replace(/-/g, "").toUpperCase());
    expect(await getJournalPostById(id.replace(/-/g, ""))).not.toBeNull();
  });
  it.each(["下書き", "非公開", "公開 ", "", "確認中"])("rejects status %s without retrieving content", async status => {
    mocks.retrieve.mockResolvedValue(page(status));
    expect(await getJournalPostById(id)).toBeNull();
    expect(await getPageBlocks(id)).toEqual([]); expect(mocks.blocks).not.toHaveBeenCalled();
  });
  it("rejects other sources, missing trash state, deleted and partial pages", async () => {
    for (const value of [
      { ...page(), parent: { type: "data_source_id", data_source_id: id } },
      { ...page(), parent: { type: "database_id", database_id: source } },
      { ...page(), in_trash: undefined }, { ...page(), in_trash: true },
      { ...page(), archived: true }, { ...page(), is_archived: true },
      { object: "page", id }, { ...page(), id: source },
    ]) { mocks.retrieve.mockResolvedValue(value); expect(await getJournalPostById(id)).toBeNull(); }
  });
  it("does not call Notion when configuration or requested ID is invalid", async () => {
    expect(await getJournalPostById("not-an-id")).toBeNull();
    vi.stubEnv("NOTION_JOURNAL_DB_ID", ""); expect(await getJournalPostById(id)).toBeNull();
    await expect(getJournalPosts()).rejects.toThrow("JOURNAL_UNAVAILABLE");
    expect(mocks.retrieve).not.toHaveBeenCalled(); expect(mocks.query).not.toHaveBeenCalled();
  });
  it("rechecks query rows rather than trusting the query filter alone", async () => {
    mocks.query.mockResolvedValue({ results: [page("下書き"), { ...page(), in_trash: true }, page()] });
    expect(await getJournalPosts()).toHaveLength(1);
    expect(mocks.query).toHaveBeenCalledWith(expect.objectContaining({ data_source_id: source.replace(/-/g, ""), filter: { property: "ステータス", select: { equals: "公開" } } }));
  });
  it("returns only live blocks of an approved public page", async () => {
    mocks.blocks.mockResolvedValue({ results: [{ id: "live", in_trash: false }, { id: "deleted", in_trash: true }], has_more: false });
    expect(await getPageBlocks(id)).toEqual([{ id: "live", in_trash: false }]);
  });
  it("discards accumulated content if publication is withdrawn during retrieval", async () => {
    mocks.blocks.mockImplementation(async () => {
      mocks.retrieve.mockResolvedValue(page("下書き"));
      return { results: [{ id: "never-return-this", in_trash: false }], has_more: false };
    });
    expect(await getPageBlocks(id)).toEqual([]);
  });
  it("never fetches a draft body and returns a non-indexable missing page", async () => {
    mocks.retrieve.mockResolvedValue(page("下書き"));
    const props = { params: Promise.resolve({ id }) };
    expect(await generateMetadata(props)).toMatchObject({ robots: { index: false, follow: false } });
    await expect(BlogPostPage(props)).rejects.toThrow(); expect(mocks.blocks).not.toHaveBeenCalled();
  });
  it("returns no-store data and fixed unavailability without exception details", async () => {
    const response = await GET(); expect(response.headers.get("cache-control")).toBe("private, no-store");
    mocks.query.mockRejectedValue(new Error("DUMMY_INTERNAL_DETAIL"));
    const failed = await GET(); expect(failed.status).toBe(503);
    expect(await failed.text()).not.toContain("DUMMY_INTERNAL_DETAIL");
    expect(failed.headers.get("cache-control")).toBe("private, no-store");
  });
});
