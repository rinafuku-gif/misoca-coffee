import { NextRequest } from "next/server";
import { publicImageResponse } from "@/shared/notion/public-image";
import { legacyJournalPhotoId } from "@/features/journal/emdash-public";
import { readEmDashArticle, usesEmDashJournal } from "@/features/journal/site-journal";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  if (usesEmDashJournal() && pageId.replace(/-/g, "").toLowerCase() === legacyJournalPhotoId.replace(/-/g, "")) {
    const headers = { "cache-control": "private, no-store" };
    try {
      const url = (await readEmDashArticle(legacyJournalPhotoId))?.post.coverImage;
      return url ? new Response(null, { status: 307, headers: { ...headers, location: url } }) : new Response(null, { status: 404, headers });
    } catch {
      return new Response(null, { status: 503, headers });
    }
  }
  return publicImageResponse(request, pageId);
}
