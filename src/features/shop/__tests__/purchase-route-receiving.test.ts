import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as purchasePost } from "@/app/api/ec/purchase/[action]/route";
import { POST as statusPost } from "@/app/api/ec/purchase/status/route";
import { catalogSchema } from "../components/PurchasePanel";
import { deliveryMethodsSchema, selectableMethods } from "../receiving-method";

/** The website's own entry points (src/app/api/ec/**), with the outgoing
 * request replaced by a local stand-in: nothing leaves this process. */
const siteOrigin = "https://example.invalid", backendOrigin = "https://dummy.workers.dev", serverKey = "a".repeat(64);
const purchaseKey = "c".repeat(64), acceptedQuote = "b".repeat(64);
const browser = (action: string, body: string) => new Request(`${siteOrigin}/api/ec/purchase/${action}`, {
  method: "POST", headers: { origin: siteOrigin, "content-type": "application/json", "x-forwarded-for": "192.0.2.1" }, body,
});
const orderStatus = { orderReference: "order_dummy", createdAt: 1, items: [], total: 2900, shipping: 0, refundedTotal: 0, payment: "waiting", physical: "waiting_payment", giftDelivery: "not_applicable", confirmationEmail: "not_sent", cancellation: "none" };
const seen: { url: string; headers: Record<string, string>; body: string }[] = [];
let answer: (path: string) => unknown = () => ({});
async function relay(action: string, body: string) {
  const response = await (action === "status" ? statusPost : purchasePost)(browser(action, body));
  return { status: response.status, text: await response.text() };
}

describe("サイトの受け口は、受け取り方法の項目を落とさず・足さずに渡す", () => {
  beforeEach(() => {
    seen.length = 0; answer = () => ({});
    vi.stubEnv("MISOCA_PURCHASE_SITE_ORIGIN", siteOrigin); vi.stubEnv("MISOCA_PURCHASE_BACKEND_ORIGIN", backendOrigin);
    vi.stubEnv("MISOCA_PURCHASE_SERVER_KEY", serverKey); vi.stubEnv("VERCEL", "1"); vi.stubEnv("MISOCA_PURCHASE_IP_SOURCE", "vercel-direct-v1");
    vi.stubGlobal("fetch", vi.fn(async (request: Request) => {
      seen.push({ url: request.url, headers: Object.fromEntries(request.headers), body: await request.text() });
      return Response.json(answer(new URL(request.url).pathname));
    }));
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("全部の経路で、管理側への依頼にヘッダ x-misoca-delivery-methods: v1 と x-misoca-reception: v1 を1つずつ足す", async () => {
    const answers: Record<string, unknown> = {
      catalog: { items: [], nextOffset: null, acceptingOrders: true },
      quote: { items: [], shipping: 0, total: 2900, acceptedQuote },
      checkout: { checkoutUrl: "https://checkout.stripe.com/g/pay/cs_test_dummy", status: orderStatus },
      status: { status: orderStatus },
      cancel: { cancellation: "not_created", orderMayExist: false },
    };
    answer = path => answers[path.split("/").at(-1)!];
    for (const action of Object.keys(answers)) expect((await relay(action, "{}")).status, action).toBe(200);
    expect(seen.map(request => request.url)).toEqual(Object.keys(answers).map(action => `${backendOrigin}/api/ec/purchase/${action}`));
    for (const request of seen) {
      expect(request.headers["x-misoca-delivery-methods"]).toBe("v1");
      expect(request.headers["x-misoca-reception"]).toBe("v1");
      expect(Object.keys(request.headers).sort()).toEqual(["authorization", "content-type", "x-misoca-at", "x-misoca-client", "x-misoca-delivery-methods", "x-misoca-reception", "x-misoca-request-id", "x-misoca-site-origin"]);
    }
  });

  it.each([
    ["quote", '{"lines":[{"skuId":"beans","quantity":1}]}'],
    ["quote", '{"lines":[{"skuId":"beans","quantity":1}],"deliveryMethod":"store_pickup"}'],
    ["quote", '{"lines":[{"skuId":"beans","quantity":1}],"deliveryMethod":"local_delivery"}'],
    ["checkout", `{"purchaseKey":"${purchaseKey}","lines":[{"skuId":"beans","quantity":1}],"acceptedQuote":"${acceptedQuote}"}`],
    ["checkout", `{"purchaseKey":"${purchaseKey}","lines":[{"skuId":"beans","quantity":1}],"acceptedQuote":"${acceptedQuote}","deliveryMethod":"store_pickup"}`],
  ])("%s の本文 %s を、1バイトも変えずに渡す", async (action, body) => {
    answer = () => action === "quote" ? { items: [], shipping: 0, total: 2900, acceptedQuote } : { checkoutUrl: null, status: orderStatus };
    expect((await relay(action, body)).status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(seen[0].body).toBe(body);
  });

  it("商品一覧の deliveryMethods は、あればそのまま返し、無ければ足さない", async () => {
    const plain = { items: [], nextOffset: null, acceptingOrders: true };
    answer = () => plain;
    expect(await relay("catalog", "{}")).toEqual({ status: 200, text: JSON.stringify(plain) });
    for (const deliveryMethods of [["shipping"], ["shipping", "store_pickup"], ["shipping", "local_delivery", "store_pickup"]]) {
      answer = () => ({ ...plain, deliveryMethods });
      expect(await relay("catalog", "{}")).toEqual({ status: 200, text: JSON.stringify({ ...plain, deliveryMethods }) });
    }
  });

  it("商品一覧の reception は、あればそのまま返し、無ければ足さない", async () => {
    const plain = { items: [], nextOffset: null, acceptingOrders: true };
    answer = () => plain;
    expect(await relay("catalog", "{}")).toEqual({ status: 200, text: JSON.stringify(plain) });
    for (const reception of [{ state: "open" }, { state: "paused", reopensAt: null, message: "" }, { state: "paused", reopensAt: 1795582800000, message: "年末年始はお休みをいただきます。" }]) {
      answer = () => ({ ...plain, reception });
      expect(await relay("catalog", "{}")).toEqual({ status: 200, text: JSON.stringify({ ...plain, reception }) });
    }
  });

  it("商品一覧の知らない方法名・余分な項目は、受け口で断る（503）", async () => {
    const plain = { items: [], nextOffset: null, acceptingOrders: true };
    for (const extra of [{ deliveryMethods: ["shipping", "drone"] }, { deliveryMethods: [] }, { deliveryMethods: ["shipping", "store_pickup"], shippingFee: 0 }, { deliveryMethod: "store_pickup" }, { reception: { state: "closed" } }, { reception: { state: "paused" } }]) {
      answer = () => ({ ...plain, ...extra });
      expect(await relay("catalog", "{}")).toEqual({ status: 503, text: '{"error":"SERVICE_UNAVAILABLE"}' });
    }
  });

  it("順序の違う一覧は、管理側と同じ受け渡し部品では通る。ブラウザ側は商品一覧を読んだうえで、配送だけとして扱う", async () => {
    const wrongOrder = ["store_pickup", "shipping"];
    answer = () => ({ items: [], nextOffset: null, acceptingOrders: true, deliveryMethods: wrongOrder });
    const relayed = await relay("catalog", "{}");
    expect(relayed.status).toBe(200);
    expect(deliveryMethodsSchema.safeParse(wrongOrder).success).toBe(false);
    const catalog = catalogSchema.parse(JSON.parse(relayed.text));
    expect(catalog.acceptingOrders).toBe(true);
    expect(catalog.deliveryMethods).toBeUndefined();
    expect(selectableMethods(catalog.deliveryMethods, true)).toEqual([]);
  });

  it("注文の状況・決済の開始の receiving は、あればそのまま返し、無ければ足さない", async () => {
    answer = () => ({ status: orderStatus });
    expect(await relay("status", JSON.stringify({ purchaseKey }))).toEqual({ status: 200, text: JSON.stringify({ status: orderStatus }) });
    for (const receiving of ["store_pickup", "local_delivery"]) {
      answer = () => ({ status: { ...orderStatus, receiving } });
      expect(await relay("status", JSON.stringify({ purchaseKey }))).toEqual({ status: 200, text: JSON.stringify({ status: { ...orderStatus, receiving } }) });
      answer = () => ({ checkoutUrl: "https://checkout.stripe.com/g/pay/cs_test_dummy", status: { ...orderStatus, receiving } });
      expect(await relay("checkout", "{}")).toEqual({ status: 200, text: JSON.stringify({ checkoutUrl: "https://checkout.stripe.com/g/pay/cs_test_dummy", status: { ...orderStatus, receiving } }) });
    }
    for (const receiving of ["shipping", "drone", null]) {
      answer = () => ({ status: { ...orderStatus, receiving } });
      expect((await relay("status", JSON.stringify({ purchaseKey }))).status).toBe(503);
    }
  });

  it("見積もりの応答の形は変えない（送料・合計は応答の値のまま、項目は増やさない）", async () => {
    const quotation = { items: [], shipping: 0, total: 2900, acceptedQuote };
    answer = () => quotation;
    expect(await relay("quote", '{"lines":[],"deliveryMethod":"store_pickup"}')).toEqual({ status: 200, text: JSON.stringify(quotation) });
    answer = () => ({ ...quotation, deliveryMethod: "store_pickup" });
    expect((await relay("quote", '{"lines":[],"deliveryMethod":"store_pickup"}')).status).toBe(503);
  });

  it("断る応答（400・409）は、今までの種類のまま返す", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "INVALID_REQUEST" }, { status: 400 })));
    expect(await relay("quote", '{"lines":[],"deliveryMethod":"store_pickup"}')).toEqual({ status: 400, text: '{"error":"INVALID_REQUEST"}' });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "QUOTE_CHANGED", orderMayExist: true }, { status: 409 })));
    expect(await relay("checkout", "{}")).toEqual({ status: 409, text: '{"error":"QUOTE_CHANGED","orderMayExist":true}' });
  });

  it("接続の設定が無いあいだは、今までどおり 503 で、外へは何も送らない", async () => {
    vi.unstubAllEnvs();
    for (const name of ["MISOCA_PURCHASE_SITE_ORIGIN", "MISOCA_PURCHASE_BACKEND_ORIGIN", "MISOCA_PURCHASE_SERVER_KEY", "VERCEL", "MISOCA_PURCHASE_IP_SOURCE"]) vi.stubEnv(name, "");
    expect(await relay("catalog", "{}")).toEqual({ status: 503, text: '{"error":"SERVICE_UNAVAILABLE"}' });
    expect(seen).toHaveLength(0);
  });
});
