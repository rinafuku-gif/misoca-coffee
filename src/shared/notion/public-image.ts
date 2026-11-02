import { NextRequest, NextResponse } from "next/server";
import { notion } from "./client";
import {readSitePublicationIndex} from '@/features/shop/site-publication-index';

const LIMIT = 8 * 1024 * 1024;
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; sandbox" };
const id = (value: unknown): string | null => typeof value === "string" && /^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(value) ? value.replace(/-/g, "").toLowerCase() : null;
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | null => value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;
const live = (value: RecordValue) => value.in_trash === false && (value.archived === false || value.archived === undefined) && (value.is_archived === false || value.is_archived === undefined);
async function publicKind(page: RecordValue): Promise<"product" | "journal" | null> {
  const product = id(process.env.NOTION_DATABASE_ID?.trim()), journal = id(process.env.NOTION_JOURNAL_DB_ID?.trim());
  const parent = record(page.parent), props = record(page.properties);
  if (!live(page) || page.object !== "page" || !id(page.id) || !props || parent?.type !== "data_source_id" || product && product === journal) return null;
  const source = id(parent.data_source_id), sale = record(props["EC販売ステータス"]), publication = record(props["ステータス"]);
  if(product&&source===product){
    const authority=process.env.MISOCA_SITE_VISIBILITY_AUTHORITY??'notion';
    if(authority==='emdash'){
      if(product!=='db3bf8892b8544cf9cb50c8403d283c9'||!process.env.MISOCA_SITE_PRODUCT_INDEX_URL)return null;
      const index=await readSitePublicationIndex(fetch,process.env.MISOCA_SITE_PRODUCT_INDEX_URL);
      return index.sourceIds.some(sourceId=>id(sourceId)===id(page.id))?'product':null;
    }
    if(authority==='notion'&&sale?.type==='status'&&record(sale.status)?.name==='販売中')return 'product';
    return null;
  }
  if (journal && source === journal && publication?.type === "select" && record(publication.select)?.name === "公開") return "journal";
  return null;
}
function fileUrl(value: unknown): string | null {
  const object = record(value);
  if (object?.type !== "file") return null; // External URLs do not grant server-fetch permission.
  const file = record(object.file); return typeof file?.url === "string" ? file.url : null;
}
function propertyUrl(props: RecordValue, name: string): string | null {
  const prop = record(props[name]); return prop?.type === "files" && Array.isArray(prop.files) ? fileUrl(prop.files[0]) : null;
}
function allowedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return null;
    if (url.hostname === "prod-files-secure.s3.us-west-2.amazonaws.com") return url.href;
    if (["s3.us-west-2.amazonaws.com", "s3-us-west-2.amazonaws.com"].includes(url.hostname) && url.pathname.startsWith("/secure.notion-static.com/")) return url.href;
  } catch { /* Never log signed URLs. */ }
  return null;
}
function allowedRequest(request: NextRequest): boolean {
  const origins = new Set(["https://misoca-coffee.vercel.app", "https://misocacoffee.com", "https://www.misocacoffee.com", "http://localhost:3000"]);
  for (const value of [process.env.NEXT_PUBLIC_BASE_URL, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : undefined]) {
    try { if (value) { const url = new URL(value.trim()); if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) origins.add(url.origin); } } catch { /* Invalid configuration grants nothing. */ }
  }
  // Missing browser headers is allowed for public assets, not an authorization.
  for (const name of ["origin", "referer"]) {
    const value = request.headers.get(name); if (!value) continue;
    try { const url = new URL(value); if (url.username || url.password || !origins.has(url.origin)) return false; } catch { return false; }
  }
  return true;
}
async function pageById(value: string): Promise<RecordValue | null> {
  const page = record(await notion.pages.retrieve({ page_id: value })); return page && id(page.id) === id(value) ? page : null;
}
async function resolveImage(value: string, property?: string): Promise<{ url: string; root: string; kind: "product" | "journal" } | null> {
  let page: RecordValue | null;
  try { page = await pageById(value); } catch { page = null; }
  if (page) {
    const kind = await publicKind(page), props = record(page.properties); if (!kind || !props) return null;
    const expected = kind === "product" ? "画像" : "カバー画像"; if (property && property !== expected) return null;
    const candidate = propertyUrl(props, expected) || (!property && kind === "journal" ? fileUrl(page.cover) : null);
    const url = candidate && allowedUrl(candidate); return url ? { url, root: value, kind } : null;
  }
  if (property) return null;
  // A block must end in a public article through at most eight live ancestors.
  const visited = new Set<string>(); let current = value, candidate: string | null = null;
  for (let depth = 0; depth < 8; depth++) {
    const normalized = id(current); if (!normalized || visited.has(normalized)) return null; visited.add(normalized);
    const block = record(await notion.blocks.retrieve({ block_id: current })); if (!block || id(block.id) !== normalized || !live(block)) return null;
    if (depth === 0) { if (block.type !== "image") return null; candidate = fileUrl(block.image); if (!candidate || !allowedUrl(candidate)) return null; }
    const parent = record(block.parent);
    if (parent?.type === "page_id" && id(parent.page_id)) {
      const root = parent.page_id as string, rootPage = await pageById(root);
      return rootPage && await publicKind(rootPage) === "journal" ? { url: allowedUrl(candidate!)!, root, kind: "journal" } : null;
    }
    if (parent?.type !== "block_id" || !id(parent.block_id)) return null;
    current = parent.block_id as string;
  }
  return null;
}
async function boundedImage(response: Response): Promise<Uint8Array | null> {
  const length = response.headers.get("content-length"); if (length && (!/^\d+$/.test(length) || Number(length) > LIMIT)) { await response.body?.cancel(); return null; }
  const reader = response.body?.getReader(); if (!reader) return null;
  const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > LIMIT) { await reader.cancel(); return null; } chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; } return bytes;
}
function matchesType(bytes: Uint8Array, type: string): boolean {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (type === "image/png") return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === "image/gif") return ["GIF87a", "GIF89a"].includes(ascii(0, 6));
  if (type === "image/webp") return bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  return false;
}
export async function publicImageResponse(request: NextRequest, value: string | null, property?: string): Promise<NextResponse> {
  const reject = (status = 404) => new NextResponse(null, { status, headers });
  if (!allowedRequest(request)) return reject(403);
  if (!id(value) || !process.env.NOTION_API_KEY || !id(process.env.NOTION_DATABASE_ID?.trim()) && !id(process.env.NOTION_JOURNAL_DB_ID?.trim()) || property && !["画像", "カバー画像"].includes(property)) return reject();
  try {
    const resolved = await resolveImage(value!, property); if (!resolved) return reject();
    const image = await fetch(resolved.url, { redirect: "error", cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(8000), headers: { Accept: "image/png,image/jpeg,image/gif,image/webp" } });
    const type = image.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
    if (!image.ok || !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(type)) { await image.body?.cancel(); return reject(); }
    const bytes = await boundedImage(image); if (!bytes || !matchesType(bytes, type)) return reject();
    const current = await resolveImage(value!, property);
    if (!current || id(current.root) !== id(resolved.root) || current.kind !== resolved.kind || new URL(current.url).origin !== new URL(resolved.url).origin || new URL(current.url).pathname !== new URL(resolved.url).pathname) return reject();
    return new NextResponse(new Uint8Array(bytes), { status: 200, headers: { ...headers, "Content-Type": type } });
  } catch { return reject(); }
}
