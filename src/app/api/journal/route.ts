import { NextResponse } from "next/server";
import { readJournalList } from "@/features/journal/site-journal";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  try {
    const posts = await readJournalList();
    return NextResponse.json(posts, { headers });
  } catch {
    return NextResponse.json(
      { error: "ジャーナル記事の取得に失敗しました" },
      { status: 503, headers }
    );
  }
}
