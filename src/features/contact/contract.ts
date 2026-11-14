import { z } from "zod";

export const inquiryTypes = ["焙煎体験の予約", "ケータリングのお問い合わせ", "出張焙煎のお問い合わせ", "オンラインショップについて", "その他"] as const;
export const contactInputSchema = z.object({
  // Correlation only, not a server-side idempotency guarantee.
  attemptId: z.string().uuid(),
  type: z.enum(inquiryTypes),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).default(""),
  message: z.string().trim().min(1).max(2000),
}).strict();
export type ContactInput = z.infer<typeof contactInputSchema>;
export const contactReceiptSchema = z.object({
  state: z.literal("stored"), attemptId: z.string().uuid(),
  notification: z.enum(["not_configured", "provider_acknowledged", "unconfirmed"]),
}).strict();
export type ContactReceipt = z.infer<typeof contactReceiptSchema>;
