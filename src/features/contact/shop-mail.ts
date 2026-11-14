import nodemailer from "nodemailer";
import type { ContactInput } from "./contract";

export const shopInbox = "misocacoffee@gmail.com";
// Shorter than the route's maxDuration, so a slow send ends as "unconfirmed"
// here instead of the function being cut off.
const sendDeadlineMs = 8000;

export function inquiryMail(input: ContactInput, sender: string) {
  return {
    from: { name: "三十日珈琲 お問い合わせフォーム", address: sender },
    to: shopInbox,
    // Address only: text chosen by the visitor stays out of the mail headers.
    replyTo: input.email,
    subject: `【お問い合わせ】${input.type}`,
    text: [
      "Webサイトのお問い合わせフォームから届きました。",
      "",
      `種別: ${input.type}`,
      `お名前: ${input.name}`,
      `メールアドレス: ${input.email}`,
      `電話番号: ${input.phone || "（記入なし）"}`,
      "",
      "お問い合わせ内容:",
      input.message,
      "",
      `Web受付確認番号: ${input.attemptId}`,
      "このメールへの返信は、お客様のメールアドレスへ届きます。",
    ].join("\n"),
  };
}

/** Used when no inquiry database is configured: the shop inbox is the record.
 * Resolves only when Gmail accepted the message for that inbox. Anything else
 * throws, so a visitor is never told that an unsent inquiry was received. */
export async function mailInquiryToShop(input: ContactInput, account: { user: string; pass: string }): Promise<void> {
  const transport = nodemailer.createTransport({
    service: "gmail", auth: account,
    connectionTimeout: 3000, greetingTimeout: 3000, socketTimeout: 5000,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      transport.sendMail(inquiryMail(input, account.user)),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("MAIL_DEADLINE")), sendDeadlineMs); }),
    ]);
    const accepted = (result.accepted ?? []).map(String);
    if (!accepted.includes(shopInbox) || (result.rejected ?? []).length > 0) throw new Error("MAIL_UNCONFIRMED");
  } finally {
    clearTimeout(timer);
  }
}
