import { afterEach, describe, expect, it, vi } from "vitest";
import { createContactHandler } from "../handler";
const origin = "https://example.invalid";
const input = { attemptId: "11111111-1111-4111-8111-111111111111", type: "その他", name: "架空のお客様", email: "dummy@example.invalid", phone: "", message: "架空の問い合わせ" };
const req = (body: unknown = input, headers: Record<string, string> = {}) => new Request(origin + "/api/contact", { method: "POST", headers: { origin, host: "example.invalid", "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const post = (options: Omit<Parameters<typeof createContactHandler>[0], "allowedOrigins"> = {}) => createContactHandler({ allowedOrigins: [origin], ...options });
afterEach(() => vi.restoreAllMocks());
describe("問い合わせの保存と通知を分ける受付", () => {
  it("保存先がなければ成功にも通知だけにもならない", async () => {
    const notify = vi.fn(); const response = await post({ notify })(req());
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ state: "unavailable", error: "INTAKE_NOT_CONFIGURED" }); expect(notify).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it.each([null, {}, { ...input, name: " " }, { ...input, email: "invalid" }, { ...input, message: "x".repeat(2001) }, { ...input, type: "不明" }, { ...input, recipient: "other@example.invalid" }, { ...input, attemptId: "invalid" }])("不正な内容を保存も通知もしない %j", async value => {
    const save = vi.fn(), notify = vi.fn(); const response = await post({ save, notify })(req(value));
    expect(response.status).toBe(400); expect(save).not.toHaveBeenCalled(); expect(notify).not.toHaveBeenCalled();
  });
  it.each<Record<string, string>>([{ origin: "https://other.invalid" }, { "sec-fetch-site": "cross-site" }, { "sec-fetch-site": "same-site" }])("別の画面からの送信は拒否 %j", async headers => {
    const save = vi.fn(); expect((await post({ save })(req(input, headers))).status).toBe(403); expect(save).not.toHaveBeenCalled();
  });
  it("実際の宛先と送信元が一致する場合は内部URLの差で拒否しない", async () => {
    const save = vi.fn();
    const request = new Request("http://internal.invalid/api/contact", { method: "POST", headers: { origin, host: "example.invalid", "content-type": "application/json", "sec-fetch-site": "same-origin" }, body: JSON.stringify(input) });
    expect((await post({ save })(request)).status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });
  it.each<Record<string, string>>([{ host: "other.invalid" }, { origin: "http://example.invalid" }, { origin: "https://example.invalid/path" }, { origin: "https://example.invalid.evil.test" }])("宛先や送信元を偽装した送信は拒否 %j", async headers => {
    const save = vi.fn(); expect((await post({ save })(req(input, headers))).status).toBe(403); expect(save).not.toHaveBeenCalled();
  });
  it("未知のOriginとHostを同時に揃えても拒否する", async () => {
    const save = vi.fn();
    expect((await post({ save })(req(input, { origin: "https://unknown.invalid", host: "unknown.invalid", "sec-fetch-site": "same-origin" }))).status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });
  it("転送ヘッダーだけでは送信元を許可しない", async () => {
    const save = vi.fn();
    expect((await post({ save })(req(input, { origin: "https://unknown.invalid", host: "unknown.invalid", "x-forwarded-host": "example.invalid", "x-forwarded-proto": "https" }))).status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });
  it("検査用に明示したときだけloopback HTTPを許可する", async () => {
    const save = vi.fn();
    const local = req(input, { origin: "http://127.0.0.1:3135", host: "127.0.0.1:3135", "sec-fetch-site": "same-origin" });
    expect((await post({ save })(local)).status).toBe(403);
    expect((await post({ save, allowLoopbackOrigin: true })(local)).status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });
  it("許可Originにワイルドカードやパスを混ぜても有効にならない", async () => {
    const save = vi.fn();
    const handler = createContactHandler({ allowedOrigins: ["https://*.invalid", "https://unknown.invalid/path"], save });
    expect((await handler(req(input, { origin: "https://unknown.invalid", host: "unknown.invalid" }))).status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });
  it("JSONでない本文と16KBを超える実本文を保存しない", async () => {
    const save = vi.fn(), handler = post({ save });
    expect((await handler(req(input, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await handler(req({ ...input, message: "あ".repeat(6000) }))).status).toBe(413);
    expect(save).not.toHaveBeenCalled();
  });
  it("保存の不明結果は再実行も通知もしない", async () => {
    const save = vi.fn().mockRejectedValue(new Error("PRIVATE_PROVIDER_BODY")), notify = vi.fn(), log = vi.spyOn(console, "error");
    const response = await post({ save, notify })(req());
    expect(response.status).toBe(503); expect(await response.json()).toEqual({ state: "unknown", error: "SAVE_UNCONFIRMED", attemptId: input.attemptId });
    expect(save).toHaveBeenCalledTimes(1); expect(notify).not.toHaveBeenCalled(); expect(log).not.toHaveBeenCalled();
  });
  it.each(["not_configured", "provider_acknowledged", "unconfirmed"] as const)("保存の受付番号と通知状況を返す %s", async state => {
    const sequence: string[] = []; const save = vi.fn(async () => { sequence.push("stored"); });
    const notify = state === "not_configured" ? undefined : vi.fn(async () => { sequence.push("notified"); return state === "provider_acknowledged"; });
    const response = await post({ save, notify })(req());
    expect(await response.json()).toEqual({ state: "stored", attemptId: input.attemptId, notification: state });
    expect(sequence[0]).toBe("stored"); expect(save).toHaveBeenCalledTimes(1);
  });
  it("通知が失敗しても保存済みを未受付へ戻さない", async () => {
    const response = await post({ save: async () => {}, notify: async () => { throw Error("PRIVATE_NOTIFICATION_BODY"); } })(req());
    expect(response.status).toBe(200); expect(await response.json()).toMatchObject({ state: "stored", notification: "unconfirmed" });
  });
});
