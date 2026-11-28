import { z } from "zod";

export const ROAST_LEVELS = ["浅煎り", "中浅煎り", "中煎り", "中深煎り", "深煎り"] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];
const roastBeanSku = /^bn_[a-f0-9]{32}_300$/;
export const isRoastBean = (skuId: string) => roastBeanSku.test(skuId);

export const roastPreferencesSchema = z.array(z.object({
  skuId: z.string().regex(roastBeanSku),
  level: z.enum(ROAST_LEVELS),
}).strict()).max(20).refine(items => new Set(items.map(item => item.skuId)).size === items.length);
export type RoastPreferences = z.infer<typeof roastPreferencesSchema>;

export function preferencesForCart(preferences: RoastPreferences, lines: readonly { skuId: string }[]): RoastPreferences {
  const ids = new Set(lines.map(line => line.skuId));
  return preferences.filter(item => ids.has(item.skuId));
}
