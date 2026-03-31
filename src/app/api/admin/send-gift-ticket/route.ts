import { NextRequest, NextResponse } from "next/server";
import { sendGiftTicketEmailWithBody, buildGiftTicketEmailBody } from "@/lib/mail";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    token: searchParams.get("token"),
    sessionId: searchParams.get("session_id") || "",
    email: searchParams.get("email") || "",
    name: searchParams.get("name") || "",
  };
}

function verifyToken(token: string | null): boolean {
  return !!process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

/** GET: 確認画面を表示 */
export async function GET(request: NextRequest) {
  const params = getParams(request);
  if (!verifyToken(params.token)) {
    return htmlResponse(401, errorHtml("認証エラー", "アクセス権限がありません。"));
  }
  if (!params.sessionId || !params.email) {
    return htmlResponse(400, errorHtml("パラメータ不足", "必要な情報が不足しています。"));
  }

  const emailBody = buildGiftTicketEmailBody({
    customerName: params.name,
    sessionId: params.sessionId,
  });

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>チケットメール確認 - 三十日珈琲</title>
<style>
*{box-sizing:border-box}
body{font-family:-apple-system,sans-serif;margin:0;background:#f5f3ef;color:#4a4a4a;padding:2rem 1rem}
.container{max-width:600px;margin:0 auto}
h1{font-size:1.25rem;color:#3a3a3a;margin:0 0 .5rem;text-align:center}
.subtitle{text-align:center;color:#888;font-size:.85rem;margin-bottom:2rem}
.info{background:#fff;border-radius:4px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.info-row{display:flex;gap:.75rem;padding:.5rem 0;border-bottom:1px solid #f0ede8;font-size:.9rem}
.info-row:last-child{border-bottom:none}
.info-label{color:#888;min-width:5rem;flex-shrink:0}
.info-value{color:#3a3a3a;word-break:break-all}
.preview-label{font-size:.85rem;color:#888;margin-bottom:.5rem}
.editor{display:block;width:100%;min-height:420px;background:#fff;border:1px solid #e0ddd6;border-radius:4px;padding:1.5rem;white-space:pre-wrap;font-family:-apple-system,sans-serif;font-size:.85rem;line-height:1.9;color:#4a4a4a;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:2rem;resize:vertical}
.editor:focus{outline:none;border-color:#b8a47c;box-shadow:0 0 0 2px #b8a47c30}
.actions{display:flex;gap:1rem;justify-content:center}
.btn{padding:.85rem 2.5rem;border:none;border-radius:4px;font-size:.9rem;cursor:pointer;transition:all .2s}
.btn-send{background:#b8a47c;color:#fff}
.btn-send:hover{background:#a69368}
.btn-cancel{background:#fff;color:#888;border:1px solid #ddd}
.btn-cancel:hover{background:#f5f3ef}
.btn-reset{background:#fff;color:#b8a47c;border:1px solid #b8a47c40}
.btn-reset:hover{background:#b8a47c10}
.sending .btn-send{opacity:.5;pointer-events:none}
</style>
</head>
<body>
<div class="container">
  <h1>ギフトチケットメール送信</h1>
  <p class="subtitle">内容を確認して「送信する」を押してください</p>

  <div class="info">
    <div class="info-row">
      <span class="info-label">送信先</span>
      <span class="info-value">${escapeHtml(params.email)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">宛名</span>
      <span class="info-value">${escapeHtml(params.name || "お客様")}</span>
    </div>
    <div class="info-row">
      <span class="info-label">件名</span>
      <span class="info-value">【三十日珈琲】焙煎体験ギフトチケットのお届け</span>
    </div>
    <div class="info-row">
      <span class="info-label">チケット番号</span>
      <span class="info-value">${escapeHtml(params.sessionId.slice(-8).toUpperCase())}</span>
    </div>
  </div>

  <p class="preview-label">メール本文（編集できます）</p>
  <form id="sendForm" method="POST" action="/api/admin/send-gift-ticket?session_id=${encodeURIComponent(params.sessionId)}&email=${encodeURIComponent(params.email)}&name=${encodeURIComponent(params.name)}">
    <input type="hidden" name="token" value="${escapeHtml(params.token || "")}" />
    <textarea name="body" class="editor">${escapeHtml(emailBody)}</textarea>
    <div class="actions">
      <button type="button" class="btn btn-cancel" onclick="window.close()">キャンセル</button>
      <button type="button" class="btn btn-reset" id="resetBtn">元に戻す</button>
      <button type="submit" class="btn btn-send" id="sendBtn">送信する</button>
    </div>
  </form>
</div>
<script>
var original=${JSON.stringify(emailBody)};
document.getElementById('sendForm').addEventListener('submit',function(){
  document.getElementById('sendBtn').textContent='送信中...';
  this.classList.add('sending');
});
document.getElementById('resetBtn').addEventListener('click',function(){
  document.querySelector('.editor').value=original;
});
</script>
</body>
</html>`;

  return htmlResponse(200, html);
}

/** POST: 実際にメールを送信 */
export async function POST(request: NextRequest) {
  const params = getParams(request);

  // フォームから編集後の本文とトークンを取得
  const formData = await request.formData();
  const token = (formData.get("token") as string | null) || params.token;
  if (!verifyToken(token)) {
    return htmlResponse(401, errorHtml("認証エラー", "アクセス権限がありません。"));
  }
  if (!params.sessionId || !params.email) {
    return htmlResponse(400, errorHtml("パラメータ不足", "必要な情報が不足しています。"));
  }

  const editedBody = formData.get("body") as string | null;

  try {
    await sendGiftTicketEmailWithBody({
      customerEmail: params.email,
      body: editedBody || buildGiftTicketEmailBody({ customerName: params.name, sessionId: params.sessionId }),
    });

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>送信完了 - 三十日珈琲</title>
<style>
body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f3ef;color:#4a4a4a}
.card{background:#fff;padding:3rem;border-radius:4px;text-align:center;max-width:420px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.check{width:56px;height:56px;border-radius:50%;background:#b8a47c20;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem}
.check svg{width:28px;height:28px;color:#b8a47c}
h1{font-size:1.25rem;color:#3a3a3a;margin:0 0 1rem}
p{line-height:1.8;margin:0;font-size:.9rem}
</style>
</head>
<body>
<div class="card">
  <div class="check"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>
  <h1>送信完了</h1>
  <p>${escapeHtml(params.name || params.email)} 様に<br>ギフトチケットメールを送信しました。</p>
</div>
</body>
</html>`;

    return htmlResponse(200, html);
  } catch (error) {
    console.error("Gift ticket email error:", error);
    return htmlResponse(500, errorHtml("送信エラー", "メールの送信に失敗しました。ブラウザの戻るボタンで戻ってもう一度お試しください。"));
  }
}

function htmlResponse(status: number, html: string) {
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function errorHtml(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} - 三十日珈琲</title>
<style>
body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f3ef;color:#4a4a4a}
.card{background:#fff;padding:3rem;border-radius:4px;text-align:center;max-width:400px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
h1{font-size:1.25rem;color:#c44;margin:0 0 1rem}
p{line-height:1.8;margin:0;font-size:.9rem}
</style></head>
<body><div class="card"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></div></body>
</html>`;
}
