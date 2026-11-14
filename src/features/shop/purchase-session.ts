import { z } from "zod";
import { PURCHASE_STORAGE_KEY, type BuyerStatus, type PurchaseCancellationResult } from "./purchaser-status";

export const PURCHASE_SESSION_KEY = "misoca-ec-purchase-session-v1";
export const cartLinesSchema = z.array(z.object({ skuId: z.string().min(1).max(128), quantity: z.number().int().min(1).max(20) }).strict()).max(20).refine(lines => new Set(lines.map(l => l.skuId)).size === lines.length);
export const purchaseAttemptSchema = z.object({ purchaseKey: z.string().regex(/^[a-f0-9]{64}$/), lines: cartLinesSchema, acceptedQuote: z.string().regex(/^[a-f0-9]{64}$/), settledOrderId: z.string().optional(), cancelRequested: z.literal(true).optional() }).strict();
const sessionSchema = z.object({ version: z.literal(1), cart: cartLinesSchema, attempt: purchaseAttemptSchema.nullable(), history: z.array(z.object({ purchaseKey: z.string().regex(/^[a-f0-9]{64}$/), orderReference: z.string() }).strict()).max(1000), viewKey: z.string().regex(/^[a-f0-9]{64}$/).nullable() }).strict();
export type PurchaseSession = z.infer<typeof sessionSchema>;
export type PurchaseAttempt = z.infer<typeof purchaseAttemptSchema>;
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export function readPurchaseSession(storage: StoragePort): PurchaseSession {
  const raw = storage.getItem(PURCHASE_SESSION_KEY);
  return raw === null ? { version: 1, cart: [], attempt: null, history: [], viewKey: null } : sessionSchema.parse(JSON.parse(raw));
}
export function writePurchaseSession(storage: StoragePort, session: PurchaseSession) {
  // A single browser-storage write makes cart adjustment and its receipt atomic.
  const serialized = JSON.stringify(sessionSchema.parse(session)); storage.setItem(PURCHASE_SESSION_KEY, serialized);
  if (storage.getItem(PURCHASE_SESSION_KEY) !== serialized) throw new Error("PURCHASE_STORAGE_UNAVAILABLE");
}
export function purchaseKeyForStatus(storage: StoragePort) {
  const session = readPurchaseSession(storage);
  return session.viewKey ?? session.attempt?.purchaseKey ?? storage.getItem(PURCHASE_STORAGE_KEY) ?? "";
}
export function reconcilePurchasedCart(storage: StoragePort, key: string, status: BuyerStatus) {
  const session = readPurchaseSession(storage); const attempt = session.attempt;
  if (status.payment !== "confirmed" || !attempt || key !== attempt.purchaseKey || attempt.settledOrderId) return session;
  const sorted = (lines: { skuId: string; quantity: number }[]) => JSON.stringify(lines.map(l => ({ skuId: l.skuId, quantity: l.quantity })).sort((a, b) => a.skuId < b.skuId ? -1 : a.skuId > b.skuId ? 1 : 0));
  if (sorted(attempt.lines) !== sorted(status.items)) throw new Error("PURCHASE_RECEIPT_MISMATCH");
  const bought = new Map(attempt.lines.map(l => [l.skuId, l.quantity]));
  const cart = session.cart.map(l => ({ ...l, quantity: Math.max(0, l.quantity - (bought.get(l.skuId) ?? 0)) })).filter(l => l.quantity > 0);
  const next = { ...session, cart, attempt: { ...attempt, settledOrderId: status.orderReference } };
  writePurchaseSession(storage, next); return next;
}
export function allowedCheckoutLocation(value: string, origin: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" && url.port === "" && !url.username && !url.password
      || origin === "http://127.0.0.1:3133" && url.origin === origin && url.pathname === "/fixture/payment" && !url.username && !url.password;
  } catch { return false; }
}

export function markCheckoutCancellation(storage: StoragePort, purchaseKey: string) {
  const session = readPurchaseSession(storage);
  if (session.attempt?.purchaseKey !== purchaseKey) return session;
  const next = { ...session, attempt: { ...session.attempt, cancelRequested: true as const }, viewKey: purchaseKey };
  writePurchaseSession(storage, next); return next;
}
export function applyCheckoutCancellation(storage: StoragePort, purchaseKey: string, result: PurchaseCancellationResult) {
  const session = readPurchaseSession(storage);
  if (session.attempt?.purchaseKey !== purchaseKey) return session;
  const noOrder = result.cancellation === "not_created" && result.orderMayExist === false;
  const closed = "status" in result && result.status.cancellation === "closed" && result.status.payment === "closed";
  if (!noOrder && !closed) return session;
  const history = closed && "status" in result && !session.history.some(h => h.orderReference === result.status.orderReference)
    ? [...session.history, { purchaseKey, orderReference: result.status.orderReference }] : session.history;
  const next = { ...session, attempt: null, history, viewKey: noOrder ? null : purchaseKey };
  // Cancellation is not a purchase: preserve every cart item.
  writePurchaseSession(storage, next); return next;
}
