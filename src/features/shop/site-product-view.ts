import { z } from "zod";

const text = z.string().max(10000);
const sourceId = z.string().regex(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
const publicImageUrl = z.string().max(4000).refine(value => {
  try {
    const url = new URL(value), host = url.hostname.toLowerCase();
    // A reference only, never a permission to fetch an arbitrary server URL.
    return url.protocol === "https:" && !url.username && !url.password && !url.port
      && host.includes(".") && !host.endsWith(".local") && !host.endsWith(".localhost")
      && !/^[\d.]+$/.test(host) && !host.includes(":") && host !== "localhost";
  } catch { return false; }
});

export const siteProductContentSchema = z.object({
  name: text.refine(value => !!value.trim()), origin: text, farm: text,
  variety: text, process: text, description: text, roast: text, flavor: text,
  region: text, altitude: text,
  // This is the existing Notion reference value, NOT a second EC price ledger.
  // Unknown is null, never silently converted to a zero-price product.
  referencePrice100g: z.number().int().safe().nonnegative().nullable(),
  image: z.discriminatedUnion("type", [
    z.object({ type: z.literal("notion_file"), pageId: sourceId }).strict(),
    z.object({ type: z.literal("external"), url: publicImageUrl }).strict(),
  ]).nullable(),
}).strict();

export const siteProductSourceSchema = z.object({
  sourceId, sourceVersion: z.string().datetime({ offset: true }),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  saleStatus: z.string().min(1).max(100).nullable(),
  displayOrder: z.number().finite().min(-Number.MAX_SAFE_INTEGER).max(Number.MAX_SAFE_INTEGER).nullable(),
  content: siteProductContentSchema,
  missingProperties: z.array(z.string().min(1).max(100)).max(30),
  missing: z.boolean(),
}).strict();
export type SiteProductSource = z.infer<typeof siteProductSourceSchema>;

/** A reference to the OLD site's Notion rule, not the new managed visibility.
 * Never use it as an order/stock/payment authorization or an auto-publish flag.
 */
export function notionSiteReferenceState(source: SiteProductSource): "listed_by_notion" | "not_listed_by_notion" | "unconfirmed" {
  const row = siteProductSourceSchema.parse(source);
  if (row.missing || row.saleStatus === null) return "unconfirmed";
  return row.saleStatus === "販売中" ? "listed_by_notion" : "not_listed_by_notion";
}

/** Deliberately separate the three meanings in the management UI. */
export type SiteProductManagementState = {
  source: SiteProductSource;
  siteVisibility: "unmanaged" | "visible" | "hidden";
  orderAcceptance: "not_connected" | "paused" | "accepting";
};
