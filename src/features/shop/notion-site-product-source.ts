import { createHash } from "node:crypto";
import { z } from "zod";
import { siteProductSourceSchema, type SiteProductSource } from "./site-product-view";

// Explicit public-product allowlist. Never spread arbitrary Notion properties
// (supplier details, purchase costs, contacts, credentials) into the catalog.
const fields = {
  name: "名前", origin: "エリア", farm: "農園・WS", variety: "品種",
  process: "生産処理", description: "コメント", fallbackDescription: "テキスト",
  roast: "焙煎度合", flavor: "フレーバー", region: "地域", altitude: "標高",
  referencePrice100g: "100g豆売売価", saleStatus: "EC販売ステータス",
  displayOrder: "表示順", image: "画像",
} as const;
export const notionSiteProductFieldNames: readonly string[] = Object.freeze(Object.values(fields));
const uuid = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i;
const time = z.string().datetime({ offset: true });
type RecordValue = Record<string, unknown>;
const fail = (code: string): never => { throw new Error(code); };
const record = (raw: unknown): RecordValue => raw !== null && typeof raw === "object" && !Array.isArray(raw) ? raw as RecordValue : fail("SITE_PRODUCT_SOURCE_INVALID");
export function canonicalSiteSourceId(raw: unknown) {
  if (typeof raw !== "string" || !uuid.test(raw)) return fail("SITE_PRODUCT_SOURCE_INVALID");
  const id = raw.replaceAll("-", "").toLowerCase();
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}
function fingerprint(value: Pick<SiteProductSource, "content" | "saleStatus" | "displayOrder" | "missingProperties">) {
  return createHash("sha256").update(JSON.stringify({ content: value.content, saleStatus: value.saleStatus, displayOrder: value.displayOrder, missingProperties: value.missingProperties })).digest("hex");
}

/** Server-supplied completeness evidence from property pagination, never a
 * provider field or browser input. No provider/network operation occurs here.
 */
export function parseNotionSiteProduct(raw: unknown, expectedDataSourceId: string, completeProperties: ReadonlySet<string> = new Set()): SiteProductSource {
  const page = record(raw), parent = record(page.parent), properties = record(page.properties);
  if (page.object !== "page" || page.archived !== false || page.in_trash !== false
    || parent.type !== "data_source_id" || canonicalSiteSourceId(parent.data_source_id) !== canonicalSiteSourceId(expectedDataSourceId)
    || !time.safeParse(page.last_edited_time).success) return fail("SITE_PRODUCT_SOURCE_INVALID");
  const sourceId = canonicalSiteSourceId(page.id), missingProperties: string[] = [];
  function property(key: keyof typeof fields): RecordValue | null {
    const name = fields[key];
    if (!Object.hasOwn(properties, name)) { missingProperties.push(name); return null; }
    return record(properties[name]);
  }
  function text(key: keyof typeof fields) {
    const prop = property(key); if (!prop) return "";
    if (prop.type === "select") {
      if (prop.select === null) return "";
      const name = record(prop.select).name;
      return typeof name === "string" && name.length <= 10000 ? name : fail("SITE_PRODUCT_SOURCE_INVALID");
    }
    if (prop.type === "multi_select") {
      if (!Array.isArray(prop.multi_select) || prop.multi_select.length > 100) return fail("SITE_PRODUCT_SOURCE_INVALID");
      const values = prop.multi_select.map(item => record(item).name);
      if (values.some(value => typeof value !== "string")) return fail("SITE_PRODUCT_SOURCE_INVALID");
      const joined = values.join("・"); return joined.length <= 10000 ? joined : fail("SITE_PRODUCT_SOURCE_INVALID");
    }
    if (prop.type !== "title" && prop.type !== "rich_text") return fail("SITE_PRODUCT_SOURCE_INVALID");
    const values = prop[prop.type];
    if (!Array.isArray(values) || values.length > 1000) return fail("SITE_PRODUCT_SOURCE_INVALID");
    if (!completeProperties.has(fields[key]) && (values.length >= 25 || values.some(value => record(value).type === "mention"))) return fail("SITE_PRODUCT_PROPERTY_READ_REQUIRED");
    const strings = values.map(value => record(value).plain_text);
    if (strings.some(value => typeof value !== "string")) return fail("SITE_PRODUCT_SOURCE_INVALID");
    const joined = strings.join(""); return joined.length <= 10000 ? joined : fail("SITE_PRODUCT_SOURCE_INVALID");
  }
  function number(key: "referencePrice100g" | "displayOrder") {
    const prop = property(key); if (!prop) return null;
    if (prop.type !== "number" || prop.number !== null && (typeof prop.number !== "number" || !Number.isFinite(prop.number))) return fail("SITE_PRODUCT_SOURCE_INVALID");
    return prop.number as number | null;
  }
  const statusProperty = property("saleStatus"); let saleStatus: string | null = null;
  if (statusProperty) {
    if (statusProperty.type !== "status") return fail("SITE_PRODUCT_SOURCE_INVALID");
    if (statusProperty.status !== null) {
      const name = record(statusProperty.status).name;
      if (typeof name !== "string" || !name.length || name.length > 100) return fail("SITE_PRODUCT_SOURCE_INVALID");
      saleStatus = name; // Preserve unknown states as data; never treat them as permission.
    }
  }
  const imageProperty = property("image"); let image: SiteProductSource["content"]["image"] = null;
  if (imageProperty) {
    if (imageProperty.type !== "files" || !Array.isArray(imageProperty.files) || imageProperty.files.length > 100) return fail("SITE_PRODUCT_SOURCE_INVALID");
    if (imageProperty.files.length) {
      const first = record(imageProperty.files[0]);
      if (first.type === "file") image = { type: "notion_file", pageId: sourceId }; // Never persist signed/expiring file URLs.
      else if (first.type === "external") {
        const url = record(first.external).url;
        if (typeof url !== "string") return fail("SITE_PRODUCT_SOURCE_INVALID");
        image = { type: "external", url };
      } else return fail("SITE_PRODUCT_SOURCE_INVALID");
    }
  }
  const name = text("name"), description = text("description"), fallbackDescription = text("fallbackDescription");
  const content = { name, origin: text("origin"), farm: text("farm"), variety: text("variety"), process: text("process"), description: description || fallbackDescription,
    roast: text("roast"), flavor: text("flavor"), region: text("region"), altitude: text("altitude"), referencePrice100g: number("referencePrice100g"), image };
  const displayOrder = number("displayOrder");
  // Validate first, then hash the same explicitly constructed representation.
  const parsed = siteProductSourceSchema.safeParse({ sourceId, sourceVersion: page.last_edited_time, fingerprint: "0".repeat(64), content, saleStatus, displayOrder, missingProperties, missing: false });
  if (!parsed.success) return fail("SITE_PRODUCT_SOURCE_INVALID");
  return { ...parsed.data, fingerprint: fingerprint(parsed.data) };
}

export interface NotionSiteProductReader {
  readPage(cursor?: string): Promise<{
    rows: readonly { page: unknown; completeProperties?: ReadonlySet<string> }[];
    hasMore: boolean; nextCursor: string | null;
  }>;
}

/** Full detached snapshot only; caller commits once after success. Missing
 * source rows retain their data. Nothing here changes managed publication,
 * EC prices/stock, Notion, or order acceptance. No credentials or network client.
 */
export async function prepareNotionSiteProducts(reader: NotionSiteProductReader, dataSourceId: string, previous: readonly SiteProductSource[] = []): Promise<SiteProductSource[]> {
  canonicalSiteSourceId(dataSourceId);
  if (previous.length > 500) return fail("SITE_PRODUCT_SOURCE_LIMIT");
  const prior = new Map<string, SiteProductSource>();
  for (const raw of previous) {
    const parsed = siteProductSourceSchema.safeParse(raw);
    if (!parsed.success || fingerprint(parsed.data) !== parsed.data.fingerprint || prior.has(parsed.data.sourceId)) return fail("SITE_PRODUCT_PREVIOUS_INVALID");
    prior.set(parsed.data.sourceId, parsed.data);
  }
  const result = new Map<string, SiteProductSource>(), cursors = new Set<string>();
  let cursor: string | undefined, bytes = 0;
  function add(row: SiteProductSource) {
    if (result.has(row.sourceId)) return fail("SITE_PRODUCT_DUPLICATE_SOURCE");
    bytes += Buffer.byteLength(JSON.stringify(row));
    if (result.size >= 500 || bytes > 2_000_000) return fail("SITE_PRODUCT_SOURCE_LIMIT");
    result.set(row.sourceId, row);
  }
  for (let n = 0; n < 10; n++) {
    let page: Awaited<ReturnType<NotionSiteProductReader["readPage"]>>;
    try { page = await reader.readPage(cursor); } catch { return fail("SITE_PRODUCT_SOURCE_READ_FAILED"); }
    if (!page || !Array.isArray(page.rows) || page.rows.length > 100 || typeof page.hasMore !== "boolean") return fail("SITE_PRODUCT_PAGINATION_INVALID");
    for (const raw of page.rows) {
      const row = parseNotionSiteProduct(raw.page, dataSourceId, raw.completeProperties), before = prior.get(row.sourceId);
      if (before) {
        const delta = Date.parse(row.sourceVersion) - Date.parse(before.sourceVersion);
        if (delta < 0 || delta === 0 && row.fingerprint !== before.fingerprint) return fail("SITE_PRODUCT_SOURCE_VERSION_CONFLICT");
      }
      add(row);
    }
    if (!page.hasMore) {
      if (page.nextCursor !== null) return fail("SITE_PRODUCT_PAGINATION_INVALID");
      for (const row of prior.values()) if (!result.has(row.sourceId)) add({ ...row, missing: true });
      return [...result.values()];
    }
    if (typeof page.nextCursor !== "string" || !page.nextCursor || page.nextCursor.length > 2000 || cursors.has(page.nextCursor)) return fail("SITE_PRODUCT_PAGINATION_INVALID");
    cursors.add(page.nextCursor); cursor = page.nextCursor;
  }
  return fail("SITE_PRODUCT_PAGINATION_LIMIT");
}
