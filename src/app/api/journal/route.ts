import { NextResponse } from "next/server";
import { getJournalPosts } from "@/features/journal/notion";

export const revalidate = 60;

export async function GET() {
  try {
    const posts = await getJournalPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch journal posts from Notion:", error);
    return NextResponse.json(
      { error: "ジャーナル記事の取得に失敗しました" },
      { status: 500 }
    );
  }
}
