import { z } from "zod";
import config from "@content/pages/shop-merchandising.json";
import { productCardBadgeLabels, type ProductCardSettings } from "./product-card-settings";
import type { BeanDisplay } from "./bean-display";
import { findShopItem, isShopItemSku } from "./shop-item-link";

const entrySchema = z.object({
  key: z.string().refine(key => key === "yuzu-drip-bag" || isShopItemSku(key)),
  badge: z.enum(["new", "recommended"]).optional(),
  note: z.string().trim().max(70).optional(),
});

const entries = config.items.flatMap(entry => {
  const parsed = entrySchema.safeParse(entry);
  return parsed.success ? [parsed.data] : [];
});

export function productMerchandising(item: { skuId: string; name: string; display: BeanDisplay | null; merchandising?: ProductCardSettings }) {
  if (item.merchandising) {
    const { badge, note } = item.merchandising;
    return { badge: badge ? productCardBadgeLabels[badge] : undefined, note: note || item.display?.flavor.trim() };
  }
  const exact = entries.find(entry => entry.key === item.skuId);
  const named = entries.find(entry => entry.key === "yuzu-drip-bag" && findShopItem("yuzu-drip-bag", [item]));
  const entry = exact ?? named;
  return {
    badge: entry?.badge && productCardBadgeLabels[entry.badge],
    note: entry?.note || item.display?.flavor.trim(),
  };
}

export const roastChoices = [
  { key: "light", label: "浅煎り・中浅煎り" },
  { key: "medium", label: "中煎り" },
  { key: "dark", label: "中深煎り・深煎り" },
  { key: "unlisted", label: "その他・未登録" },
] as const;

export type RoastChoice = (typeof roastChoices)[number]["key"];

export function roastChoice(roast: string | undefined): RoastChoice {
  switch (roast?.trim()) {
    case "浅煎り":
    case "中浅煎り":
      return "light";
    case "中煎り":
      return "medium";
    case "中深煎り":
    case "深煎り":
      return "dark";
    default:
      return "unlisted";
  }
}
