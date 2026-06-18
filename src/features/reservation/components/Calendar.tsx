"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CalendarSlot, ExperienceType } from "@/features/reservation/google-calendar";

// ─── 型 ─────────────────────────────────────────────────────────────────────

interface CalendarProps {
  onDateSelect: (date: string, slots: CalendarSlot[]) => void;
}

interface MonthSlots {
  [date: string]: CalendarSlot[];
}

// ─── 定数 ───────────────────────────────────────────────────────────────────

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const EXPERIENCE_TYPE_COLOR: Record<ExperienceType, string> = {
  "プライベート焙煎体験": "bg-gold/80 text-white",
  "グループ焙煎体験": "bg-konsumi/70 text-white",
  "出張焙煎体験": "bg-karekusa/70 text-white",
};

const EXPERIENCE_TYPE_DOT: Record<ExperienceType, string> = {
  "プライベート焙煎体験": "bg-gold",
  "グループ焙煎体験": "bg-konsumi",
  "出張焙煎体験": "bg-karekusa",
};

// ─── ヘルパー ────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function getUniqueTypes(slots: CalendarSlot[]): ExperienceType[] {
  const seen = new Set<ExperienceType>();
  for (const slot of slots) {
    seen.add(slot.experienceType);
  }
  return Array.from(seen);
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

export function Calendar({ onDateSelect }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [monthSlots, setMonthSlots] = useState<MonthSlots>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const fetchSlots = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendar/slots?year=${y}&month=${m}`);
      if (!res.ok) {
        throw new Error("予約可能枠の取得に失敗しました");
      }
      const data = (await res.json()) as { slots: CalendarSlot[] };
      const grouped: MonthSlots = {};
      for (const slot of data.slots) {
        if (!grouped[slot.date]) {
          grouped[slot.date] = [];
        }
        grouped[slot.date].push(slot);
      }
      setMonthSlots(grouped);
    } catch {
      setError("空き状況を取得できませんでした。しばらくしてから再度お試しください。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots(year, month);
  }, [year, month, fetchSlots]);

  const goToPrevMonth = () => {
    setDirection("prev");
    setSelectedDate(null);
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection("next");
    setSelectedDate(null);
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDateClick = (dateKey: string) => {
    const slots = monthSlots[dateKey];
    if (!slots || slots.length === 0) return;
    setSelectedDate(dateKey);
    onDateSelect(dateKey, slots);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // カレンダーのセル（空白 + 日付）
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // 6行になるよう末尾を埋める
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      cells.push(null);
    }
  }

  // 前月に戻れるか（今月より前は不可）
  const isPrevDisabled =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month <= today.getMonth() + 1);

  const slideVariants = {
    enter: (dir: "next" | "prev") => ({
      x: dir === "next" ? 24 : -24,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: "next" | "prev") => ({
      x: dir === "next" ? -24 : 24,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full">
      {/* ── ヘッダー: 月移動 ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          disabled={isPrevDisabled}
          aria-label="前の月"
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-300 ${
            isPrevDisabled
              ? "border-usuzumi/30 text-usuzumi cursor-not-allowed"
              : "border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white hover:border-karekusa"
          }`}
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

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="font-serif text-lg text-konsumi tracking-wider">
              {year}年{month}月
            </p>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={goToNextMonth}
          aria-label="次の月"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white hover:border-karekusa transition-all duration-300"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* ── 体験種別 凡例 ── */}
      <div className="flex flex-wrap gap-3 mb-5 justify-center">
        {(
          [
            "プライベート焙煎体験",
            "グループ焙煎体験",
            "出張焙煎体験",
          ] as ExperienceType[]
        ).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${EXPERIENCE_TYPE_DOT[type]}`}
            />
            <span className="text-[11px] text-haicha tracking-wide">{type}</span>
          </div>
        ))}
      </div>

      {/* ── 曜日ヘッダー ── */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`text-center text-[11px] tracking-wider py-1 font-medium ${
              i === 0
                ? "text-error/70"
                : i === 6
                ? "text-ainezu"
                : "text-haicha"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── カレンダー本体 ── */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gold/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-haicha">{error}</p>
          <button
            onClick={() => fetchSlots(year, month)}
            className="mt-4 text-xs text-gold underline underline-offset-4"
          >
            再読み込み
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`grid-${year}-${month}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-7 gap-y-1"
          >
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const dateKey = toDateKey(year, month, day);
              const slots = monthSlots[dateKey] ?? [];
              const hasSlot = slots.length > 0;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const isPast = dateKey < todayKey;
              const dow = (firstDow + day - 1) % 7;
              const types = getUniqueTypes(slots);

              return (
                <div key={dateKey} className="flex justify-center py-0.5">
                  <button
                    onClick={() => handleDateClick(dateKey)}
                    disabled={!hasSlot || isPast}
                    aria-label={`${month}月${day}日${hasSlot ? "（予約可能）" : "（予約不可）"}`}
                    aria-pressed={isSelected}
                    className={`
                      relative w-10 h-10 md:w-11 md:h-11 rounded-full flex flex-col items-center justify-center
                      transition-all duration-300 text-sm
                      ${isSelected
                        ? "bg-gold text-white shadow-md"
                        : hasSlot && !isPast
                        ? "hover:bg-tsuchikabe cursor-pointer"
                        : "cursor-default"
                      }
                      ${isToday && !isSelected
                        ? "ring-1 ring-gold/50"
                        : ""
                      }
                      ${isPast || !hasSlot
                        ? "text-usuzumi"
                        : dow === 0
                        ? "text-error/70"
                        : dow === 6
                        ? "text-ainezu"
                        : "text-sumi"
                      }
                    `}
                  >
                    <span className="leading-none text-[13px] md:text-sm">
                      {day}
                    </span>
                    {/* 体験種別ドット */}
                    {hasSlot && !isPast && (
                      <div className="flex gap-0.5 mt-0.5">
                        {types.slice(0, 3).map((type) => (
                          <span
                            key={type}
                            className={`w-1 h-1 rounded-full flex-shrink-0 ${
                              isSelected
                                ? "bg-white/70"
                                : EXPERIENCE_TYPE_DOT[type]
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── 選択中の日の体験種別バッジ ── */}
      <AnimatePresence>
        {selectedDate && monthSlots[selectedDate] && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 pt-4 border-t border-usuzumi/30"
          >
            <p className="text-xs text-haicha text-center mb-3 tracking-wide">
              {(() => { const [y, m, d] = selectedDate.split("-"); return `${y}年${m}月${d}日`; })()} の予約可能枠
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {getUniqueTypes(monthSlots[selectedDate]).map((type) => (
                <span
                  key={type}
                  className={`text-[10px] tracking-widest px-3 py-1 rounded-full font-light ${EXPERIENCE_TYPE_COLOR[type]}`}
                >
                  {type}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
