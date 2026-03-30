import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Notion画像プロキシ: /api/notion-image/[pageId]
// クエリパラメータ不要。以下の順序で画像を自動検索:
// 1. プロパティ「画像」（商品用）
// 2. プロパティ「カバー画像」（ジャーナル用）
// 3. ページカバー（page.cover）
// 4. ブロック画像（pageIdがブロックIDの場合）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;

  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  try {
    const imageUrl = await resolveImageUrl(pageId);

    if (!imageUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Failed to fetch Notion image:", error);
    return new NextResponse(null, { status: 404 });
  }
}

async function resolveImageUrl(id: string): Promise<string | null> {
  // まずページとして取得を試みる
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    const pageObj = page as Record<string, unknown>;
    const props = pageObj["properties"] as Record<string, Record<string, unknown>> | undefined;

    // 1. プロパティ「画像」
    if (props) {
      const url = extractFileUrl(props["画像"]);
      if (url) return url;
    }

    // 2. プロパティ「カバー画像」
    if (props) {
      const url = extractFileUrl(props["カバー画像"]);
      if (url) return url;
    }

    // 3. ページカバー
    const cover = pageObj["cover"] as Record<string, unknown> | undefined;
    if (cover) {
      if (cover["type"] === "file") {
        const file = cover["file"] as { url: string } | undefined;
        if (file?.url) return file.url;
      }
      if (cover["type"] === "external") {
        const ext = cover["external"] as { url: string } | undefined;
        if (ext?.url) return ext.url;
      }
    }
  } catch {
    // ページとして取得できなかった場合、ブロックとして試みる
  }

  // 4. ブロック画像
  try {
    const block = await notion.blocks.retrieve({ block_id: id }) as Record<string, unknown>;
    const image = block["image"] as Record<string, unknown> | undefined;
    if (image) {
      if (image["type"] === "file") {
        const file = image["file"] as { url: string } | undefined;
        if (file?.url) return file.url;
      }
      if (image["type"] === "external") {
        const ext = image["external"] as { url: string } | undefined;
        if (ext?.url) return ext.url;
      }
    }
  } catch {
    // ブロックとしても取得できなかった
  }

  return null;
}

function extractFileUrl(prop: Record<string, unknown> | undefined): string | null {
  if (!prop || prop["type"] !== "files") return null;
  const files = prop["files"] as Array<{
    type: string;
    file?: { url: string };
    external?: { url: string };
  }>;
  if (!files || files.length === 0) return null;
  const file = files[0];
  if (file.type === "file") return file.file?.url || null;
  if (file.type === "external") return file.external?.url || null;
  return null;
}
