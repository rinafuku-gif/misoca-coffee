import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface OrderItem {
  name: string;
  qty: number;
}

interface OrderNotification {
  sessionId: string;
  customerEmail: string | null;
  customerName: string | null;
  phone: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  } | null;
  amountTotal: number;
  items: OrderItem[];
}

export async function sendOrderNotification(order: OrderNotification) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured, skipping email notification");
    return;
  }

  const itemList = order.items
    .map((item) => `  - ${item.name} × ${item.qty}`)
    .join("\n");

  const addr = order.address;
  const addressText = addr
    ? `〒${addr.postal_code || ""}\n  ${addr.state || ""}${addr.city || ""}${addr.line1 || ""}${addr.line2 ? "\n  " + addr.line2 : ""}`
    : "未入力";

  const text = `
━━━━━━━━━━━━━━━━━━━━━━━━
  新しい注文が入りました
━━━━━━━━━━━━━━━━━━━━━━━━

【注文ID】
${order.sessionId}

【お客様情報】
お名前: ${order.customerName || "未入力"}
メール: ${order.customerEmail || "未入力"}
電話番号: ${order.phone || "未入力"}

【配送先】
${addressText}

【注文内容】
${itemList}

【合計金額】
¥${order.amountTotal?.toLocaleString() || 0}

━━━━━━━━━━━━━━━━━━━━━━━━
三十日珈琲 EC注文通知
`.trim();

  await transporter.sendMail({
    from: `三十日珈琲 EC <${process.env.GMAIL_USER}>`,
    to: "misocacoffee@gmail.com",
    subject: `【新規注文】${order.customerName || "お客様"} 様 - ¥${order.amountTotal?.toLocaleString() || 0}`,
    text,
  });
}
