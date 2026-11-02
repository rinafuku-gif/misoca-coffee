import { NextRequest } from "next/server";
import { publicImageResponse } from "@/shared/notion/public-image";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ pageId: string }> }) {
  return publicImageResponse(request, (await params).pageId);
}
