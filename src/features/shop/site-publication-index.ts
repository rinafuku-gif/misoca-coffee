import { z } from "zod";
import { boundedExternal } from "./ledger/timeout";

const uuid = z.string().regex(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
export const sitePublicationIndexSchema = z.object({
  format: z.literal(1), sourceIds: z.array(uuid).max(500),
}).strict().refine(value => new Set(value.sourceIds).size === value.sourceIds.length);
export type SitePublicationIndex = z.infer<typeof sitePublicationIndexSchema>;

/** The adapter MUST read actual published revision values, never an admin
 * listing or a request in edit/preview mode. No actor/cookies reach this port.
 */
export interface SitePublicationReader {
  readPublishedPage(query: { collection: "product_notes"; status: "published"; limit: 100; cursor?: string }): Promise<unknown>;
}
const pageSchema = z.object({
  entries: z.array(z.object({ status: z.literal("published"), data: z.record(z.string(), z.unknown()) })).max(100),
  hasMore: z.boolean(), nextCursor: z.string().min(1).max(2000).nullable(),
});
const fail = (): never => { throw new Error("SITE_CATALOG_UNAVAILABLE"); };
export type SiteSelectionIssue = {
  code: "invalid_cms_mapping" | "duplicate_cms_mapping" | "invalid_source_id" | "duplicate_source_id" | "missing_source";
  sourceId?: string;
  row?: number;
};

/** No CMS IDs, drafts, text, price or inventory escape this projection. A
 * Per-item mapping failures exclude that item (all copies of a duplicate),
 * not unrelated products. Structural/pagination failures still fail closed.
 * Diagnostics are for the authenticated admin only, never the public index.
 */
export async function inspectSitePublicationIndex(reader: SitePublicationReader): Promise<{ index: SitePublicationIndex; issues: SiteSelectionIssue[] }> {
  const ids = new Set<string>(), duplicates = new Set<string>(), seen = new Set<string>();
  const issues: SiteSelectionIssue[] = []; let cursor: string | undefined, rows = 0;
  for (let n = 0; n < 10; n++) {
    let raw: unknown;
    try { raw = await reader.readPublishedPage({ collection: "product_notes", status: "published", limit: 100, ...(cursor ? { cursor } : {}) }); } catch { return fail(); }
    const parsed = pageSchema.safeParse(raw); if (!parsed.success) return fail();
    for (const entry of parsed.data.entries) {
      if (++rows > 500) return fail();
      const id = uuid.safeParse(entry.data.notion_source_id);
      if (!id.success) { issues.push({code:"invalid_cms_mapping",row:rows}); continue; }
      if (ids.has(id.data)) {
        if (!duplicates.has(id.data)) issues.push({code:"duplicate_cms_mapping",sourceId:id.data});
        duplicates.add(id.data); continue;
      }
      ids.add(id.data);
    }
    if (!parsed.data.hasMore) {
      if (parsed.data.nextCursor !== null) return fail();
      return { index: { format: 1, sourceIds: [...ids].filter(id=>!duplicates.has(id)).sort() }, issues };
    }
    if (!parsed.data.nextCursor || seen.has(parsed.data.nextCursor)) return fail();
    cursor = parsed.data.nextCursor; seen.add(cursor);
  }
  return fail();
}
export async function buildSitePublicationIndex(reader: SitePublicationReader): Promise<SitePublicationIndex> {
  return (await inspectSitePublicationIndex(reader)).index;
}

const publicHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
/** Unmounted handler: mounting it is a separately reviewed publication change.
 * No credential forwarding, CORS credentials, preview parameters, fallback,
 * or mutation. The caller owns the reviewed public-only CMS adapter.
 */
export function createSitePublicationIndexHandler(reader: SitePublicationReader, siteOrigin: string, assertReady:()=>Promise<void>) {
  let origin: URL;
  try { origin = new URL(siteOrigin); } catch { throw new Error("SITE_CATALOG_CONFIG_INVALID"); }
  if (origin.protocol !== "https:" || origin.origin !== siteOrigin || typeof assertReady!=="function") throw new Error("SITE_CATALOG_CONFIG_INVALID");
  return async (request: Request) => {
    const url = new URL(request.url);
    if (url.origin !== siteOrigin || url.pathname !== "/api/site-products/index") return new Response(null,{ status:404,headers:publicHeaders });
    if (request.method !== "GET") return new Response(null,{ status:405,headers:{...publicHeaders,allow:"GET"} });
    if (url.search || request.headers.has("cookie") || request.headers.has("authorization")) return Response.json({error:"PUBLIC_READ_ONLY"},{status:400,headers:publicHeaders});
    try { return Response.json(await boundedExternal(async()=>{await assertReady();return buildSitePublicationIndex(reader);},5000),{headers:publicHeaders}); }
    catch { return Response.json({error:"SITE_CATALOG_UNAVAILABLE"},{status:503,headers:publicHeaders}); }
  };
}

/** A server-side consumer. Any network/schema failure is an error, never a
 * reason to reactivate the old Notion-sale-status filter or return empty data.
 */
export async function readSitePublicationIndex(send: typeof fetch, endpoint: string, timeoutMs = 5000): Promise<SitePublicationIndex> {
  let url: URL;
  try { url = new URL(endpoint); } catch { return fail(); }
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/api/site-products/index" || url.search || url.hash
    || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) return fail();
  const abort = new AbortController(), timer = setTimeout(() => abort.abort(),timeoutMs);
  try {
    return await boundedExternal(async () => {
    const response = await send(url.href,{method:"GET",credentials:"omit",redirect:"manual",cache:"no-store",signal:abort.signal});
    if (!response.ok || !response.body) { await response.body?.cancel(); return fail(); }
    const body = response.body.getReader(), decoder = new TextDecoder(); let text = "", bytes = 0;
    try {
      for (;;) { const row = await body.read(); if (row.done) break; bytes += row.value.byteLength; if (bytes > 32768 || abort.signal.aborted) { await body.cancel(); return fail(); } text += decoder.decode(row.value,{stream:true}); }
      text += decoder.decode();
    } finally { body.releaseLock(); }
    if (abort.signal.aborted) return fail();
    const parsed = sitePublicationIndexSchema.safeParse(JSON.parse(text)); return parsed.success ? parsed.data : fail();
    },timeoutMs);
  } catch { return fail(); } finally { abort.abort(); clearTimeout(timer); }
}

/** Notion supplies page data, EmDash alone selects visibility. Source values
 * and their order are retained, including a legacy sale state of "完売".
 * Input MUST be the full source read, not the legacy 販売中-only query.
 */
export function selectSiteProducts<T extends { id: string }>(source: readonly T[], rawIndex: unknown): T[] {
  return inspectSiteProductSelection(source,rawIndex).products;
}
/** Same reconciliation for the private admin and the public consumer. Missing
 * or ambiguous individual rows are omitted with an inspectable admin reason.
 * The public consumer returns only products; no internal diagnostics escape.
 */
export function inspectSiteProductSelection<T extends { id: string }>(source: readonly T[], rawIndex: unknown): {products:T[];issues:SiteSelectionIssue[]} {
  const parsed = sitePublicationIndexSchema.safeParse(rawIndex); if (!parsed.success) return fail();
  if(source.length>500)return fail();
  const wanted = new Set(parsed.data.sourceIds), found = new Set<string>(), duplicates = new Set<string>();
  const issues:SiteSelectionIssue[]=[];
  source.forEach((item,row)=>{
    const id = uuid.safeParse(item.id);
    if(!id.success){issues.push({code:"invalid_source_id",row:row+1});return;}
    if(found.has(id.data)){
      if(!duplicates.has(id.data))issues.push({code:"duplicate_source_id",sourceId:id.data});
      duplicates.add(id.data);
    }
    found.add(id.data);
  });
  for(const id of wanted){
    if(!found.has(id))issues.push({code:"missing_source",sourceId:id});
  }
  return {products:source.filter(item=>wanted.has(item.id)&&!duplicates.has(item.id)),issues};
}
