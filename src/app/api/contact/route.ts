import { Client } from "@notionhq/client";
import { z } from "zod";
import { createContactHandler, IntakeUnavailable } from "@/features/contact/handler";
import type { ContactInput } from "@/features/contact/contract";
import { siteOrigin } from "@/shared/seo/site-entities";
import { mailInquiryToShop } from "@/features/contact/shop-mail";
import { shopMailBudget } from "@/features/contact/mail-budget";

// Covers the slowest path (an 8 second save plus a 3 second notice).
export const maxDuration = 15;

const pageReceipt = z.object({ object: z.literal("page"), id: z.string().uuid(), archived: z.literal(false).optional(), in_trash: z.literal(false).optional() });
export async function POST(request: Request) {
  const auth = process.env.NOTION_API_KEY?.trim();
  const databaseId = process.env.NOTION_CONTACT_DB_ID?.trim();
  const configured = !!auth && (z.string().uuid().safeParse(databaseId).success || /^[a-f0-9]{32}$/i.test(databaseId ?? ""));
  const url = process.env.GAS_WEBHOOK_URL?.trim();
  let webhook: URL | undefined;
  try {
    const parsed = new URL(url ?? "");
    if (parsed.protocol === "https:" && parsed.hostname === "script.google.com" && !parsed.username && !parsed.password && !parsed.port && !parsed.search && !parsed.hash && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(parsed.pathname)) webhook = parsed;
  } catch { /* An invalid configuration never authorizes another host. */ }
  // Without an inquiry database, the shop inbox is both the record and the
  // notice. The account is the one the site already uses for reservation mail.
  const mailUser = process.env.GMAIL_USER?.trim();
  const mailPass = process.env.GMAIL_APP_PASSWORD?.trim();
  const mailbox = !configured && mailUser && mailPass ? { user: mailUser, pass: mailPass } : undefined;
  if (mailbox) {
    const visitor = request.headers.get("x-real-ip")?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    return createContactHandler({
      allowedOrigins: [siteOrigin, ...(process.env.CONTACT_ALLOWED_ORIGINS?.split(",").map(value => value.trim()) ?? [])],
      allowLoopbackOrigin: process.env.CONTACT_ALLOW_LOOPBACK_ORIGIN === "1" && !process.env.VERCEL_ENV,
      // A spent budget answers "not sent" (the page then points to LINE).
      save: async (input: ContactInput) => {
        if (!shopMailBudget.take(visitor)) throw new IntakeUnavailable();
        await mailInquiryToShop(input, mailbox);
      },
      // The mail is the notice. The webhook would only send the shop a second copy.
      notify: async () => true,
    })(request);
  }
  return createContactHandler({
    allowedOrigins: [siteOrigin, ...(process.env.CONTACT_ALLOWED_ORIGINS?.split(",").map(value => value.trim()) ?? [])],
    allowLoopbackOrigin: process.env.CONTACT_ALLOW_LOOPBACK_ORIGIN === "1" && !process.env.VERCEL_ENV,
    save: configured ? async (input: ContactInput) => {
      // Create is not idempotent: never retry an unconfirmed write automatically.
      const notion = new Client({ auth, timeoutMs: 8000, retry: false, logger: () => {} });
      const result = await notion.pages.create({
        parent: { database_id: databaseId! },
        properties: {
          "お名前": { title: [{ text: { content: input.name } }] },
          "種別": { select: { name: input.type } },
          "メールアドレス": { email: input.email },
          "電話番号": { phone_number: input.phone || null },
          "お問い合わせ内容": { rich_text: [{ text: { content: input.message } }] },
          "ステータス": { select: { name: "未対応" } },
        },
        children: [{ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: `Web受付確認番号: ${input.attemptId}` } }] } }],
      });
      if (!pageReceipt.safeParse(result).success) throw new Error("SAVE_UNCONFIRMED");
    } : undefined,
    notify: webhook ? async (input: ContactInput) => {
      const response = await fetch(webhook!, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input), redirect: "error", signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return false;
      const result: unknown = await response.json();
      return z.object({ success: z.literal(true) }).safeParse(result).success;
    } : undefined,
  })(request);
}
