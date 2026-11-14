import { contactInputSchema, type ContactInput, type ContactReceipt } from "./contract";

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });
const MAX_BYTES = 16_000;
function hasSameOrigin(request: Request, allowedOrigins: ReadonlySet<string>, allowLoopbackOrigin: boolean): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const local = allowLoopbackOrigin && parsed.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    return parsed.origin === origin && (allowedOrigins.has(origin) || local) && parsed.host.toLowerCase() === host.toLowerCase();
  } catch { return false; }
}
/** Thrown by `save` when it is certain that nothing was sent or stored. */
export class IntakeUnavailable extends Error {}
export function createContactHandler(options: {
  allowedOrigins: readonly string[];
  allowLoopbackOrigin?: boolean;
  save?: (input: ContactInput) => Promise<void>;
  notify?: (input: ContactInput) => Promise<boolean>;
}) {
  // Only exact HTTPS origins from trusted server configuration are accepted.
  const allowedOrigins = new Set(options.allowedOrigins.filter(value => {
    try { const url = new URL(value); return url.protocol === "https:" && url.origin === value && !url.username && !url.password; }
    catch { return false; }
  }));
  return async function post(request: Request): Promise<Response> {
    if (!hasSameOrigin(request, allowedOrigins, options.allowLoopbackOrigin === true) ||
      (request.headers.has("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin")) {
      return json({ state: "rejected", error: "ORIGIN_REJECTED" }, 403);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return json({ state: "rejected", error: "JSON_REQUIRED" }, 415);
    const declared = request.headers.get("content-length");
    if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BYTES)) return json({ state: "rejected", error: "BODY_TOO_LARGE" }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ state: "rejected", error: "INPUT_INVALID" }, 400);
    let raw: unknown;
    try {
      const chunks: Uint8Array[] = []; let length = 0;
      while (true) {
        const part = await reader.read(); if (part.done) break;
        length += part.value.byteLength;
        if (length > MAX_BYTES) { await reader.cancel(); return json({ state: "rejected", error: "BODY_TOO_LARGE" }, 413); }
        chunks.push(part.value);
      }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const part of chunks) { bytes.set(part, offset); offset += part.byteLength; }
      raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch { return json({ state: "rejected", error: "INPUT_INVALID" }, 400); }
    finally { reader.releaseLock(); }
    const input = contactInputSchema.safeParse(raw);
    if (!input.success) return json({ state: "rejected", error: "INPUT_INVALID" }, 400);
    if (!options.save) return json({ state: "unavailable", error: "INTAKE_NOT_CONFIGURED" }, 503);
    try { await options.save(input.data); }
    catch (error) {
      if (error instanceof IntakeUnavailable) return json({ state: "unavailable", error: "INTAKE_NOT_CONFIGURED" }, 503);
      return json({ state: "unknown", error: "SAVE_UNCONFIRMED", attemptId: input.data.attemptId }, 503);
    }
    let notification: ContactReceipt["notification"] = "not_configured";
    if (options.notify) {
      try { notification = await options.notify(input.data) ? "provider_acknowledged" : "unconfirmed"; }
      catch { notification = "unconfirmed"; }
    }
    return json({ state: "stored", attemptId: input.data.attemptId, notification } satisfies ContactReceipt, 200);
  };
}
