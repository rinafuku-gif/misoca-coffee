import { z } from "zod";
import { getJournalPostById, getJournalPosts, getPageBlocks, type JournalPost, type NotionBlock } from "./notion";
import { isJournalId, isJournalMediaId, journalMediaPath, journalPath } from "./emdash-public";
import { portableJournalBlocks } from "./portable-journal";

const publicPost = z.object({ id: z.string().refine(isJournalId), title: z.string(), category: z.string(), date: z.string(),
  excerpt: z.string(), cover: z.string().refine(isJournalMediaId).nullable() });
const publicDetail = publicPost.extend({ content: z.array(z.unknown()).max(1000) });

export const usesEmDashJournal = () => process.env.MISOCA_JOURNAL_SOURCE === "emdash";

async function readCMS(path: string) {
  const fixture = !process.env.VERCEL && process.env.MISOCA_JOURNAL_LOCAL_FIXTURE === "1";
  const origin = fixture ? "http://localhost:4381" : "https://misoca-management.misocacoffee.workers.dev";
  return fetch(origin + journalPath + path, {
    method: "GET", redirect: "error", credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(6500),
  });
}

function toPost(row: z.infer<typeof publicPost>): JournalPost {
  return { id: row.id, title: row.title, category: row.category, date: row.date, excerpt: row.excerpt, status: "公開",
    coverImage: row.cover ? journalMediaPath(row.id, row.cover) : "" };
}

export async function readJournalList() {
  if (!usesEmDashJournal()) return getJournalPosts();
  const response = await readCMS("");
  if (!response.ok) throw new Error("JOURNAL_UNAVAILABLE");
  return z.array(publicPost).max(500).parse(await response.json()).map(toPost);
}

export async function readEmDashArticle(id: string) {
  if (!isJournalId(id)) return null;
  const response = await readCMS("/" + id);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("JOURNAL_UNAVAILABLE");
  const result = publicDetail.parse(await response.json());
  if (result.id !== id) throw new Error("JOURNAL_INVALID_RESPONSE");
  return { post: toPost(result), blocks: portableJournalBlocks(result.content, id) };
}

export async function readJournalMetadata(id: string) {
  if (!usesEmDashJournal()) return getJournalPostById(id);
  return (await readEmDashArticle(id))?.post ?? null;
}

export async function readJournalArticle(id: string): Promise<{ post: JournalPost; blocks: NotionBlock[] } | null> {
  if (usesEmDashJournal()) return readEmDashArticle(id);
  const post = await getJournalPostById(id);
  if (!post) return null;
  const blocks = await getPageBlocks(id);
  return await getJournalPostById(id) ? { post, blocks } : null;
}

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
export async function readJournalImage(article: string, image: string): Promise<Response> {
  const headers = { "cache-control": "private, no-store", "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; sandbox", "x-robots-tag": "noindex" };
  if (!usesEmDashJournal() || !isJournalId(article) || !isJournalMediaId(image)) return new Response(null, { status: 404, headers });
  try {
    const response = await readCMS("/" + article + "/media/" + image);
    const type = response.headers.get("content-type") || "";
    const rawLength = response.headers.get("content-length") || "";
    const size = Number(rawLength);
    if (!response.ok || !imageTypes.has(type) || !/^\d+$/.test(rawLength) || size <= 0 || size > 1_000_000) {
      await response.body?.cancel();
      return new Response(null, { status: response.status === 503 ? 503 : 404, headers });
    }
    return new Response(response.body, { headers: { ...headers, "content-type": type, "content-length": rawLength } });
  } catch {
    return new Response(null, { status: 503, headers });
  }
}
