import { NextResponse } from "next/server";
import { readBeanDisplays } from "@/features/shop/bean-display-server";

export const dynamic = "force-dynamic";

// Display text and image references only (no price, stock or credential), so a
// short shared cache is fine. Failures are never cached.
const okHeaders = { "Cache-Control": "public, max-age=60, s-maxage=60", "X-Content-Type-Options": "nosniff" };
const failHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export async function GET() {
  try {
    return NextResponse.json({ items: await readBeanDisplays() }, { headers: okHeaders });
  } catch {
    return NextResponse.json({ error: "BEAN_DISPLAY_UNAVAILABLE" }, { status: 503, headers: failHeaders });
  }
}
