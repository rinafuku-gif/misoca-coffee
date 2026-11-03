import { z } from "zod";
import type { SitePublicationReader } from "./site-publication-index";

/** Only this read capability is needed; no writer, native request context,
 * preview token, actor, cookie or admin-list capability is accepted.
 */
export interface PublishedContentRepository {
  findMany(collection: "product_notes", options: {
    where: { status: "published"; locale: "ja" }; limit: 100;
    orderBy: { field: "createdAt"; direction: "asc" }; cursor?: string;
  }): Promise<unknown>;
}
const responseSchema = z.object({
  items: z.array(z.object({ status: z.literal("published"), data: z.record(z.string(),z.unknown()) })).max(100),
  nextCursor: z.string().min(1).max(2000).optional(),
});

/** Pinned EmDash ContentRepository.findMany returns LIVE columns. Draft-aware
 * edits keep their unapproved values in the revision, not those columns.
 * This is verified against the real pinned repository in the native test;
 * do not replace it with an admin listing/getEmDashCollection in edit context.
 */
export function createPublishedSiteProductReader(repository: PublishedContentRepository): SitePublicationReader {
  return { async readPublishedPage(query) {
    if (query.collection!=="product_notes"||query.status!=="published"||query.limit!==100
      || query.cursor!==undefined && (typeof query.cursor!=="string"||!query.cursor.length||query.cursor.length>2000)) throw new Error("SITE_CATALOG_UNAVAILABLE");
    const parsed=responseSchema.safeParse(await repository.findMany("product_notes",{
      where:{status:"published",locale:"ja"},limit:100,orderBy:{field:"createdAt",direction:"asc"},...(query.cursor?{cursor:query.cursor}:{}),
    }));
    if (!parsed.success) throw new Error("SITE_CATALOG_UNAVAILABLE");
    return {
      entries:parsed.data.items.map(item=>({status:item.status,data:{notion_source_id:item.data.notion_source_id}})),
      hasMore:parsed.data.nextCursor!==undefined,nextCursor:parsed.data.nextCursor??null,
    };
  }};
}
