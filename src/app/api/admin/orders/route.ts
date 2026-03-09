import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();

    // Fetch completed checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: "complete",
      expand: ["data.line_items"],
    });

    // Build customer purchase count map
    const customerCounts: Record<string, number> = {};
    const orders = sessions.data.map((session) => {
      const email = session.customer_details?.email || "unknown";
      customerCounts[email] = (customerCounts[email] || 0) + 1;

      let items: { name: string; qty: number; id?: string }[] = [];
      try {
        items = JSON.parse(session.metadata?.items || "[]");
      } catch {
        // fallback to line_items
      }

      const sessionAny = session as unknown as Record<string, unknown>;
      const shipping = (sessionAny["shipping_details"] || null) as {
        name?: string;
        address?: {
          line1: string | null;
          line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
        };
      } | null;

      return {
        id: session.id,
        created: session.created,
        email,
        name: session.customer_details?.name || shipping?.name || "",
        phone: session.customer_details?.phone || "",
        address: shipping?.address || null,
        amount: session.amount_total || 0,
        items,
        status: session.payment_status,
      };
    });

    // Attach purchase count to each order
    const ordersWithCounts = orders.map((order) => ({
      ...order,
      customerPurchaseCount: customerCounts[order.email] || 1,
    }));

    // Customer summary
    const customers = Object.entries(customerCounts).map(([email, count]) => {
      const customerOrders = orders.filter((o) => o.email === email);
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.amount, 0);
      const lastOrder = customerOrders[0];
      return {
        email,
        name: lastOrder?.name || "",
        phone: lastOrder?.phone || "",
        orderCount: count,
        totalSpent,
        lastOrderDate: lastOrder?.created || 0,
      };
    });

    return NextResponse.json({
      orders: ordersWithCounts,
      customers: customers.sort((a, b) => b.lastOrderDate - a.lastOrderDate),
      summary: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0),
        uniqueCustomers: Object.keys(customerCounts).length,
      },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
