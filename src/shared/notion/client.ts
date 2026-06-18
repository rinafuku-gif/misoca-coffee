import { Client } from "@notionhq/client";
import { z } from "zod";

// Notionクライアント（全機能で共有する単一インスタンス）
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * Notionレスポンスから組み立てたオブジェクトをスキーマで検証する。
 * 形が想定と違う（例: Notion側でプロパティ名が変わって空データになった等）場合は、
 * 静かに不正データを返さず、ログに残してnullを返す（呼び出し側でスキップ）。
 * これにより「Notion側の変更を本番で壊れる前に検知できる」状態にする。
 */
export function parseOrNull<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  label: string,
): T | null {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error(
      `[notion] ${label} の形が想定と違います（Notion側のプロパティ名変更の可能性）`,
      parsed.error.issues,
    );
    return null;
  }
  return parsed.data;
}

// ---- Notionプロパティ取り出しヘルパ（全機能共通） ---------------------------

export function getTitle(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "title") return "";
  const title = prop["title"] as Array<{ plain_text: string }>;
  return title?.[0]?.plain_text || "";
}

export function getRichText(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "rich_text") return "";
  const text = prop["rich_text"] as Array<{ plain_text: string }>;
  return text?.[0]?.plain_text || "";
}

export function getSelect(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "select") return "";
  const select = prop["select"] as { name: string } | null;
  return select?.name || "";
}

export function getMultiSelect(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "multi_select") return "";
  const options = prop["multi_select"] as Array<{ name: string }>;
  return options?.map((o) => o.name).join("・") || "";
}

export function getNumber(prop: Record<string, unknown> | undefined): number {
  if (!prop || prop["type"] !== "number") return 0;
  return (prop["number"] as number) || 0;
}

export function getDate(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "date") return "";
  const date = prop["date"] as { start: string } | null;
  return date?.start || "";
}

export function getFile(prop: Record<string, unknown> | undefined): string {
  if (!prop || prop["type"] !== "files") return "";
  const files = prop["files"] as Array<{
    type: string;
    file?: { url: string };
    external?: { url: string };
  }>;
  if (!files || files.length === 0) return "";
  const file = files[0];
  if (file.type === "file") return file.file?.url || "";
  if (file.type === "external") return file.external?.url || "";
  return "";
}
