"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { CalendarSlot, ExperienceType } from "@/features/reservation/google-calendar";
import { GROUP_MAX_GUESTS } from "@/features/reservation/group-reservation-constants";
import { calculatePrice } from "@/features/reservation/pricing";

// ─── 型 ─────────────────────────────────────────────────────────────────────

export interface FormValues {
  email: string;
  name: string;
  nameKana: string;
  birthDate: string;
  phone: string;
  addressPrefecture: string;
  addressCity: string;
  transportation: "車" | "電車" | "その他" | "";
  howFound: string;
  roastingExperience: string;
  favoriteCoffee: string;
  numberOfGuests: string;
  coffeeDrinkingFrequency: string;
  location: string;
}

export interface TransportFeeResult {
  fee: number;
  distance: number;
  isFreeArea: boolean;
}

interface FieldError {
  [key: string]: string;
}

interface ReservationFormProps {
  slot: CalendarSlot;
  onSubmit: (values: FormValues, transportFee?: TransportFeeResult) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

// ─── 定数 ───────────────────────────────────────────────────────────────────

const TRANSPORTATION_OPTIONS = ["車", "電車", "その他"] as const;
const GUEST_OPTIONS_DEFAULT = ["1", "2", "3", "4"] as const;
const GUEST_OPTIONS_ONSITE = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県", "海外",
];

const INITIAL_VALUES: FormValues = {
  email: "",
  name: "",
  nameKana: "",
  birthDate: "",
  phone: "",
  addressPrefecture: "",
  addressCity: "",
  transportation: "",
  howFound: "",
  roastingExperience: "",
  favoriteCoffee: "",
  numberOfGuests: "1",
  coffeeDrinkingFrequency: "",
  location: "",
};

// ─── バリデーション ───────────────────────────────────────────────────────────

function validateForm(values: FormValues, experienceType?: ExperienceType): FieldError {
  const errors: FieldError = {};
  const isOnsite = experienceType === "出張焙煎体験";

  if (!values.email) {
    errors.email = "メールアドレスを入力してください";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "正しいメールアドレスを入力してください";
  }

  if (!values.name.trim()) {
    errors.name = "お名前を入力してください";
  }

  if (!values.nameKana.trim()) {
    errors.nameKana = "お名前（カナ）を入力してください";
  } else if (!/^[ァ-ヶー\s　]+$/.test(values.nameKana)) {
    errors.nameKana = "全角カタカナで入力してください";
  }

  if (!values.birthDate) {
    errors.birthDate = "生年月日を入力してください";
  }

  if (!values.phone.trim()) {
    errors.phone = "電話番号を入力してください";
  } else if (!/^0\d{1,4}-?\d{1,4}-?\d{4}$/.test(values.phone.replace(/\s/g, ""))) {
    errors.phone = "正しい電話番号を入力してください（例：090-1234-5678）";
  }

  if (!values.addressPrefecture) {
    errors.addressPrefecture = "都道府県を選択してください";
  }

  if (!values.addressCity.trim()) {
    errors.addressCity = "市区町村を入力してください";
  }

  if (!values.transportation) {
    errors.transportation = "交通手段を選択してください";
  }

  if (!values.howFound.trim()) {
    errors.howFound = "どこでお知りになったか教えてください";
  }

  if (!values.roastingExperience.trim()) {
    errors.roastingExperience = "焙煎経験について教えてください";
  }

  if (!values.favoriteCoffee.trim()) {
    errors.favoriteCoffee = "好きなコーヒーについて教えてください";
  }

  if (!values.coffeeDrinkingFrequency.trim()) {
    errors.coffeeDrinkingFrequency = "コーヒーを飲む頻度を入力してください";
  }

  if (isOnsite && !values.location.trim()) {
    errors.location = "出張先の住所を入力してください";
  }

  return errors;
}

// ─── サブコンポーネント ───────────────────────────────────────────────────────

interface FieldWrapProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

function FieldWrap({ label, required, error, children, hint }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs tracking-wide text-haicha">
        {label}
        {required && (
          <span className="ml-1.5 text-gold text-[10px]">必須</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-haicha/60 leading-relaxed">{hint}</p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-error leading-relaxed"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-white border border-usuzumi/50 text-sm text-sumi placeholder-usuzumi rounded-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-200";

const inputErrorClass =
  "w-full px-4 py-3 bg-white border border-error/50 text-sm text-sumi placeholder-usuzumi rounded-sm focus:outline-none focus:border-error/70 focus:ring-1 focus:ring-error/20 transition-all duration-200";

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export function ReservationForm({
  slot,
  onSubmit,
  onBack,
  isSubmitting,
}: ReservationFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [transportFee, setTransportFee] = useState<TransportFeeResult | null>(null);
  const [transportFeeLoading, setTransportFeeLoading] = useState(false);
  const [transportFeeError, setTransportFeeError] = useState<string | null>(null);

  const isOnsiteExperience = slot.experienceType === "出張焙煎体験";
  const isGroupExperience = slot.experienceType === "グループ焙煎体験";
  const groupRemaining = isGroupExperience
    ? (slot.groupRemainingCapacity ?? GROUP_MAX_GUESTS)
    : null;

  const fetchTransportFee = useCallback(async (location: string) => {
    if (!location.trim()) return;
    setTransportFeeLoading(true);
    setTransportFeeError(null);
    try {
      const res = await fetch(
        `/api/transport-fee?location=${encodeURIComponent(location)}`
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "交通費の計算に失敗しました");
      }
      const data = (await res.json()) as TransportFeeResult;
      setTransportFee(data);
    } catch (err) {
      setTransportFeeError(
        err instanceof Error ? err.message : "交通費の計算に失敗しました"
      );
      setTransportFee(null);
    } finally {
      setTransportFeeLoading(false);
    }
  }, []);

  const handleChange = (
    field: keyof FormValues,
    value: string
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched.has(field)) {
      const newValues = { ...values, [field]: value };
      const newErrors = validateForm(newValues, slot.experienceType as ExperienceType);
      setErrors((prev) => ({
        ...prev,
        [field]: newErrors[field] ?? "",
      }));
    }
    // location が変更されたら交通費キャッシュをリセット
    if (field === "location") {
      setTransportFee(null);
      setTransportFeeError(null);
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => new Set(prev).add(field));
    const newErrors = validateForm(values, slot.experienceType as ExperienceType);
    setErrors((prev) => ({
      ...prev,
      [field]: newErrors[field] ?? "",
    }));
    // location のblur時に交通費を取得
    if (field === "location" && isOnsiteExperience && values.location.trim()) {
      void fetchTransportFee(values.location);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validateForm(values, slot.experienceType as ExperienceType);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // 全フィールドをタッチ済みにする
      const allFields = Object.keys(INITIAL_VALUES) as (keyof FormValues)[];
      setTouched(new Set(allFields));
      // 最初のエラーフィールドへスクロール
      const firstErrorKey = Object.keys(allErrors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    onSubmit(values, transportFee ?? undefined);
  };

  return (
    <div>
      {/* ── 戻るボタン ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          aria-label="時間枠選択に戻る"
          className="w-8 h-8 flex items-center justify-center rounded-full border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white transition-all duration-300 flex-shrink-0 disabled:opacity-40"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <p className="text-[11px] tracking-[0.3em] text-gold/70 uppercase mb-0.5">
            Reservation Form
          </p>
          <h3 className="font-serif text-base text-konsumi tracking-wide">
            予約フォーム
          </h3>
        </div>
      </div>

      {/* ── 選択中の枠 ── */}
      <div className="bg-tsuchikabe rounded-sm px-5 py-4 mb-8">
        <p className="text-xs text-haicha/70 tracking-wide mb-1">選択中の枠</p>
        <p className="text-sm text-konsumi font-medium">
          {slot.experienceType}
        </p>
        <p className="text-sm text-haicha">
          {slot.date.replace(/-/g, "/")} {slot.startTime}〜{slot.endTime}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* メールアドレス */}
        <div id="field-email">
          <FieldWrap label="メールアドレス" required error={errors.email}>
            <input
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="example@mail.com"
              autoComplete="email"
              className={errors.email ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* お名前 */}
        <div id="field-name">
          <FieldWrap label="お名前（フルネーム）" required error={errors.name}>
            <input
              type="text"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="山田 太郎"
              autoComplete="name"
              className={errors.name ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* お名前カナ */}
        <div id="field-nameKana">
          <FieldWrap label="お名前（カナ）" required error={errors.nameKana}>
            <input
              type="text"
              value={values.nameKana}
              onChange={(e) => handleChange("nameKana", e.target.value)}
              onBlur={() => handleBlur("nameKana")}
              placeholder="ヤマダ タロウ"
              className={errors.nameKana ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* 生年月日 */}
        <div id="field-birthDate">
          <FieldWrap label="生年月日" required error={errors.birthDate}>
            <input
              type="date"
              value={values.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              onBlur={() => handleBlur("birthDate")}
              className={errors.birthDate ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* 電話番号 */}
        <div id="field-phone">
          <FieldWrap
            label="電話番号"
            required
            error={errors.phone}
            hint="ハイフンあり（例：090-1234-5678）"
          >
            <input
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              placeholder="090-1234-5678"
              autoComplete="tel"
              className={errors.phone ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* お住まい */}
        <div id="field-addressPrefecture">
          <FieldWrap label="お住まい" required error={errors.addressPrefecture || errors.addressCity}>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={values.addressPrefecture}
                onChange={(e) => handleChange("addressPrefecture", e.target.value)}
                onBlur={() => handleBlur("addressPrefecture")}
                className={`${errors.addressPrefecture ? inputErrorClass : inputClass} appearance-none`}
              >
                <option value="">都道府県</option>
                {PREFECTURES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="text"
                id="field-addressCity"
                value={values.addressCity}
                onChange={(e) => handleChange("addressCity", e.target.value)}
                onBlur={() => handleBlur("addressCity")}
                placeholder="市区町村"
                className={errors.addressCity ? inputErrorClass : inputClass}
              />
            </div>
          </FieldWrap>
        </div>

        {/* 交通手段 */}
        <div id="field-transportation">
          <FieldWrap label="交通手段" required error={errors.transportation}>
            <div className="flex gap-3">
              {TRANSPORTATION_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-sm border cursor-pointer text-sm transition-all duration-200 ${
                    values.transportation === opt
                      ? "border-gold bg-gold/5 text-gold"
                      : "border-usuzumi/50 text-haicha hover:border-karekusa/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="transportation"
                    value={opt}
                    checked={values.transportation === opt}
                    onChange={() => handleChange("transportation", opt)}
                    className="sr-only"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </FieldWrap>
        </div>

        {/* どこで知ったか */}
        <div id="field-howFound">
          <FieldWrap label="どこで三十日珈琲を知りましたか？" required error={errors.howFound}>
            <input
              type="text"
              value={values.howFound}
              onChange={(e) => handleChange("howFound", e.target.value)}
              onBlur={() => handleBlur("howFound")}
              placeholder="Instagram、じゃらん、知人の紹介など"
              className={errors.howFound ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* 焙煎経験 */}
        <div id="field-roastingExperience">
          <FieldWrap label="焙煎経験の有無" required error={errors.roastingExperience}>
            <input
              type="text"
              value={values.roastingExperience}
              onChange={(e) => handleChange("roastingExperience", e.target.value)}
              onBlur={() => handleBlur("roastingExperience")}
              placeholder="初めて / 手網で数回経験あり など"
              className={errors.roastingExperience ? inputErrorClass : inputClass}
            />
          </FieldWrap>
        </div>

        {/* 好きなコーヒー */}
        <div id="field-favoriteCoffee">
          <FieldWrap
            label="好きなコーヒー"
            required
            error={errors.favoriteCoffee}
            hint="焙煎度合い・生産国・よく行くお店など、自由に教えてください"
          >
            <textarea
              value={values.favoriteCoffee}
              onChange={(e) => handleChange("favoriteCoffee", e.target.value)}
              onBlur={() => handleBlur("favoriteCoffee")}
              placeholder="浅煎りのエチオピア産が好きです。Blue Bottle Coffeeによく行きます。"
              rows={3}
              className={`resize-none ${errors.favoriteCoffee ? inputErrorClass : inputClass}`}
            />
          </FieldWrap>
        </div>

        {/* 来店人数 */}
        <div id="field-numberOfGuests">
          <FieldWrap label="来店人数" required>
            <div className="flex flex-wrap gap-2">
              {(isOnsiteExperience ? GUEST_OPTIONS_ONSITE : GUEST_OPTIONS_DEFAULT).map((n) => {
                const numVal = Number(n);
                const isDisabled = isGroupExperience && groupRemaining !== null && numVal > groupRemaining;
                const isSelected = values.numberOfGuests === n;
                return (
                  <label
                    key={n}
                    className={`flex items-center justify-center gap-1 px-3 py-3 rounded-sm border text-sm transition-all duration-200 min-w-[52px] ${
                      isDisabled
                        ? "border-usuzumi/30 text-usuzumi/40 bg-usuzumi/5 cursor-not-allowed"
                        : isSelected
                        ? "border-gold bg-gold/5 text-gold cursor-pointer"
                        : "border-usuzumi/50 text-haicha hover:border-karekusa/40 cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="numberOfGuests"
                      value={n}
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && handleChange("numberOfGuests", n)}
                      className="sr-only"
                    />
                    {n}名
                  </label>
                );
              })}
            </div>
            {isGroupExperience && groupRemaining !== null && (
              <p className="text-[11px] text-konsumi/70 mt-2 leading-relaxed">
                この枠の残り受付人数: {groupRemaining}名
              </p>
            )}
            {isOnsiteExperience && (
              <p className="text-[11px] text-haicha/60 mt-2 leading-relaxed">
                10名以上のご予約はLINEまたはお問い合わせよりご相談ください
              </p>
            )}
          </FieldWrap>
        </div>

        {/* 料金リアルタイム表示 */}
        {(() => {
          const VALID_TYPES: ExperienceType[] = [
            "プライベート焙煎体験",
            "グループ焙煎体験",
            "出張焙煎体験",
          ];
          const expType = slot.experienceType as ExperienceType;
          if (!VALID_TYPES.includes(expType)) return null;
          const guests = Number(values.numberOfGuests);
          const maxForDisplay = expType === "出張焙煎体験" ? 9 : 4;
          if (guests < 1 || guests > maxForDisplay) return null;
          const pricing = calculatePrice(expType, guests);
          return (
            <motion.div
              key={`pricing-${guests}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-tsuchikabe rounded-sm px-5 py-4"
            >
              <p className="text-xs text-haicha/70 tracking-wide mb-1">
                お支払い金額（目安）
              </p>
              <p className="text-xl text-gold font-light">
                ¥{pricing.totalAmount.toLocaleString()}
                <span className="text-xs text-haicha/60 ml-1">（税込）</span>
              </p>
              <p className="text-[11px] text-haicha/60 mt-0.5">
                {pricing.breakdown}
              </p>
            </motion.div>
          );
        })()}

        {/* 出張先住所（出張焙煎体験のみ） */}
        {isOnsiteExperience && (
          <div id="field-location">
            <FieldWrap
              label="出張先の住所"
              required
              error={errors.location}
              hint="当日の出張先（会場・施設等）の住所を入力してください"
            >
              <input
                type="text"
                value={values.location}
                onChange={(e) => handleChange("location", e.target.value)}
                onBlur={() => handleBlur("location")}
                placeholder="例: 東京都八王子市○○町1-2-3"
                className={errors.location ? inputErrorClass : inputClass}
              />
            </FieldWrap>

            {/* 交通費表示 */}
            {transportFeeLoading && (
              <p className="text-xs text-haicha/60 mt-2">交通費を計算中...</p>
            )}
            {!transportFeeLoading && transportFeeError && (
              <p className="text-xs text-error mt-2">{transportFeeError}</p>
            )}
            {!transportFeeLoading && !transportFeeError && transportFee && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-haicha mt-2"
              >
                {transportFee.isFreeArea
                  ? "交通費: 無料（対象エリア）"
                  : `交通費: ¥${transportFee.fee.toLocaleString()}（往復${Math.round(transportFee.distance * 2 * 10) / 10}km）`}
              </motion.p>
            )}
          </div>
        )}

        {/* コーヒーを飲む頻度 */}
        <div id="field-coffeeDrinkingFrequency">
          <FieldWrap label="コーヒーを飲む頻度" required error={errors.coffeeDrinkingFrequency}>
            <input
              type="text"
              value={values.coffeeDrinkingFrequency}
              onChange={(e) =>
                handleChange("coffeeDrinkingFrequency", e.target.value)
              }
              onBlur={() => handleBlur("coffeeDrinkingFrequency")}
              placeholder="毎日1〜2杯 / 週に数回 など"
              className={
                errors.coffeeDrinkingFrequency ? inputErrorClass : inputClass
              }
            />
          </FieldWrap>
        </div>

        {/* 送信ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold/90 hover:bg-gold disabled:bg-gold/40 text-white py-4 text-xs tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                送信中...
              </>
            ) : (
              "内容を確認する"
            )}
          </button>
          <p className="text-[11px] text-haicha/50 text-center mt-3 tracking-wide">
            次のステップで内容を確認してから予約を確定します
          </p>
        </div>
      </form>
    </div>
  );
}
