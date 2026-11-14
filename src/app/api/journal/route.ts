import { NextResponse } from "next/server";
import { getJournalPosts } from "@/features/journal/notion";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const posts = await getJournalPosts();
    return NextResponse.json(posts, { headers });
  } catch {
    return NextResponse.json(
      { error: "ジャーナル記事の取得に失敗しました" },
      { status: 503, headers }
    );
  }
}
