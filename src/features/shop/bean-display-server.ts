// Server only. Read-only: no Notion write, no price, stock or order decision.
import { notion } from "@/shared/notion/client";
import { boundedExternal } from "./ledger/timeout";
import { readNotionProductFields } from "./notion-product-fields";
import { beanDisplaySchema, type BeanDisplay } from "./bean-display";

const FIXED_PRODUCT_SOURCE = "db3bf8892b8544cf9cb50c8403d283c9";
export const BEAN_DISPLAY_TIMEOUT_MS = 8000;
export const BEAN_DISPLAY_REUSE_MS = 60000;
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
const pageId = (value: unknown): string | null => typeof value === "string" && /^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(value) ? value.replace(/-/g, "").toLowerCase() : null;
const fail = (): never => { throw new Error("BEAN_DISPLAY_UNAVAILABLE"); };

/** Same configuration guard as getProducts(): an unknown authority, a missing
 * key or (under EmDash) any other product source than the fixed one reads nothing. */
function productSource(): string {
  const authority = process.env.MISOCA_SITE_VISIBILITY_AUTHORITY ?? "notion";
  if (authority !== "notion" && authority !== "emdash") return fail();
  const source = pageId(process.env.NOTION_DATABASE_ID?.trim());
  if (!process.env.NOTION_API_KEY || !source || authority === "emdash" && source !== FIXED_PRODUCT_SOURCE) return fail();
  return source;
}

/** One live page of the product source whose EC販売ステータス is 販売中. The
 * query filter asks for that already; it is checked again here per page. */
function sellingPage(raw: unknown, source: string): { id: string; props: Record<string, RecordValue> } | null {
  const page = record(raw), parent = record(page?.parent), props = record(page?.properties);
  if (!page || !props || page.object !== "page" || page.in_trash !== false || page.archived !== false && page.archived !== undefined) return null;
  if (parent?.type !== "data_source_id" || pageId(parent.data_source_id) !== source) return null;
  const sale = record(props["EC販売ステータス"]);
  if (sale?.type !== "status" || record(sale.status)?.name !== "販売中") return null;
  const id = pageId(page.id); return id ? { id, props: props as Record<string, RecordValue> } : null;
}

export async function readSellingBeanDisplays(): Promise<BeanDisplay[]> {
  const source = productSource();
  const response = record(await boundedExternal(() => notion.dataSources.query({
    data_source_id: source, page_size: 100,
    filter: { property: "EC販売ステータス", status: { equals: "販売中" } },
    sorts: [{ property: "表示順", direction: "ascending" }],
  }), BEAN_DISPLAY_TIMEOUT_MS));
  if (!response || !Array.isArray(response.results)) return fail();
  const seen = new Set<string>(), items: BeanDisplay[] = [];
  for (const raw of response.results.slice(0, 100)) {
    const page = sellingPage(raw, source); if (!page || seen.has(page.id)) continue;
    const fields = readNotionProductFields(page.id, page.props);
    // Only a Notion-hosted file goes through the checked image route; an
    // external URL is not shown (it is not an allowed image source here).
    const parsed = beanDisplaySchema.safeParse({ ...fields, image: fields.image === `/api/notion-image/${page.id}` ? fields.image : "" });
    if (parsed.success) { seen.add(page.id); items.push(parsed.data); }
  }
  return items;
}

/** Reuses one successful read for a minute inside a process; concurrent
 * requests share one Notion call. Failures are never kept. */
export function createBeanDisplayReader(read: () => Promise<BeanDisplay[]> = readSellingBeanDisplays, now: () => number = () => Date.now()) {
  let kept: { at: number; items: BeanDisplay[] } | null = null;
  let pending: Promise<BeanDisplay[]> | null = null;
  return async (): Promise<BeanDisplay[]> => {
    const at = now();
    if (kept && at >= kept.at && at - kept.at < BEAN_DISPLAY_REUSE_MS) return structuredClone(kept.items);
    pending ??= read().then(items => { kept = { at: now(), items: structuredClone(items) }; return items; }).finally(() => { pending = null; });
    return structuredClone(await pending);
  };
}
export const readBeanDisplays = createBeanDisplayReader();
