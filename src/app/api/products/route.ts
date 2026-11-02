import { NextResponse } from "next/server";
import { getProducts } from "@/features/shop/notion";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return NextResponse.json({ error: "商品データを読み込めませんでした" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const products = await getProducts();
    return NextResponse.json(products,{headers:{'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json(
      { error: "商品データの取得に失敗しました" },
      { status: 503,headers:{'Cache-Control':'no-store'} }
    );
  }
}
