import { createHmac } from "node:crypto";
import { isIP } from "node:net";
/** Only for direct Vercel ingress: the platform overwrites x-forwarded-for.
 * This is a traffic-budget hint, NEVER an identity/session/permission. A new
 * proxy or another host must not silently reuse this header contract.
 * Raw IPs are neither forwarded, stored, returned nor logged. Daily HMACs
 * are reduced to bounded buckets by the DO, not retained as visitor records.
 */
export function createVercelPurchaseClientIdentity(serverKey: string, now: () => number = Date.now) {
  if (!/^[a-f0-9]{64}$/.test(serverKey)) throw Error("PURCHASE_CLIENT_UNAVAILABLE");
  const secret = createHmac("sha256", Buffer.from(serverKey, "hex")).update("misoca-purchase-client-identity-key-v1").digest();
  return (request: Request): string => {
    const ip = request.headers.get("x-forwarded-for"), at = now();
    if (!ip || ip !== ip.trim() || !isIP(ip) || !Number.isSafeInteger(at) || at < 0) throw Error("PURCHASE_CLIENT_UNAVAILABLE");
    return createHmac("sha256", secret).update("misoca-purchase-client-v1\0").update(String(Math.floor(at / 86400000))).update("\0").update(ip.toLowerCase()).digest("hex");
  };
}
