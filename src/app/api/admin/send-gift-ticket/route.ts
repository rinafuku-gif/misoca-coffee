import { NextRequest, NextResponse } from "next/server";
import { sendGiftTicketEmail } from "@/lib/mail";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const sessionId = searchParams.get("session_id");
  const email = searchParams.get("email");
  const name = searchParams.get("name") || "";

  // Auth check
  if (!process.env.ADMIN_SECRET || token !== process.env.ADMIN_SECRET) {
    return new NextResponse(
      htmlPage("認証エラー", "アクセス権限がありません。"),
      { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!sessionId || !email) {
    return new NextResponse(
      htmlPage("パラメータ不足", "必要な情報が不足しています。"),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    await sendGiftTicketEmail({
      customerEmail: email,
      customerName: name,
      sessionId,
    });

    return new NextResponse(
      htmlPage(
        "送信完了",
        `${name || email} 様にギフトチケットメールを送信しました。`
      ),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (error) {
    console.error("Gift ticket email error:", error);
    return new NextResponse(
      htmlPage("送信エラー", "メールの送信に失敗しました。もう一度お試しください。"),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

function htmlPage(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - 三十日珈琲</title>
<style>
body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f3ef;color:#4a4a4a}
.card{background:#fff;padding:3rem;border-radius:4px;text-align:center;max-width:400px;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
h1{font-size:1.25rem;color:#3a3a3a;margin:0 0 1rem}
p{line-height:1.8;margin:0}
</style></head>
<body><div class="card"><h1>${title}</h1><p>${message}</p></div></body>
</html>`;
}
