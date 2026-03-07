import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"三十日珈琲 お問い合わせ" <${process.env.GMAIL_USER}>`,
      to: "misocacoffee@gmail.com",
      replyTo: email,
      subject: `【三十日珈琲】${type}：${name}様よりお問い合わせ`,
      text: [
        `お問い合わせ種別: ${type}`,
        `お名前: ${name}`,
        `メールアドレス: ${email}`,
        `電話番号: ${phone || "未入力"}`,
        ``,
        `お問い合わせ内容:`,
        message,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
