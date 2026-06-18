"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "./Calendar";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { ReservationForm, type FormValues, type TransportFeeResult } from "./ReservationForm";
import type { CalendarSlot } from "@/features/reservation/google-calendar";
import { calculatePrice } from "@/features/reservation/pricing";
import type { ExperienceType } from "@/features/reservation/google-calendar";

// ─── 型 ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

interface StepInfo {
  num: Step;
  label: string;
}

// ─── 定数 ───────────────────────────────────────────────────────────────────

const STEPS: StepInfo[] = [
  { num: 1, label: "日程" },
  { num: 2, label: "時間" },
  { num: 3, label: "入力" },
  { num: 4, label: "確認" },
  { num: 5, label: "完了" },
];

// ─── ヘルパー ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dow = weekdays[d.getDay()];
  return `${year}年${month}月${day}日（${dow}）`;
}

const FORM_LABEL: Partial<Record<keyof FormValues, string>> = {
  email: "メールアドレス",
  name: "お名前",
  nameKana: "お名前（カナ）",
  birthDate: "生年月日",
  phone: "電話番号",
  addressPrefecture: "都道府県",
  addressCity: "市区町村",
  transportation: "交通手段",
  howFound: "どこで知ったか",
  roastingExperience: "焙煎経験",
  favoriteCoffee: "好きなコーヒー",
  numberOfGuests: "来店人数",
  coffeeDrinkingFrequency: "コーヒーを飲む頻度",
  location: "出張先住所",
};

// ─── コンポーネント ───────────────────────────────────────────────────────────

export function ReservationFlow() {
  const [step, setStep] = useState<Step>(1);
  const [prevStep, setPrevStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<CalendarSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [transportFeeResult, setTransportFeeResult] = useState<TransportFeeResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cancellationToken, setCancellationToken] = useState<string | null>(null);

  const goToStep = (next: Step) => {
    setPrevStep(step);
    setStep(next);
  };

  // Step 1 → Step 2
  const handleDateSelect = (date: string, slots: CalendarSlot[]) => {
    setSelectedDate(date);
    setDaySlots(slots);
  };

  const handleDateConfirm = () => {
    if (!selectedDate) return;
    goToStep(2);
  };

  // Step 2 → Step 3
  const handleSlotSelect = (slot: CalendarSlot) => {
    setSelectedSlot(slot);
    goToStep(3);
  };

  // Step 3 → Step 4
  const handleFormSubmit = (values: FormValues, transportFee?: TransportFeeResult) => {
    setFormValues(values);
    setTransportFeeResult(transportFee ?? null);
    goToStep(4);
  };

  // Step 4 → Stripe Checkout（API呼び出し → リダイレクト）
  const handleCheckout = async () => {
    if (!selectedSlot || !formValues) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const isOnsite = selectedSlot.experienceType === "出張焙煎体験";

    const payload: Record<string, unknown> = {
      eventId: selectedSlot.eventId,
      experienceType: selectedSlot.experienceType,
      email: formValues.email,
      name: formValues.name,
      nameKana: formValues.nameKana,
      birthDate: formValues.birthDate,
      phone: formValues.phone,
      addressPrefecture: formValues.addressPrefecture,
      addressCity: formValues.addressCity,
      transportation: formValues.transportation,
      howFound: formValues.howFound,
      roastingExperience: formValues.roastingExperience,
      favoriteCoffee: formValues.favoriteCoffee,
      numberOfGuests: Number(formValues.numberOfGuests),
      coffeeDrinkingFrequency: formValues.coffeeDrinkingFrequency,
    };

    if (isOnsite && formValues.location) {
      payload.location = formValues.location;
      if (transportFeeResult) {
        payload.transportFee = transportFeeResult.fee;
        payload.transportDistance = transportFeeResult.distance;
        payload.transportIsFreeArea = transportFeeResult.isFreeArea;
      }
    }

    try {
      const res = await fetch("/api/reservation/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setSubmitError(
          "申し訳ございません。この枠はすでに予約済みになりました。日時を選び直してください。"
        );
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "決済処理に失敗しました");
      }

      const data = (await res.json()) as { url: string | null };
      if (!data.url) {
        throw new Error("決済URLの取得に失敗しました");
      }

      // Stripe Checkoutページへリダイレクト
      window.location.href = data.url;
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "決済処理に失敗しました。しばらくしてから再度お試しください。"
      );
      setIsSubmitting(false);
    }
  };

  // ステップ間アニメーション
  const isForward = step > prevStep;
  const pageVariants = {
    enter: { opacity: 0, x: isForward ? 30 : -30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isForward ? -30 : 30 },
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* ── ステップインジケーター ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {/* 繋ぎ線 */}
          <div className="absolute top-4 left-0 right-0 h-px bg-usuzumi/40 mx-8" />
          <div
            className="absolute top-4 left-0 h-px bg-gold transition-all duration-700 ease-out mx-8"
            style={{
              width: `calc(${((step - 1) / (STEPS.length - 1)) * 100}% - 0px)`,
            }}
          />

          {STEPS.map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;

            return (
              <div
                key={s.num}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <motion.div
                  animate={{
                    backgroundColor: isCompleted
                      ? "var(--color-gold)"
                      : isActive
                      ? "var(--color-gold)"
                      : "var(--color-kominka-white)",
                    borderColor: isCompleted || isActive
                      ? "var(--color-gold)"
                      : "var(--color-usuzumi)",
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-white" : "text-usuzumi"
                      }`}
                    >
                      {s.num}
                    </span>
                  )}
                </motion.div>
                <span
                  className={`text-[10px] tracking-wide ${
                    isActive ? "text-gold" : isCompleted ? "text-haicha" : "text-usuzumi"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ステップコンテンツ ── */}
      <div className="bg-white rounded-sm shadow-sm p-6 md:p-8 min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step 1: カレンダー */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <p className="text-[11px] tracking-[0.3em] text-gold/70 uppercase mb-1">
                    Step 1
                  </p>
                  <h3 className="font-serif text-base text-konsumi tracking-wide">
                    日程を選択してください
                  </h3>
                </div>
                <Calendar onDateSelect={handleDateSelect} />
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8"
                  >
                    <button
                      onClick={handleDateConfirm}
                      className="w-full bg-gold/90 hover:bg-gold text-white py-4 text-xs tracking-[0.2em] transition-all duration-500"
                    >
                      {formatDate(selectedDate)} を選択
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 2: 時間枠 */}
            {step === 2 && selectedDate && (
              <TimeSlotPicker
                date={selectedDate}
                slots={daySlots}
                onSelect={handleSlotSelect}
                onBack={() => goToStep(1)}
              />
            )}

            {/* Step 3: フォーム */}
            {step === 3 && selectedSlot && (
              <ReservationForm
                slot={selectedSlot}
                onSubmit={handleFormSubmit}
                onBack={() => goToStep(2)}
                isSubmitting={false}
              />
            )}

            {/* Step 4: 確認画面 */}
            {step === 4 && selectedSlot && formValues && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => goToStep(3)}
                    disabled={isSubmitting}
                    aria-label="フォームに戻る"
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
                      Step 4
                    </p>
                    <h3 className="font-serif text-base text-konsumi tracking-wide">
                      内容を確認してください
                    </h3>
                  </div>
                </div>

                {/* 予約枠 */}
                <div className="bg-tsuchikabe rounded-sm px-5 py-4 mb-4">
                  <p className="text-xs text-haicha/70 tracking-wide mb-1">
                    ご予約内容
                  </p>
                  <p className="text-sm text-konsumi font-medium">
                    {selectedSlot.experienceType}
                  </p>
                  <p className="text-sm text-haicha">
                    {formatDate(selectedSlot.date)}{" "}
                    {selectedSlot.startTime}〜{selectedSlot.endTime}
                  </p>
                </div>

                {/* 料金表示 */}
                {(() => {
                  const numberOfGuests = Number(formValues.numberOfGuests);
                  const expType = selectedSlot.experienceType as ExperienceType;
                  const VALID_TYPES: ExperienceType[] = [
                    "プライベート焙煎体験",
                    "グループ焙煎体験",
                    "出張焙煎体験",
                  ];
                  if (!VALID_TYPES.includes(expType)) return null;
                  const pricing = calculatePrice(expType, numberOfGuests);
                  const isOnsite = expType === "出張焙煎体験";
                  const transport = isOnsite ? transportFeeResult : null;
                  const totalWithTransport = pricing.totalAmount + (transport?.fee ?? 0);

                  return (
                    <div className="bg-white border border-gold/30 rounded-sm px-5 py-4 mb-6">
                      <p className="text-xs text-haicha/70 tracking-wide mb-3">
                        お支払い金額
                      </p>
                      {isOnsite ? (
                        <>
                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-haicha">{expType}（{numberOfGuests}名）</span>
                              <span className="text-sumi">¥{pricing.totalAmount.toLocaleString()}</span>
                            </div>
                            {transport ? (
                              <div className="flex justify-between">
                                <span className="text-haicha">
                                  {transport.isFreeArea
                                    ? "交通費"
                                    : `交通費（往復${Math.round(transport.distance * 2 * 10) / 10}km）`}
                                </span>
                                <span className="text-sumi">
                                  {transport.isFreeArea
                                    ? "無料（対象エリア）"
                                    : `¥${transport.fee.toLocaleString()}`}
                                </span>
                              </div>
                            ) : null}
                            <div className="border-t border-usuzumi/30 pt-2 flex justify-between font-medium">
                              <span className="text-haicha">合計</span>
                              <span className="text-sumi">¥{totalWithTransport.toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-2xl text-gold font-light">
                            ¥{totalWithTransport.toLocaleString()}
                            <span className="text-xs text-haicha/60 ml-1">（税込）</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl text-gold font-light">
                            ¥{pricing.totalAmount.toLocaleString()}
                            <span className="text-xs text-haicha/60 ml-1">（税込）</span>
                          </p>
                          <p className="text-[11px] text-haicha/60 mt-1">
                            {pricing.breakdown}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* フォーム確認 */}
                <div className="space-y-3 mb-8">
                  {(
                    [
                      "email",
                      "name",
                      "nameKana",
                      "birthDate",
                      "phone",
                      "addressPrefecture",
                      "addressCity",
                      "transportation",
                      "howFound",
                      "roastingExperience",
                      "favoriteCoffee",
                      "numberOfGuests",
                      "coffeeDrinkingFrequency",
                      ...(selectedSlot.experienceType === "出張焙煎体験" ? ["location" as keyof FormValues] : []),
                    ] as (keyof FormValues)[]
                  ).map((key) => {
                    const value =
                      key === "numberOfGuests"
                        ? `${formValues[key]}名`
                        : formValues[key];
                    return (
                      <div
                        key={key}
                        className="flex gap-4 text-sm py-2.5 border-b border-usuzumi/20 last:border-0"
                      >
                        <dt className="w-32 flex-shrink-0 text-haicha text-xs tracking-wide pt-0.5">
                          {FORM_LABEL[key]}
                        </dt>
                        <dd className="text-sumi flex-1 break-all leading-relaxed">
                          {value || "—"}
                        </dd>
                      </div>
                    );
                  })}
                </div>

                {/* エラー */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 px-4 py-3 bg-error/5 border border-error/30 rounded-sm"
                  >
                    <p className="text-sm text-error leading-relaxed">
                      {submitError}
                    </p>
                    {submitError.includes("予約済み") && (
                      <button
                        onClick={() => goToStep(1)}
                        className="mt-2 text-xs text-error underline underline-offset-4"
                      >
                        日時を選び直す
                      </button>
                    )}
                  </motion.div>
                )}

                <button
                  onClick={handleCheckout}
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
                      決済ページへ移動中...
                    </>
                  ) : (
                    "お支払いへ進む"
                  )}
                </button>
                <p className="text-[11px] text-haicha/50 text-center mt-3">
                  クレジットカードで事前決済します。確定後はキャンセルポリシーに従います
                </p>
              </div>
            )}

            {/* Step 5: 完了 */}
            {step === 5 && formValues && selectedSlot && (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.1,
                  }}
                  className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6"
                >
                  <svg
                    className="w-7 h-7 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-[11px] tracking-[0.4em] text-gold/70 uppercase mb-3">
                    Reservation Complete
                  </p>
                  <h3 className="font-serif text-xl text-konsumi tracking-wider font-light mb-5">
                    ご予約が確定しました
                  </h3>
                  <div className="bg-tsuchikabe rounded-sm px-5 py-5 mb-6 text-left">
                    <p className="text-xs text-haicha/70 tracking-wide mb-2">
                      ご予約内容
                    </p>
                    <p className="text-sm text-konsumi font-medium mb-1">
                      {selectedSlot.experienceType}
                    </p>
                    <p className="text-sm text-haicha">
                      {formatDate(selectedSlot.date)}{" "}
                      {selectedSlot.startTime}〜{selectedSlot.endTime}
                    </p>
                    <p className="text-sm text-haicha mt-1">
                      {formValues.name} 様（{formValues.numberOfGuests}名）
                    </p>
                  </div>
                  <p className="text-sm text-haicha leading-loose mb-4">
                    ご予約ありがとうございます。
                    <br />
                    確認メールを <span className="text-sumi">{formValues.email}</span>{" "}
                    へお送りします。
                  </p>
                  <p className="text-xs text-haicha/60 leading-relaxed mb-6">
                    ご不明な点はLINEまたはInstagram DMでお気軽にお問い合わせください。
                  </p>

                  {cancellationToken && (
                    <div className="bg-white border border-usuzumi/30 rounded-sm px-4 py-3 mb-6">
                      <p className="text-[10px] text-haicha/60 tracking-wide mb-1">
                        キャンセルトークン（スクリーンショットで保存してください）
                      </p>
                      <p className="text-xs text-sumi font-mono break-all">
                        {cancellationToken}
                      </p>
                    </div>
                  )}

                  <a
                    href="/experience"
                    className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 text-xs tracking-[0.2em] transition-all duration-500"
                  >
                    体験ページに戻る
                  </a>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
