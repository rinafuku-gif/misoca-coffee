import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendOrderNotification } from "@/lib/mail";
import type Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !endpointSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Parse items from metadata
      let items: { name: string; qty: number }[] = [];
      try {
        items = JSON.parse(session.metadata?.items || "[]");
      } catch {
        // ignore
      }

      const sessionAny = session as unknown as Record<string, unknown>;
      const shipping = (sessionAny["shipping_details"] || null) as {
        address?: {
          line1: string | null;
          line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
        };
        phone?: string | null;
      } | null;

      // Send email notification
      try {
        await sendOrderNotification({
          sessionId: session.id,
          customerEmail: session.customer_details?.email || null,
          customerName: session.customer_details?.name || null,
          phone: session.customer_details?.phone || shipping?.phone || null,
          address: shipping?.address || null,
          amountTotal: session.amount_total || 0,
          items,
        });
        console.log("Order notification email sent");
      } catch (emailError) {
        console.error("Failed to send order notification:", emailError);
      }

      console.log("Payment succeeded:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", {
        id: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      });
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
