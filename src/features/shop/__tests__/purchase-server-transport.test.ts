import { describe, expect, it, vi } from "vitest";
import { createPurchaseWebsiteProxy, createPurchaseServerAccess, purchaseRuntimeRequest } from "../ledger/purchase-server-transport";
const siteOrigin = "https://example.invalid", backendOrigin = "https://dummy.workers.dev", serverKey = "a".repeat(64);
const config = { siteOrigin, backendOrigin, serverKey, clientIdentity: () => "1".repeat(64) };
const req = (path = "catalog", body = "{}", headers: Record<string, string> = {}) => new Request(`${siteOrigin}/api/ec/purchase/${path}`, {
  method: "POST", headers: { origin: siteOrigin, "content-type": "application/json", ...headers }, body,
});
const success = () => Response.json({ items: [], nextOffset: null, acceptingOrders: false });
describe("公開サイトとEC台帳の専用接続", () => {
  it("固定した宛先へ一度だけ送り、ブラウザの権限・Cookieを転送しない", async () => {
    const send = vi.fn(async (request: Request) => {
      expect(request.url).toBe(backendOrigin + "/api/ec/purchase/catalog");
      // x-misoca-delivery-methods: the website states that it can read `deliveryMethods` in a catalog answer (added with the receiving methods).
      expect([...request.headers.keys()].sort()).toEqual(["authorization", "content-type", "x-misoca-at", "x-misoca-client", "x-misoca-delivery-methods", "x-misoca-request-id", "x-misoca-site-origin"]);
      expect(request.headers.get("x-misoca-delivery-methods")).toBe("v1");
      expect(request.headers.get("authorization")).toBe(`Bearer ${serverKey}`);
      expect(request.redirect).toBe("manual");
      expect(await request.text()).toBe("{}"); return success();
    });
    const response = await createPurchaseWebsiteProxy({ ...config, send })(req("catalog", "{}", { cookie: "private", authorization: "manager", "x-forwarded-host": "other.invalid" }));
    expect(response.status).toBe(200); expect(send).toHaveBeenCalledTimes(1);
    expect(response.headers.get("cache-control")).toMatch(/no-store/);
    expect(await response.text()).not.toContain(serverKey);
  });
  it.each(["catalog?extra=1", "../operations/profile", "unknown", "catalog%2fextra"])("余計な経路を外部へ送らない %s", async path => {
    const send = vi.fn(async () => success());
    expect((await createPurchaseWebsiteProxy({ ...config, send })(req(path))).status).not.toBe(200); expect(send).not.toHaveBeenCalled();
  });
  it.each<Record<string, string>>([{ origin: "https://other.invalid" }, { "sec-fetch-site": "cross-site" }, { "content-type": "text/plain" }, { "content-encoding": "gzip" }])("不正な入力は転送前に拒否 %#", async headers => {
    const send = vi.fn(async () => success());
    expect((await createPurchaseWebsiteProxy({ ...config, send })(req("catalog", "{}", headers))).status).not.toBe(200); expect(send).not.toHaveBeenCalled();
  });
  it("購入本文の上限を超えたら転送しない", async () => {
    const send = vi.fn(async () => success());
    expect((await createPurchaseWebsiteProxy({ ...config, send })(req("catalog", "x".repeat(8193)))).status).toBe(503); expect(send).not.toHaveBeenCalled();
  });
  it("webhookはWorkerで直接受け、原文バイトと署名を保つ", async () => {
    const body = '{\n  "message": "架空", "amount": 1e3\n}\n';
    const send = vi.fn(async (request: Request) => {
      expect(createPurchaseServerAccess(config)(request)).toBeUndefined();
      const runtime = purchaseRuntimeRequest(request, siteOrigin, backendOrigin);
      expect([...runtime.headers.keys()].sort()).toEqual(["content-type", "stripe-signature"]);
      expect(runtime.url).toBe(backendOrigin + "/api/ec/webhook"); expect(await runtime.text()).toBe(body);
      return Response.json({ received: true, duplicate: false });
    });
    const request = new Request(backendOrigin + "/api/ec/webhook", { method: "POST", headers: { "content-type": "application/json", "stripe-signature": "t=1,v1=dummy" }, body });
    expect((await send(request)).status).toBe(200);
    const relay = vi.fn(async () => Response.json({ received: true }));
    expect((await createPurchaseWebsiteProxy({ ...config, send: relay })(new Request(siteOrigin + "/api/ec/webhook", { method: "POST", headers: { "content-type": "application/json", "stripe-signature": "dummy" }, body }))).status).toBe(404);
    expect(relay).not.toHaveBeenCalled();
  });
  it.each([
    () => new Response(null, { status: 302, headers: { location: "https://other.invalid" } }),
    () => Response.json({ items: [], nextOffset: null, acceptingOrders: false }, { headers: { "set-cookie": "private" } }),
    () => Response.json({ items: [], nextOffset: null, acceptingOrders: false, secret: "private" }),
    () => Response.json({ error: "private-internal-detail" }, { status: 500 }),
    () => Response.json({ error: "SERVICE_UNAVAILABLE", orderMayExist: false }, { status: 503 }),
  ])("不明な応答を成功や注文なしに置き換えず、秘密を返さない %#", async make => {
    const send = vi.fn(async () => make()), result = await createPurchaseWebsiteProxy({ ...config, send })(req());
    expect(result.status).toBe(503); expect(await result.json()).toEqual({ error: "SERVICE_UNAVAILABLE" }); expect(send).toHaveBeenCalledTimes(1);
  });
  it("転送の失敗も期限切れも自動で再送しない", async () => {
    for (const send of [vi.fn(async () => { throw Error("private"); }), vi.fn(() => new Promise<Response>(() => {}))]) {
      const response = await createPurchaseWebsiteProxy({ ...config, send, timeoutMs: 5 })(req());
      expect(response.status).toBe(503); expect(send).toHaveBeenCalledTimes(1); expect(await response.text()).not.toContain("private");
    }
  });
  it("期限切れや不明なサーバー文脈を内側で拒否する", () => {
    const access = createPurchaseServerAccess({ ...config, now: () => 100000 });
    const request = new Request(backendOrigin + "/api/ec/purchase/catalog", { method: "POST", headers: {
      "content-type": "application/json", authorization: `Bearer ${serverKey}`, "x-misoca-site-origin": siteOrigin,
      "x-misoca-at": "1", "x-misoca-request-id": "00000000-0000-4000-8000-000000000000", "x-misoca-client": "1".repeat(64),
    }, body: "{}" });
    expect(access(request)?.status).toBe(401);
  });
  it("内側でも別origin、Cookie、管理鍵や不明な経路を拒否", () => {
    const access = createPurchaseServerAccess(config);
    const headers = { "content-type": "application/json", authorization: `Bearer ${serverKey}`, "x-misoca-site-origin": siteOrigin,
      "x-misoca-at": String(Date.now()), "x-misoca-request-id": "00000000-0000-4000-8000-000000000000", "x-misoca-client": "1".repeat(64) };
    const request = (path: string, extra = {}) => new Request(backendOrigin + path, { method: "POST", headers: { ...headers, ...extra }, body: "{}" });
    expect(access(request("/api/ec/purchase/catalog"))).toBeUndefined();
    for (const extra of [{ cookie: "private" }, { origin: siteOrigin }, { authorization: "Bearer " + "b".repeat(64) }, { "x-misoca-site-origin": "https://other.invalid" }]) expect(access(request("/api/ec/purchase/catalog", extra))?.status).not.toBe(200);
    expect(access(request("/api/ec/operations/profile"))?.status).toBe(400);
  });
  it("商品一覧の deliveryMethods は任意: 無い応答は今までどおり通し、ある応答は決まった値だけ通す", async () => {
    const answer = async (body: unknown) => { const send = vi.fn(async () => Response.json(body)); const response = await createPurchaseWebsiteProxy({ ...config, send })(req()); return { status: response.status, json: await response.json() }; };
    const plain = { items: [], nextOffset: null, acceptingOrders: true };
    expect(await answer(plain)).toEqual({ status: 200, json: plain });
    for (const deliveryMethods of [["shipping"], ["shipping", "store_pickup"], ["shipping", "local_delivery", "store_pickup"]]) expect(await answer({ ...plain, deliveryMethods })).toEqual({ status: 200, json: { ...plain, deliveryMethods } });
    for (const deliveryMethods of [[], ["drone"], ["shipping", "store_pickup", "local_delivery", "shipping"], "store_pickup", null, [1]]) expect((await answer({ ...plain, deliveryMethods })).status).toBe(503);
  });
  it("注文の状況の receiving は任意: 配送の注文の形はそのまま、配送以外は決まった値だけ通す", async () => {
    const status = { orderReference: "order_dummy", createdAt: 1, items: [], total: 1800, shipping: 0, refundedTotal: 0, payment: "confirmed", physical: "awaiting_preparation", giftDelivery: "not_applicable", confirmationEmail: "not_sent", cancellation: "none" };
    const answer = async (body: unknown) => { const send = vi.fn(async () => Response.json(body)); const response = await createPurchaseWebsiteProxy({ ...config, send })(req("status", JSON.stringify({ purchaseKey: "a".repeat(64) }))); return { status: response.status, json: await response.json() }; };
    expect(await answer({ status })).toEqual({ status: 200, json: { status } });
    for (const receiving of ["store_pickup", "local_delivery"]) expect(await answer({ status: { ...status, receiving } })).toEqual({ status: 200, json: { status: { ...status, receiving } } });
    for (const receiving of ["shipping", "drone", null, 1]) expect((await answer({ status: { ...status, receiving } })).status).toBe(503);
  });
  it("実行部品へ渡す依頼には、サイトの申告（v1）だけを写す。通知には付けない・ほかの値やヘッダは写さない", () => {
    const forwarded = (path: string, headers: Record<string, string>) => [...purchaseRuntimeRequest(new Request(backendOrigin + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: "{}" }), siteOrigin, backendOrigin).headers.keys()].sort();
    expect(forwarded("/api/ec/purchase/catalog", {})).toEqual(["content-type", "origin"]);
    expect(forwarded("/api/ec/purchase/catalog", { "x-misoca-delivery-methods": "v1", authorization: "private", "x-other": "1" })).toEqual(["content-type", "origin", "x-misoca-delivery-methods"]);
    for (const value of ["v2", "V1", "1", ""]) expect(forwarded("/api/ec/purchase/catalog", { "x-misoca-delivery-methods": value })).toEqual(["content-type", "origin"]);
    expect(forwarded("/api/ec/webhook", { "x-misoca-delivery-methods": "v1", "stripe-signature": "t=1,v1=dummy" })).toEqual(["content-type", "stripe-signature"]);
  });
});
