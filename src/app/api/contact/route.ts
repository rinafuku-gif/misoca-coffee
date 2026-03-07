import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, phone, message } = body;

    if (!type || !name || !email || !message) {
      return NextResponse.json(
        { error: "必須項目を入力してください" },
        { status: 400 }
      );
    }

    // Notionデータベースに保存
    if (process.env.NOTION_API_KEY && process.env.NOTION_CONTACT_DB_ID) {
      const notion = new Client({ auth: process.env.NOTION_API_KEY });

      await notion.pages.create({
        parent: { database_id: process.env.NOTION_CONTACT_DB_ID },
        properties: {
          "お名前": { title: [{ text: { content: name } }] },
          "種別": { select: { name: type } },
          "メールアドレス": { email: email },
          "電話番号": { phone_number: phone || null },
          "お問い合わせ内容": {
            rich_text: [{ text: { content: message } }],
          },
          "ステータス": { select: { name: "未対応" } },
        },
      });
    }

    // GAS Webhookでメール通知
    if (process.env.GAS_WEBHOOK_URL) {
      await fetch(process.env.GAS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, email, phone, message }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "送信に失敗しました" },
      { status: 500 }
    );
  }
}
