import { purchaseCancellationResultSchema, purchaserStatusSchema, type PurchaseCancellationResult } from "./purchaser-status";

/** The ONE place where server answers become what the purchase screen does
 * (server shapes agreed 2026-11-27). Nothing here sends or resends a request. */

/** 「やり直す」 (one cancel request for the previous checkout):
 * - ended    — `not_created` (no order) or `closed` with payment closed: back to checkout, cart kept.
 * - retry    — `checking` (still pending; each press retries on the server) or the cancel
 *              could not be recorded (503 / any failure / unknown shape): one line, press again.
 * - toStatus — `payment_review` (already paid) or any other settled payment: the status page. */
export type RestartOutcome = { kind: "ended"; result: PurchaseCancellationResult } | { kind: "toStatus" } | { kind: "retry" };
export function readRestartOutcome(ok: boolean, body: unknown): RestartOutcome {
  if (!ok) return { kind: "retry" };
  const parsed = purchaseCancellationResultSchema.safeParse(body);
  if (!parsed.success) return { kind: "retry" };
  const result = parsed.data;
  if (result.cancellation === "not_created") return { kind: "ended", result };
  // Checked before the payment state: a pending cancel arrives with payment "under_review".
  if (result.cancellation === "checking") return { kind: "retry" };
  if (result.cancellation === "payment_review") return { kind: "toStatus" };
  if (result.status.payment === "closed") return { kind: "ended", result };
  return { kind: "toStatus" };
}

/** Stripe refused the payment page; the server already ended that order:
 * - first request: HTTP 409 {"error":"ORDER_NOT_PAYABLE"}
 * - the same key again: 200 {"checkoutUrl":null,"status":{payment:"closed",cancellation:"none",…}}
 * Either way the attempt is cleared and the next press starts a NEW attempt (new key). */
export const CHECKOUT_REFUSED_ERROR = "ORDER_NOT_PAYABLE";
export function isCheckoutRefused(ok: boolean, body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  if (!ok) return "error" in body && body.error === CHECKOUT_REFUSED_ERROR;
  if (!("checkoutUrl" in body) || body.checkoutUrl !== null || !("status" in body)) return false;
  const status = purchaserStatusSchema.safeParse(body.status);
  return status.success && status.data.payment === "closed" && status.data.cancellation === "none";
}

/** CHECKOUT-FORM-WIRE.md §3: the form broke a rule (or 上野原市内お届け with another
 * postcode). The input is checked before anything is accepted, so no order or
 * payment page exists for this request: the attempt is dropped and the
 * customer fixes the form and presses again. */
export function isFormRefused(ok: boolean, body: unknown): boolean {
  return !ok && !!body && typeof body === "object" && "error" in body && body.error === "INVALID_REQUEST";
}
/** §3: the same purchaseKey came back with different input. The previous
 * checkout is ended (/cancel) and a new key is used — within the same press. */
export function isAttemptConflict(ok: boolean, body: unknown): boolean {
  return !ok && !!body && typeof body === "object" && "error" in body && body.error === "ATTEMPT_CONFLICT";
}
