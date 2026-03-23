import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

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
  isGiftTicket?: boolean;
}

export async function sendOrderNotification(order: OrderNotification, overrideTo?: string) {
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://misoca-coffee.vercel.app";
  const giftSendUrl = order.isGiftTicket && order.customerEmail
    ? `${baseUrl}/api/admin/send-gift-ticket?session_id=${encodeURIComponent(order.sessionId)}&email=${encodeURIComponent(order.customerEmail)}&name=${encodeURIComponent(order.customerName || "")}&token=${encodeURIComponent(process.env.ADMIN_SECRET || "")}`
    : null;

  const giftNote = order.isGiftTicket
    ? `\n⚠️ ギフトチケット注文です\n\n▼ 下記リンクをクリックすると、お客様にチケットメールが自動送信されます\n${giftSendUrl || "（メールアドレス未取得のためリンクを生成できません）"}\n`
    : "";

  const text = `
━━━━━━━━━━━━━━━━━━━━━━━━
  新しい注文が入りました
━━━━━━━━━━━━━━━━━━━━━━━━
${giftNote}

【注文ID】
${order.sessionId}

【お客様情報】
お名前: ${order.customerName || "未入力"}
メール: ${order.customerEmail || "未入力"}
電話番号: ${order.phone || "未入力"}

【配送先】
${order.isGiftTicket ? "（電子チケット・配送なし）" : addressText}

【注文内容】
${itemList}

【合計金額】
¥${order.amountTotal?.toLocaleString() || 0}

━━━━━━━━━━━━━━━━━━━━━━━━
三十日珈琲 EC注文通知
`.trim();

  await getTransporter().sendMail({
    from: `三十日珈琲 EC <${process.env.GMAIL_USER}>`,
    to: overrideTo || "misocacoffee@gmail.com",
    subject: `${order.isGiftTicket ? "【ギフトチケット注文】" : "【新規注文】"}${order.customerName || "お客様"} 様 - ¥${order.amountTotal?.toLocaleString() || 0}`,
    text,
  });
}

/**
 * ギフトチケットメールの本文を生成（確認画面でも使用）
 */
export function buildGiftTicketEmailBody(params: {
  customerName: string;
  sessionId: string;
}): string {
  return `
${params.customerName || "お客様"} 様

この度は三十日珈琲の焙煎体験ギフトチケットを
ご購入いただき、誠にありがとうございます。

━━━━━━━━━━━━━━━━━━━━━━━━
  焙煎体験ギフトチケット
━━━━━━━━━━━━━━━━━━━━━━━━

チケット番号: ${params.sessionId.slice(-8).toUpperCase()}
体験内容: コーヒー焙煎体験（約90分）
対象人数: 1組・2名様まで
有効期限: ご購入日から6ヶ月間

━━━━━━━━━━━━━━━━━━━━━━━━

■ 贈る方へ
このメールの内容を、贈りたい方へ
LINEやメール等で転送してください。

■ 贈られた方へ（ご予約方法）
下記いずれかの方法でご連絡いただき、
体験日時をご予約ください。

・LINE: https://lin.ee/ihDBxM8
・Instagram DM: @misoca_coffee
・メール: misocacoffee@gmail.com

ご予約の際に「ギフトチケット利用」と
チケット番号をお伝えください。

■ 体験場所
三十日珈琲
〒409-0115 山梨県上野原市松留939
https://maps.app.goo.gl/6vi6JLqVkv5AF26R6

JR中央本線「上野原」駅より送迎あり（要予約）
駐車場あり（無料・6台）

━━━━━━━━━━━━━━━━━━━━━━━━

ご不明な点がございましたら、
お気軽にお問い合わせください。

三十日珈琲（みそかこーひー）
misocacoffee@gmail.com
https://misoca-coffee.vercel.app
`.trim();
}

/**
 * ギフトチケットのメールをお客様に送信（編集済み本文を直接渡す）
 */
export async function sendGiftTicketEmailWithBody(params: {
  customerEmail: string;
  body: string;
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail credentials not configured");
  }

  await getTransporter().sendMail({
    from: `三十日珈琲 <${process.env.GMAIL_USER}>`,
    to: params.customerEmail,
    subject: "【三十日珈琲】焙煎体験ギフトチケットのお届け",
    text: params.body,
  });
}
