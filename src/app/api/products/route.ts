import { NextResponse } from "next/server";
import { getProducts } from "@/lib/notion";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products from Notion:", error);
    return NextResponse.json(
      { error: "商品データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
