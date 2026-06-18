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
  const isOnsite = experienceType === "出張焙煎体験";
  const maxGuests = isOnsite ? 9 : 4;

  if (numberOfGuests < 1 || numberOfGuests > maxGuests) {
    throw new Error(
      isOnsite
        ? "来店人数は1〜9名で指定してください"
        : "来店人数は1〜4名で指定してください"
    );
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

// ─── 交通費計算 ──────────────────────────────────────────────────────────────

const FREE_AREA_KEYWORDS = ["上野原市", "大月市", "相模原市緑区"] as const;

/**
 * 住所が交通費無料エリアかどうかを判定する
 */
export function isFreeArea(address: string): boolean {
  return FREE_AREA_KEYWORDS.some((keyword) => address.includes(keyword));
}

/**
 * 片道距離（km）から交通費を計算する
 * 往復距離 ÷ 10(km/L) × 200(円/L) → 10円単位で切り上げ
 */
export function calculateTransportFee(oneWayDistanceKm: number): number {
  const roundTripKm = oneWayDistanceKm * 2;
  const rawFee = (roundTripKm / 10) * 200;
  return Math.ceil(rawFee / 10) * 10;
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
