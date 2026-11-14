import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { create, Constructor } = vi.hoisted(() => ({ create: vi.fn(), Constructor: vi.fn(function () { return { pages: { create } }; }) }));
vi.mock("@notionhq/client", () => ({ Client: Constructor }));
import { POST } from "../../../app/api/contact/route";
const id = "11111111-1111-4111-8111-111111111111";
const input = { attemptId: id, type: "その他", name: "架空のお客様", email: "dummy@example.invalid", phone: "", message: "架空の問い合わせ" };
const req = () => new Request("https://example.invalid/api/contact", { method: "POST", headers: { origin: "https://example.invalid", host: "example.invalid", "content-type": "application/json" }, body: JSON.stringify(input) });
function configure() {
  vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://example.invalid");
  vi.stubEnv("NOTION_API_KEY", "DUMMY_NOT_A_KEY"); vi.stubEnv("NOTION_CONTACT_DB_ID", id); vi.stubEnv("GAS_WEBHOOK_URL", "");
  create.mockResolvedValue({ object: "page", id, archived: false, in_trash: false });
}
// These tests cover the database path; mail settings on the machine must not switch the route.
beforeEach(() => { vi.stubEnv("GMAIL_USER", ""); vi.stubEnv("GMAIL_APP_PASSWORD", ""); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });
it("保存設定がないなら外部部品を作らず成功を返さない", async () => {
  vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://example.invalid");
  vi.stubEnv("NOTION_API_KEY", ""); vi.stubEnv("NOTION_CONTACT_DB_ID", ""); vi.stubEnv("GAS_WEBHOOK_URL", "https://script.google.com/macros/s/DUMMY/exec"); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  expect((await POST(req())).status).toBe(503); expect(Constructor).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
});
it.each([id, id.replaceAll("-", "")])("自動retryを止め、既存の番号表記を保ち受付番号を保存本文へ含める %s", async databaseId => {
  configure(); vi.stubEnv("NOTION_CONTACT_DB_ID", databaseId); const response = await POST(req()); expect(await response.json()).toMatchObject({ state: "stored", attemptId: id });
  expect(create.mock.calls[0][0].parent.database_id).toBe(databaseId);
  expect(Constructor).toHaveBeenCalledWith(expect.objectContaining({ retry: false, timeoutMs: 8000 }));
  expect(JSON.stringify(create.mock.calls[0][0].children)).toContain(id); expect(create).toHaveBeenCalledTimes(1);
});
it.each([{}, { object: "page", id: "invalid" }, { object: "page", id, in_trash: true }])("保存の応答が不正なら受付済みとしない %j", async value => {
  configure(); create.mockResolvedValue(value); expect(await (await POST(req())).json()).toMatchObject({ state: "unknown", error: "SAVE_UNCONFIRMED" }); expect(create).toHaveBeenCalledTimes(1);
});
it("任意の通知先へ個人情報を渡さない", async () => {
  configure(); vi.stubEnv("GAS_WEBHOOK_URL", "https://other.invalid/collect"); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  expect(await (await POST(req())).json()).toMatchObject({ state: "stored", notification: "not_configured" }); expect(fetcher).not.toHaveBeenCalled();
});
it("通知のHTTP成功だけでメール到着を保証しない", async () => {
  configure(); vi.stubEnv("GAS_WEBHOOK_URL", "https://script.google.com/macros/s/DUMMY/exec"); const fetcher = vi.fn().mockResolvedValue(new Response('{"success":false}', { status: 200 })); vi.stubGlobal("fetch", fetcher);
  expect(await (await POST(req())).json()).toMatchObject({ state: "stored", notification: "unconfirmed" });
  expect(fetcher).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ redirect: "error", signal: expect.any(AbortSignal) })); expect(fetcher).toHaveBeenCalledTimes(1);
});
