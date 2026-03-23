import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Notion画像プロキシ: pageIdとプロパティ名から最新の画像URLにリダイレクト
// Notionのfile型URLは約1時間で期限切れになるため、都度取得する
export async function GET(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get("pageId");
  const property = request.nextUrl.searchParams.get("property") || "画像";

  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const props = (page as Record<string, unknown>)["properties"] as Record<
      string,
      Record<string, unknown>
    >;
    const fileProp = props[property];

    if (!fileProp || fileProp["type"] !== "files") {
      return NextResponse.redirect(
        new URL("/images/menu/default-bean.jpg", request.url)
      );
    }

    const files = fileProp["files"] as Array<{
      type: string;
      file?: { url: string };
      external?: { url: string };
    }>;

    if (!files || files.length === 0) {
      return NextResponse.redirect(
        new URL("/images/menu/default-bean.jpg", request.url)
      );
    }

    const file = files[0];
    let imageUrl = "";
    if (file.type === "file") imageUrl = file.file?.url || "";
    if (file.type === "external") imageUrl = file.external?.url || "";

    if (!imageUrl) {
      return NextResponse.redirect(
        new URL("/images/menu/default-bean.jpg", request.url)
      );
    }

    // 短いキャッシュ（5分）で新鮮なURLを提供
    return NextResponse.redirect(imageUrl, {
      status: 302,
      headers: {
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
