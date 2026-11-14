import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { sendMail, createTransport, Notion } = vi.hoisted(() => {
  const sendMail = vi.fn();
  return { sendMail, createTransport: vi.fn(() => ({ sendMail })), Notion: vi.fn() };
});
vi.mock("nodemailer", () => ({ default: { createTransport } }));
vi.mock("@notionhq/client", () => ({ Client: Notion }));
import { POST } from "../../../app/api/contact/route";
import { shopMailBudget } from "../mail-budget";
import { shopInbox } from "../shop-mail";

const id = "22222222-2222-4222-8222-222222222222";
const input = { attemptId: id, type: "その他", name: "架空のお客様", email: "dummy@example.invalid", phone: "", message: "架空の問い合わせ" };
const req = (visitor = "203.0.113.1", body: unknown = input, origin = "https://example.invalid") => new Request("https://example.invalid/api/contact", { method: "POST", headers: { origin, host: "example.invalid", "content-type": "application/json", "x-real-ip": visitor }, body: JSON.stringify(body) });
function mailOnly() {
  vi.stubEnv("CONTACT_ALLOWED_ORIGINS", "https://example.invalid");
  vi.stubEnv("NOTION_API_KEY", ""); vi.stubEnv("NOTION_CONTACT_DB_ID", ""); vi.stubEnv("GAS_WEBHOOK_URL", "");
  vi.stubEnv("GMAIL_USER", "sender@example.invalid"); vi.stubEnv("GMAIL_APP_PASSWORD", "DUMMY_NOT_A_PASSWORD");
  sendMail.mockResolvedValue({ accepted: [shopInbox], rejected: [] });
}
beforeEach(() => shopMailBudget.reset());
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); vi.useRealTimers(); });

it("保存先のDBが無くメールの設定があるとき、店の受信箱へ1通だけ送って受付済みを返す", async () => {
  mailOnly(); vi.stubEnv("GAS_WEBHOOK_URL", "https://script.google.com/macros/s/DUMMY/exec"); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  const response = await POST(req());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ state: "stored", attemptId: id, notification: "provider_acknowledged" });
  expect(sendMail).toHaveBeenCalledTimes(1);
  const mail = sendMail.mock.calls[0][0];
  expect(mail.to).toBe(shopInbox);
  expect(mail.replyTo).toBe(input.email);
  expect(mail.subject).toBe("【お問い合わせ】その他");
  expect(mail.text).toContain(input.name); expect(mail.text).toContain(input.message); expect(mail.text).toContain(id);
  // The mail is the notice: neither the database nor the webhook is used.
  expect(Notion).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
});
it("DBの鍵だけがあり保存先の番号が無いときも、メールで届ける", async () => {
  mailOnly(); vi.stubEnv("NOTION_API_KEY", "DUMMY_NOT_A_KEY");
  expect(await (await POST(req())).json()).toMatchObject({ state: "stored" });
  expect(sendMail).toHaveBeenCalledTimes(1); expect(Notion).not.toHaveBeenCalled();
});
it("メールの送信が失敗したら受付済みとしない", async () => {
  mailOnly(); sendMail.mockRejectedValue(new Error("架空の失敗"));
  const response = await POST(req());
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ state: "unknown", error: "SAVE_UNCONFIRMED", attemptId: id });
  expect(sendMail).toHaveBeenCalledTimes(1);
});
it.each([{ accepted: [], rejected: [] }, { accepted: [shopInbox], rejected: ["other@example.invalid"] }, { accepted: ["other@example.invalid"], rejected: [] }, {}])("店の受信箱が受け取ったと確かめられない応答は受付済みとしない %j", async result => {
  mailOnly(); sendMail.mockResolvedValue(result);
  expect(await (await POST(req())).json()).toMatchObject({ state: "unknown", error: "SAVE_UNCONFIRMED" });
});
it("送信が8秒たっても終わらないときは、受付済みとせずに返す", async () => {
  mailOnly(); vi.useFakeTimers(); sendMail.mockReturnValue(new Promise(() => {}));
  const pending = POST(req());
  await vi.advanceTimersByTimeAsync(8000);
  const response = await pending;
  expect(response.status).toBe(503); expect(await response.json()).toMatchObject({ state: "unknown", error: "SAVE_UNCONFIRMED" });
});
it("同じ訪問者の4通目は送らず、送っていないと返す。別の訪問者は送れる", async () => {
  mailOnly();
  for (let n = 0; n < 3; n++) expect((await POST(req())).status).toBe(200);
  const response = await POST(req());
  expect(response.status).toBe(503); expect(await response.json()).toEqual({ state: "unavailable", error: "INTAKE_NOT_CONFIGURED" });
  expect(sendMail).toHaveBeenCalledTimes(3);
  expect((await POST(req("203.0.113.2"))).status).toBe(200);
});
it("全体で1時間に20通を超える分は送らない", async () => {
  mailOnly();
  for (let n = 0; n < 20; n++) expect((await POST(req(`198.51.100.${n}`))).status).toBe(200);
  const response = await POST(req("198.51.100.200"));
  expect(response.status).toBe(503); expect(await response.json()).toEqual({ state: "unavailable", error: "INTAKE_NOT_CONFIGURED" });
  expect(sendMail).toHaveBeenCalledTimes(20);
});
it("別の出所からの送信では、メールを送らず、送信数も使わない", async () => {
  mailOnly();
  for (let n = 0; n < 5; n++) expect((await POST(req("203.0.113.1", input, "https://other.invalid"))).status).toBe(403);
  expect(createTransport).not.toHaveBeenCalled(); expect(sendMail).not.toHaveBeenCalled();
  expect((await POST(req())).status).toBe(200);
});
it("入力が不正なら、メールを送らず、送信数も使わない", async () => {
  mailOnly();
  for (let n = 0; n < 5; n++) expect((await POST(req("203.0.113.1", { ...input, email: "not-an-address" }))).status).toBe(400);
  expect(sendMail).not.toHaveBeenCalled();
  expect((await POST(req())).status).toBe(200);
});
it("問い合わせのDBが設定されているときは、メールではなくDBへ保存する", async () => {
  mailOnly(); vi.stubEnv("NOTION_API_KEY", "DUMMY_NOT_A_KEY"); vi.stubEnv("NOTION_CONTACT_DB_ID", id);
  const create = vi.fn().mockResolvedValue({ object: "page", id, archived: false, in_trash: false });
  Notion.mockImplementation(function () { return { pages: { create } }; });
  expect(await (await POST(req())).json()).toMatchObject({ state: "stored", notification: "not_configured" });
  expect(create).toHaveBeenCalledTimes(1); expect(sendMail).not.toHaveBeenCalled();
});
it("メールの設定も無いときは、受付できないと返す", async () => {
  mailOnly(); vi.stubEnv("GMAIL_APP_PASSWORD", "");
  const response = await POST(req());
  expect(response.status).toBe(503); expect(await response.json()).toEqual({ state: "unavailable", error: "INTAKE_NOT_CONFIGURED" });
  expect(sendMail).not.toHaveBeenCalled();
});
