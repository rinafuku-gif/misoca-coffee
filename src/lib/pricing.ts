import type { ExperienceType } from "./google-calendar";

// ─── 料金定数 ────────────────────────────────────────────────────────────────

const BASE_PRICE: Record<ExperienceType, number> = {
  プライベート焙煎体験: 8800,
  グループ焙煎体験: 4400,
  出張焙煎体験: 11000,
};

// プライベート・出張: 3名以上は1名追加ごとに+4,400円
// グループ: 人数 × 4,400円（一律）
const EXTRA_PRICE_PER_PERSON = 4400;
const BASE_GUESTS_FOR_FLAT_RATE = 2; // 2名まで一律

// ─── 料金計算 ────────────────────────────────────────────────────────────────

export interface PricingResult {
  totalAmount: number; // 円（税込）
  breakdown: string;   // 表示用文字列
}

export function calculatePrice(
  experienceType: ExperienceType,
  numberOfGuests: number
): PricingResult {
  if (numberOfGuests < 1 || numberOfGuests > 4) {
    throw new Error("来店人数は1〜4名で指定してください");
  }

  const base = BASE_PRICE[experienceType];

  if (experienceType === "グループ焙煎体験") {
    const total = base * numberOfGuests;
    return {
      totalAmount: total,
      breakdown: `¥${base.toLocaleString()} × ${numberOfGuests}名`,
    };
  }

  // プライベート・出張: 2名まで一律、3名以上は追加料金
  if (numberOfGuests <= BASE_GUESTS_FOR_FLAT_RATE) {
    return {
      totalAmount: base,
      breakdown: `¥${base.toLocaleString()}（${numberOfGuests}名まで一律）`,
    };
  }

  const extraGuests = numberOfGuests - BASE_GUESTS_FOR_FLAT_RATE;
  const extraAmount = EXTRA_PRICE_PER_PERSON * extraGuests;
  const total = base + extraAmount;

  return {
    totalAmount: total,
    breakdown: `¥${base.toLocaleString()} + ¥${EXTRA_PRICE_PER_PERSON.toLocaleString()} × ${extraGuests}名`,
  };
}

// ─── ExperienceType ガード ───────────────────────────────────────────────────

const VALID_EXPERIENCE_TYPES = new Set<ExperienceType>([
  "プライベート焙煎体験",
  "グループ焙煎体験",
  "出張焙煎体験",
]);

export function isValidExperienceType(value: string): value is ExperienceType {
  return VALID_EXPERIENCE_TYPES.has(value as ExperienceType);
}
