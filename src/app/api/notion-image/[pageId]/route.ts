import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Notion画像プロキシ: /api/notion-image/[pageId] でパスベースアクセス
// Next.js Image最適化と互換性を保つため、画像データを直接返す
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params;
  const property =
    request.nextUrl.searchParams.get("property") || "画像";

  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  try {
    const imageUrl = await resolveNotionImageUrl(pageId, property);

    if (!imageUrl) {
      return NextResponse.redirect(
        new URL("/images/menu/default-bean.jpg", request.url)
      );
    }

    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.redirect(
        new URL("/images/menu/default-bean.jpg", request.url)
      );
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
    return NextResponse.redirect(
      new URL("/images/menu/default-bean.jpg", request.url)
    );
  }
}

async function resolveNotionImageUrl(
  pageId: string,
  property: string
): Promise<string | null> {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const props = (page as Record<string, unknown>)["properties"] as Record<
    string,
    Record<string, unknown>
  >;
  const fileProp = props[property];

  if (!fileProp || fileProp["type"] !== "files") return null;

  const files = fileProp["files"] as Array<{
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
