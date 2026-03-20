import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const GIFT_TICKET_IDS = ["gift-roasting-experience"];

export async function POST(request: NextRequest) {
  try {
    const { items } = (await request.json()) as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "カートが空です" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Gift ticket orders: no shipping needed
    const isGiftTicketOnly = items.every((item) =>
      GIFT_TICKET_IDS.includes(item.id)
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
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
    }> = items.map((item) => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: item.name,
          description: `${item.unit}`,
        },
        unit_amount: item.price,
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
          items.map((i) => ({ id: i.id, name: i.name, qty: i.quantity }))
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
