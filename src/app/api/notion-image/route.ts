import { NextRequest } from "next/server";
import { publicImageResponse } from "@/shared/notion/public-image";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return publicImageResponse(request, request.nextUrl.searchParams.get("pageId"), request.nextUrl.searchParams.get("property") || undefined);
}
