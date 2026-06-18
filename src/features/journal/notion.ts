import { z } from "zod";
import {
  notion,
  parseOrNull,
  getTitle,
  getRichText,
  getSelect,
  getDate,
  getFile,
} from "@/shared/notion/client";

const journalDbId = process.env.NOTION_JOURNAL_DB_ID || "";

// スキーマを「型の真実の源」にする（手書きinterfaceを廃止し z.infer で型を導出）
export const JournalPostSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  status: z.string(),
  date: z.string(),
  excerpt: z.string(),
  coverImage: z.string(),
});
export type JournalPost = z.infer<typeof JournalPostSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotionBlock = Record<string, any>;

export async function getJournalPosts(): Promise<JournalPost[]> {
  if (!process.env.NOTION_API_KEY || !journalDbId) {
    return [];
  }

  const response = await notion.dataSources.query({
    data_source_id: journalDbId,
    filter: {
      property: "ステータス",
      select: {
        equals: "公開",
      },
    },
    sorts: [
      {
        property: "公開日",
        direction: "descending",
      },
    ],
  });

  return response.results
    .map((page: unknown) => {
      const pageObj = page as Record<string, unknown>;
      const props = pageObj["properties"] as Record<string, Record<string, unknown>>;
      const pageId = pageObj["id"] as string;

      // カバー画像の取得: 1) プロパティ「カバー画像」 2) ページカバー（page.cover）
      const coverImage = resolveJournalCoverImage(pageId, props, pageObj);

      return {
        id: pageId,
        title: getTitle(props["タイトル"]),
        category: getSelect(props["カテゴリ"]),
        status: getSelect(props["ステータス"]),
        date: getDate(props["公開日"]),
        excerpt: getRichText(props["抜粋"]),
        coverImage,
      };
    })
    .map((raw) => parseOrNull(JournalPostSchema, raw, "ジャーナル記事"))
    .filter((p): p is JournalPost => p !== null);
}

export async function getJournalPostById(id: string): Promise<JournalPost | null> {
  if (!process.env.NOTION_API_KEY) return null;

  try {
    const page = await notion.pages.retrieve({ page_id: id }) as Record<string, unknown>;
    const props = page["properties"] as Record<string, Record<string, unknown>>;
    const pageId = page["id"] as string;

    return parseOrNull(
      JournalPostSchema,
      {
        id: pageId,
        title: getTitle(props["タイトル"]),
        category: getSelect(props["カテゴリ"]),
        status: getSelect(props["ステータス"]),
        date: getDate(props["公開日"]),
        excerpt: getRichText(props["抜粋"]),
        coverImage: resolveJournalCoverImage(pageId, props, page),
      },
      "ジャーナル記事",
    );
  } catch {
    return null;
  }
}

export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!process.env.NOTION_API_KEY) return [];

  const blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(response.results as NotionBlock[]));
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

function resolveJournalCoverImage(
  pageId: string,
  props: Record<string, Record<string, unknown>>,
  pageObj: Record<string, unknown>,
): string {
  // 1) プロパティ「カバー画像」から取得
  const fileProp = props["カバー画像"];
  const directUrl = getFile(fileProp);
  if (directUrl) {
    // external型（Google Drive等の永続URL）はそのまま使う
    if (
      fileProp &&
      fileProp["type"] === "files" &&
      (fileProp["files"] as Array<{ type: string }>)?.[0]?.type === "external"
    ) {
      return directUrl;
    }
    // Notion file型はプロキシ経由（クエリパラメータなし）
    return `/api/notion-image/${pageId}`;
  }

  // 2) ページカバー（page.cover）から取得
  const cover = pageObj["cover"] as Record<string, unknown> | undefined;
  if (cover) {
    if (cover["type"] === "external") {
      const ext = cover["external"] as { url: string } | undefined;
      if (ext?.url) return ext.url;
    }
    if (cover["type"] === "file") {
      // プロキシが自動的にページカバーを検出する
      return `/api/notion-image/${pageId}`;
    }
  }

  return "";
}
