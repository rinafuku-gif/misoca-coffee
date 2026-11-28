import { z } from "zod";

export const PRODUCT_CARD_HEADER = "x-misoca-product-card";
export const PRODUCT_CARD_SETTINGS_PATH = "/api/ec/operations/product-card";
export const PRODUCT_CARD_NOTE_LIMIT = 70;
export const productCardBadgeLabels = { new: "NEW", recommended: "おすすめ" } as const;

export const productCardSettingsSchema = z.object({
  note: z.string().trim().max(PRODUCT_CARD_NOTE_LIMIT).refine(note => !/[\r\n]/.test(note)),
  badge: z.enum(["new", "recommended"]).nullable(),
}).strict();

export const productCardRecordSchema = z.object({
  settings: productCardSettingsSchema,
  revision: z.number().int().nonnegative().safe(),
}).strict();

export type ProductCardSettings = z.infer<typeof productCardSettingsSchema>;
export type ProductCardRecord = z.infer<typeof productCardRecordSchema>;
