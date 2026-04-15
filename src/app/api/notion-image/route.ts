import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// 許可するオリジン（自ドメイン）。環境変数末尾の改行を除去
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, ""),
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : undefined,
  "https://misoca-coffee.vercel.app",
  "https://misocacoffee.com",
  "https://www.misocacoffee.com",
  "http://localhost:3000",
].filter((o): o is string => Boolean(o));

// UUID（ハイフン有無両対応）の形式検証
const UUID_REGEX = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

function isAllowedRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin") ?? "";
  const referer = request.headers.get("referer") ?? "";
  const combined = origin || referer;

  // Origin/Refererなし（Next.js Image Optimizer内部fetchなど）は許容。
  // pageIdのUUID検証とNotion API側の存在検証で保護する
  if (!combined) return true;

  return ALLOWED_ORIGINS.some((allowed) => combined.startsWith(allowed));
}

// Notion画像プロキシ: pageIdから画像データを直接返す（パススルー方式）
// Next.js Image最適化と互換性を保つため、リダイレクトではなく画像データを返す
export async function GET(request: NextRequest) {
  if (!isAllowedRequest(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const pageId = request.nextUrl.searchParams.get("pageId");
  const property = request.nextUrl.searchParams.get("property") || "画像";

  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 });
  }

  // UUID形式チェック（ランダム入力によるNotion API叩きを抑止）
  if (!UUID_REGEX.test(pageId)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const imageUrl = await resolveNotionImageUrl(pageId, property);

    if (!imageUrl) {
      return NextResponse.redirect(
        new URL("/images/menu/default-bean.jpg", request.url)
      );
    }

    // 画像データをフェッチしてパススルー
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
