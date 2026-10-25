import { z } from "zod";
import { MAX_CHECKOUT_LINES, MAX_CHECKOUT_QUANTITY } from "./policy";

export const CheckoutInputSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    price: z.number().finite(), // 形式のみ検証。決済額には使用しない。
    quantity: z.number().int().min(1).max(MAX_CHECKOUT_QUANTITY),
    unit: z.string().max(50),
  })).min(1).max(MAX_CHECKOUT_LINES),
}).superRefine(({ items }, ctx) => {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) ctx.addIssue({ code: "custom", message: "Duplicate product" });
    seen.add(item.id);
  }
});
