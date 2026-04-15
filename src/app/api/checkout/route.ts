import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProducts } from "@/lib/notion";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const GIFT_TICKET_IDS = ["gift-roasting-experience"];
const GIFT_TICKET_PRICE = 8800;

export async function POST(request: NextRequest) {
  try {
    const { items } = (await request.json()) as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "カートが空です" },
        { status: 400 }
      );
    }

    const baseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL?.trim()
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}` : null)
      || "https://misoca-coffee.vercel.app"
    ).replace(/\/$/, "");

    // サーバー側で正規価格を取得し、クライアントの価格は無視する
    const products = await getProducts();
    const productPriceMap = new Map(products.map((p) => [p.id, p.price]));

    const verifiedItems: Array<CartItem & { verifiedPrice: number }> = [];
    for (const item of items) {
      if (GIFT_TICKET_IDS.includes(item.id)) {
        verifiedItems.push({ ...item, verifiedPrice: GIFT_TICKET_PRICE });
        continue;
      }
      const realPrice = productPriceMap.get(item.id);
      if (realPrice === undefined) {
        return NextResponse.json(
          { error: `商品「${item.name}」は現在販売されていません` },
          { status: 400 }
        );
      }
      verifiedItems.push({ ...item, verifiedPrice: realPrice });
    }

    // Gift ticket orders: no shipping needed
    const isGiftTicketOnly = verifiedItems.every((item) =>
      GIFT_TICKET_IDS.includes(item.id)
    );

    const subtotal = verifiedItems.reduce(
      (sum, item) => sum + item.verifiedPrice * item.quantity,
      0
    );
    const shippingCost = isGiftTicketOnly ? 0 : subtotal >= 5000 ? 0 : 370;

    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description?: string };
        unit_amount: number;
      };
      quantity: number;
    }> = verifiedItems.map((item) => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: item.name,
          description: `${item.unit}`,
        },
        unit_amount: item.verifiedPrice,
      },
      quantity: item.quantity,
    }));

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "jpy",
          product_data: {
            name: "送料",
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment" as const,
      success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}${isGiftTicketOnly ? "&type=gift" : ""}`,
      cancel_url: `${baseUrl}/shop`,
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        items: JSON.stringify(
          verifiedItems.map((i) => ({ id: i.id, name: i.name, qty: i.quantity }))
        ),
        is_gift_ticket: isGiftTicketOnly ? "true" : "false",
      },
    };

    // Only collect shipping address for physical products
    if (!isGiftTicketOnly) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ["JP"],
      };
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "決済処理でエラーが発生しました" },
      { status: 500 }
    );
  }
}
