import { NextRequest, NextResponse } from "next/server";
import { sendOrderNotification } from "@/lib/mail";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const sendTo = searchParams.get("to");

  if (!process.env.ADMIN_SECRET || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sendTo) {
    return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 });
  }

  try {
    await sendOrderNotification(
      {
        sessionId: "cs_test_20260320_gift_demo",
        customerEmail: "fukin.wimps@gmail.com",
        customerName: "テスト太郎",
        phone: "090-1234-5678",
        address: null,
        amountTotal: 8800,
        items: [{ name: "焙煎体験ギフトチケット", qty: 1 }],
        isGiftTicket: true,
      },
      sendTo
    );

    return NextResponse.json({ success: true, message: `Test notification sent to ${sendTo}` });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
