import { createPurchaseWebsiteProxy } from "./ledger/purchase-server-transport";
import { createVercelPurchaseClientIdentity } from "./ledger/purchase-client-identity";

/** Named server-only settings, never NEXT_PUBLIC_*, request hosts or defaults.
 * Missing settings preserve the current closed route. Sales remain separately
 * paused in website policy and in the prelaunch backend configuration.
 */
export async function handlePurchaseRoute(request: Request) {
  try {
    const siteOrigin = process.env.MISOCA_PURCHASE_SITE_ORIGIN;
    const backendOrigin = process.env.MISOCA_PURCHASE_BACKEND_ORIGIN;
    const serverKey = process.env.MISOCA_PURCHASE_SERVER_KEY;
    if (!siteOrigin || !backendOrigin || !serverKey || process.env.VERCEL !== "1" || process.env.MISOCA_PURCHASE_IP_SOURCE !== "vercel-direct-v1") throw Error();
    return await createPurchaseWebsiteProxy({ siteOrigin, backendOrigin, serverKey,
      clientIdentity: createVercelPurchaseClientIdentity(serverKey), send: request => fetch(request) })(request);
  } catch {
    return Response.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503, headers: {
      "cache-control": "no-store, private", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff", "x-robots-tag": "noindex, nofollow",
    } });
  }
}
