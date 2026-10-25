import { NextResponse } from "next/server";

// 販売再開後も旧経路は復活させない。認証・購入照合等を備えた別設計まで閉鎖。
function closedResponse() {
  return new NextResponse(
    `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ギフトチケットの送信は停止中です</title></head><body><main><h1>ギフトチケットの送信は停止中です</h1><p>この画面からはメールを送信できません。既存のご注文は、お店へ直接お問い合わせください。</p></main></body></html>`,
    {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

export async function GET() { return closedResponse(); }
export async function POST() { return closedResponse(); }
