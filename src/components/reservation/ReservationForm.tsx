"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CalendarSlot, ExperienceType } from "@/lib/google-calendar";
import { calculatePrice } from "@/lib/pricing";

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
}

interface FieldError {
  [key: string]: string;
}

interface ReservationFormProps {
  slot: CalendarSlot;
  onSubmit: (values: FormValues) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

// ─── 定数 ───────────────────────────────────────────────────────────────────

const TRANSPORTATION_OPTIONS = ["車", "電車", "その他"] as const;
const GUEST_OPTIONS = ["1", "2", "3", "4"] as const;

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
};

// ─── バリデーション ───────────────────────────────────────────────────────────

function validateForm(values: FormValues): FieldError {
  const errors: FieldError = {};

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

  const handleChange = (
    field: keyof FormValues,
    value: string
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched.has(field)) {
      const newValues = { ...values, [field]: value };
      const newErrors = validateForm(newValues);
      setErrors((prev) => ({
        ...prev,
        [field]: newErrors[field] ?? "",
      }));
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => new Set(prev).add(field));
    const newErrors = validateForm(values);
    setErrors((prev) => ({
      ...prev,
      [field]: newErrors[field] ?? "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allErrors = validateForm(values);
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
    onSubmit(values);
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
            <div className="flex gap-3">
              {GUEST_OPTIONS.map((n) => (
                <label
                  key={n}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-3 rounded-sm border cursor-pointer text-sm transition-all duration-200 ${
                    values.numberOfGuests === n
                      ? "border-gold bg-gold/5 text-gold"
                      : "border-usuzumi/50 text-haicha hover:border-karekusa/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="numberOfGuests"
                    value={n}
                    checked={values.numberOfGuests === n}
                    onChange={() => handleChange("numberOfGuests", n)}
                    className="sr-only"
                  />
                  {n}名
                </label>
              ))}
            </div>
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
          if (guests < 1 || guests > 4) return null;
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
