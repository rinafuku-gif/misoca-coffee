import { timingSafeEqual, randomUUID } from "node:crypto";
import { z } from "zod";
import { purchaserStatusSchema, purchaseCancellationResultSchema, RECEIVING_METHODS, DELIVERY_METHODS_HEADER, RECEPTION_HEADER } from "../purchaser-status";
import { buyerProductPublicationSchema } from "../product-publication-view";

const paths = new Set(["catalog", "quote", "checkout", "status", "cancel", "cancel-request"].map(action => `/api/ec/purchase/${action}`));
export const PURCHASE_WEBHOOK_PATH = "/api/ec/webhook";
const privateHeaders = { "cache-control": "no-store, private", "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff", "x-robots-tag": "noindex, nofollow" };
const unavailable = () => Response.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503, headers: privateHeaders });
const denied = (error: string, status: number) => Response.json({ error }, { status, headers: privateHeaders });
export function isPurchaseServerPath(path: string) { return paths.has(path) || path === PURCHASE_WEBHOOK_PATH; }
function origin(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.origin !== raw || url.username || url.password) throw Error("PURCHASE_TRANSPORT_CONFIG_INVALID");
  return raw;
}
function key(raw: string) {
  if (!/^[a-f0-9]{64}$/.test(raw)) throw Error("PURCHASE_TRANSPORT_CONFIG_INVALID");
  return Buffer.from(raw, "hex");
}
function basic(request: Request) {
  const url = new URL(request.url);
  if (!isPurchaseServerPath(url.pathname) || url.search || url.hash) return denied("INVALID_REQUEST", 400);
  if (request.method !== "POST") return denied("METHOD_NOT_ALLOWED", 405);
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json"
    || request.headers.has("content-encoding")) return denied("JSON_REQUIRED", 415);
  return undefined;
}
/** Bounded bytes, not decoded/re-encoded JSON. Cancellation never retries an operation. */
export async function readPurchaseTransportBytes(body: ReadableStream<Uint8Array> | null, limit: number, signal: AbortSignal) {
  const reader = body?.getReader(); if (!reader || signal.aborted) throw Error("BODY_UNAVAILABLE");
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  try {
    const parts: Uint8Array[] = []; let size = 0;
    for (;;) {
      if (signal.aborted) throw Error("BODY_UNAVAILABLE");
      const part = await reader.read();
      if (signal.aborted) throw Error("BODY_UNAVAILABLE");
      if (part.done) break;
      size += part.value.byteLength; if (size > limit) throw Error("BODY_UNAVAILABLE");
      parts.push(part.value);
    }
    return Buffer.concat(parts);
  } finally { signal.removeEventListener("abort", cancel); cancel(); reader.releaseLock(); }
}
const item = z.object({ skuId: z.string().min(1).max(128), name: z.string(), unit: z.string(), unitPrice: z.number().int().nonnegative(),
  kind: z.enum(["physical", "gift"]), maxQuantity: z.number().int().min(0).max(20), publication: buyerProductPublicationSchema.optional() }).strict();
// deliveryMethods: only present when the management side offers methods AND this proxy asked for it (header below). Absent = shipping only.
// reception: only present when the reception switch (H) is open AND this proxy asked for it (header below). Absent = no switch / not paused by it.
const reception = z.object({ state: z.literal("open") }).strict().or(
  z.object({ state: z.literal("paused"), reopensAt: z.number().int().nonnegative().nullable(), message: z.string().max(80) }).strict());
const catalog = z.object({ items: z.array(item).max(50), nextOffset: z.number().int().nonnegative().nullable(), acceptingOrders: z.boolean(),
  deliveryMethods: z.array(z.enum(["shipping", ...RECEIVING_METHODS])).min(1).max(3).optional(), reception: reception.optional() }).strict();
const quotation = z.object({ items: z.array(z.object({ skuId: z.string(), name: z.string(), unit: z.string(), quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(), kind: z.enum(["physical", "gift"]), publication: buyerProductPublicationSchema.optional() }).strict()).max(20),
  shipping: z.number().int().nonnegative(), total: z.number().int().nonnegative(), acceptedQuote: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
const checkoutUrl = z.string().url().refine(raw => { const url = new URL(raw); return url.protocol === "https:" && url.hostname === "checkout.stripe.com"
  && !url.username && !url.password && !url.port && /^\/[a-z]\/pay\/cs_[A-Za-z0-9_]+$/.test(url.pathname); });
// 発送前のキャンセル受付 (CHECKOUT-FORM-SPEC-A): the shop page /shop/order-cancel relays the link's order number and token;
// the order-status page relays its purchase key. deadline = the last moment (ms) a request is accepted (optional so this
// copy also reads the answer of the management release before it, which has no deadline: release the site first).
const cancelRequest = z.object({ orderReference: z.string().min(1).max(128), state: z.enum(["open", "requested", "recorded", "handled", "shipped", "expired", "closed"]),
  items: z.array(z.object({ name: z.string(), unit: z.string(), quantity: z.number().int().positive() }).strict()).max(20), total: z.number().int().nonnegative(),
  deadline: z.number().int().nonnegative().optional() }).strict();
const schemas = {
  catalog, quote: quotation, checkout: z.object({ checkoutUrl: checkoutUrl.nullable(), status: purchaserStatusSchema }).strict(),
  status: z.object({ status: purchaserStatusSchema }).strict(), cancel: purchaseCancellationResultSchema, "cancel-request": cancelRequest,
  webhook: z.object({ received: z.literal(true), duplicate: z.boolean().optional(), ignored: z.boolean().optional(),
    quarantined: z.boolean().optional(), reviewRequired: z.boolean().optional() }).strict(),
};
const errors = new Set(["INVALID_REQUEST", "ORIGIN_DENIED", "METHOD_NOT_ALLOWED", "JSON_REQUIRED", "TOO_MANY_REQUESTS", "SERVICE_UNAVAILABLE",
  "PURCHASE_NOT_AVAILABLE", "SALES_PAUSED", "SHIPPING_REVIEW_REQUIRED", "SHIPPING_LIMIT_EXCEEDED", "OUT_OF_STOCK", "PRODUCT_UNAVAILABLE", "QUOTE_CHANGED",
  "ATTEMPT_CONFLICT", "CHECKOUT_IN_PROGRESS", "CHECKOUT_CANCELLATION_PENDING", "ORDER_NOT_PAYABLE", "CHECKOUT_CHECK_REQUIRED"]);
function publicResponse(path: string, status: number, raw: unknown) {
  if (status === 200) {
    const action = path === PURCHASE_WEBHOOK_PATH ? "webhook" : path.split("/").at(-1)! as keyof typeof schemas;
    const parsed = schemas[action].safeParse(raw);
    return parsed.success ? Response.json(parsed.data, { headers: privateHeaders }) : unavailable();
  }
  // Webhook errors never echo a provider/body/diagnostic field; Stripe needs a
  // non-2xx to retry. Buyer unknown responses remain unknown, not not-created.
  if (path === PURCHASE_WEBHOOK_PATH) return denied("WEBHOOK_UNCONFIRMED", [400, 405, 415, 429].includes(status) ? status : 503);
  const parsed = z.object({ error: z.string(), orderMayExist: z.boolean().optional() }).strict().safeParse(raw);
  if (!parsed.success || !errors.has(parsed.data.error) || ![400, 403, 404, 405, 409, 415, 429, 503].includes(status)) return unavailable();
  if (parsed.data.orderMayExist !== undefined && !["QUOTE_CHANGED", "OUT_OF_STOCK", "PRODUCT_UNAVAILABLE", "SHIPPING_REVIEW_REQUIRED", "SHIPPING_LIMIT_EXCEEDED"].includes(parsed.data.error)) return unavailable();
  return Response.json(parsed.data, { status, headers: privateHeaders });
}

/** Website-only server port. No Stripe key, cookies, manager identity, CORS,
 * redirect, fallback, shared response cache or automatic resend. Unconfigured
 * route wrappers keep the current 503; constructing this does not enable sales.
 */
export function createPurchaseWebsiteProxy(options: { siteOrigin: string; backendOrigin: string; serverKey: string;
  clientIdentity: (request: Request) => string; send: (request: Request) => Promise<Response>; timeoutMs?: number; now?: () => number }) {
  const siteOrigin = origin(options.siteOrigin), backendOrigin = origin(options.backendOrigin), secret = key(options.serverKey).toString("hex");
  if (!new URL(backendOrigin).hostname.endsWith(".workers.dev") || backendOrigin === siteOrigin || typeof options.send !== "function" || typeof options.clientIdentity !== "function") throw Error("PURCHASE_TRANSPORT_CONFIG_INVALID");
  const send = options.send, identify = options.clientIdentity, now = options.now ?? Date.now, timeout = options.timeoutMs ?? 20000;
  if (!Number.isSafeInteger(timeout) || timeout < 1 || timeout > 30000) throw Error("PURCHASE_TRANSPORT_CONFIG_INVALID");
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url), webhook = url.pathname === PURCHASE_WEBHOOK_PATH;
    // Stripe posts directly to the Worker. Never relay its notifications
    // through the website, or make them depend on the website's availability.
    if (webhook) return denied("NOT_FOUND", 404);
    if (url.origin !== siteOrigin) return denied("ORIGIN_DENIED", 403);
    const invalid = basic(request); if (invalid) return invalid;
    if (request.headers.get("origin") !== siteOrigin || request.headers.get("sec-fetch-site") === "cross-site") return denied("ORIGIN_DENIED", 403);
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
    try {
      const payload = await readPurchaseTransportBytes(request.body, 8192, controller.signal);
      if (controller.signal.aborted) return unavailable();
      const client = identify(request), at = now();
      if (!/^[a-f0-9]{64}$/.test(client) || !Number.isSafeInteger(at) || at < 0) return unavailable();
      const headers = new Headers({ "content-type": "application/json", authorization: `Bearer ${secret}`, "x-misoca-site-origin": siteOrigin,
        "x-misoca-client": client, "x-misoca-at": String(at), "x-misoca-request-id": randomUUID(), [DELIVERY_METHODS_HEADER]: "v1", [RECEPTION_HEADER]: "v1" });
      const upstream = new Request(backendOrigin + url.pathname, { method: "POST", headers, body: payload, redirect: "manual", signal: controller.signal });
      // Race bounds adapters that don't implement AbortSignal correctly too.
      const response = await Promise.race([send(upstream), new Promise<never>((_, reject) => controller.signal.addEventListener("abort", () => reject(Error("OUTCOME_UNKNOWN")), { once: true }))]);
      if (response.redirected || response.status >= 300 && response.status < 400 || response.headers.has("set-cookie")
        || response.headers.get("content-type")?.split(";")[0].trim() !== "application/json") { void response.body?.cancel().catch(() => {}); return unavailable(); }
      const result = await readPurchaseTransportBytes(response.body, 1_000_000, controller.signal);
      if (controller.signal.aborted) return unavailable();
      return publicResponse(url.pathname, response.status, JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(result)));
    } catch { return unavailable(); } finally { clearTimeout(timer); controller.abort(); }
  };
}

/** Recheck both at outer Worker and inside its DO before initialization/data
 * access. A website capability is not a manager session or a verified payment.
 */
export function createPurchaseServerAccess(options: { siteOrigin: string; backendOrigin: string; serverKey: string; now?: () => number }) {
  const siteOrigin = origin(options.siteOrigin), backendOrigin = origin(options.backendOrigin), expected = key(options.serverKey), now = options.now ?? Date.now;
  return (request: Request): Response | undefined => {
    const url = new URL(request.url);
    if (url.origin !== backendOrigin) return denied("ORIGIN_DENIED", 403);
    const invalid = basic(request); if (invalid) return invalid;
    if (request.headers.has("cookie") || request.headers.has("origin")) return denied("ORIGIN_DENIED", 403);
    if (url.pathname === PURCHASE_WEBHOOK_PATH) {
      if (request.headers.has("authorization")) return denied("ORIGIN_DENIED", 403);
      return !request.headers.get("stripe-signature") || request.headers.get("stripe-signature")!.length > 2048 ? denied("WEBHOOK_UNCONFIRMED", 400) : undefined;
    }
    if (request.headers.get("x-misoca-site-origin") !== siteOrigin) return denied("ORIGIN_DENIED", 403);
    const supplied = request.headers.get("authorization")?.match(/^Bearer ([a-f0-9]{64})$/);
    if (!supplied || !timingSafeEqual(expected, Buffer.from(supplied[1], "hex"))) return denied("SERVER_CONNECTION_REQUIRED", 401);
    const at = request.headers.get("x-misoca-at"), id = request.headers.get("x-misoca-request-id"), client = request.headers.get("x-misoca-client"), current = now();
    if (!at || !/^\d{1,16}$/.test(at) || !Number.isSafeInteger(Number(at)) || !Number.isSafeInteger(current) || Math.abs(current - Number(at)) > 60000
      || !id || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id)
      || !client || !/^[a-f0-9]{64}$/.test(client)) return denied("SERVER_CONNECTION_REQUIRED", 401);
    if (url.pathname === PURCHASE_WEBHOOK_PATH && (!request.headers.get("stripe-signature") || request.headers.get("stripe-signature")!.length > 2048)) return denied("WEBHOOK_UNCONFIRMED", 400);
    return undefined;
  };
}
export function purchaseRuntimeRequest(request: Request, siteOrigin: string, webhookOrigin: string = siteOrigin) {
  const path = new URL(request.url).pathname;
  if (!isPurchaseServerPath(path)) throw Error("PURCHASE_TRANSPORT_CONFIG_INVALID");
  const headers = new Headers({ "content-type": "application/json" });
  if (path === PURCHASE_WEBHOOK_PATH) headers.set("stripe-signature", request.headers.get("stripe-signature") ?? "");
  else headers.set("origin", origin(siteOrigin));
  if (path !== PURCHASE_WEBHOOK_PATH && request.headers.get(DELIVERY_METHODS_HEADER) === "v1") headers.set(DELIVERY_METHODS_HEADER, "v1");
  if (path !== PURCHASE_WEBHOOK_PATH && request.headers.get(RECEPTION_HEADER) === "v1") headers.set(RECEPTION_HEADER, "v1");
  return new Request(origin(path === PURCHASE_WEBHOOK_PATH ? webhookOrigin : siteOrigin) + path, { method: "POST", headers, body: request.body, duplex: "half" } as RequestInit);
}
