"use client";

import { motion } from "framer-motion";
import type { CalendarSlot, ExperienceType } from "@/lib/google-calendar";

// ─── 型 ─────────────────────────────────────────────────────────────────────

interface TimeSlotPickerProps {
  date: string;
  slots: CalendarSlot[];
  onSelect: (slot: CalendarSlot) => void;
  onBack: () => void;
}

// ─── 定数 ───────────────────────────────────────────────────────────────────

const EXPERIENCE_TYPE_LABEL: Record<ExperienceType, { label: string; description: string; color: string }> = {
  "プライベート焙煎体験": {
    label: "プライベート",
    description: "完全貸し切り・1組限定",
    color: "border-gold/40 bg-white hover:border-gold hover:shadow-md",
  },
  "グループ焙煎体験": {
    label: "グループ",
    description: "1名から参加OK",
    color: "border-konsumi/30 bg-white hover:border-konsumi hover:shadow-md",
  },
  "出張焙煎体験": {
    label: "出張",
    description: "出張焙煎体験",
    color: "border-karekusa/30 bg-white hover:border-karekusa hover:shadow-md",
  },
};

const EXPERIENCE_TYPE_BADGE: Record<ExperienceType, string> = {
  "プライベート焙煎体験": "bg-gold/10 text-gold border border-gold/30",
  "グループ焙煎体験": "bg-konsumi/10 text-konsumi border border-konsumi/30",
  "出張焙煎体験": "bg-karekusa/10 text-karekusa border border-karekusa/30",
};

// ─── ヘルパー ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dow = weekdays[d.getDay()];
  return `${year}年${month}月${day}日（${dow}）`;
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

export function TimeSlotPicker({ date, slots, onSelect, onBack }: TimeSlotPickerProps) {
  const formatted = formatDate(date);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <div>
      {/* ── 戻るボタン + 日付 ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          aria-label="カレンダーに戻る"
          className="w-8 h-8 flex items-center justify-center rounded-full border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white transition-all duration-300 flex-shrink-0"
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
            Time Slots
          </p>
          <h3 className="font-serif text-base text-konsumi tracking-wide">
            {formatted}
          </h3>
        </div>
      </div>

      {/* ── 時間枠一覧 ── */}
      {slots.length === 0 ? (
        <p className="text-sm text-haicha text-center py-8">
          この日の予約可能枠はありません
        </p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {slots.map((slot) => {
            const meta = EXPERIENCE_TYPE_LABEL[slot.experienceType];
            const badge = EXPERIENCE_TYPE_BADGE[slot.experienceType];

            return (
              <motion.button
                key={slot.eventId}
                variants={itemVariants}
                onClick={() => onSelect(slot)}
                className={`w-full text-left px-5 py-4 rounded-sm border transition-all duration-300 ${meta.color}`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* 時間 */}
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-lg font-light text-sumi leading-none mb-1">
                        {slot.startTime}
                        <span className="text-sm text-haicha mx-1">—</span>
                        {slot.endTime}
                      </p>
                      <p className="text-xs text-haicha">{meta.description}</p>
                    </div>
                  </div>

                  {/* 体験種別バッジ + 矢印 */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-[10px] tracking-widest px-2.5 py-1 rounded-full hidden sm:inline-block ${badge}`}
                    >
                      {meta.label}
                    </span>
                    <svg
                      className="w-4 h-4 text-haicha"
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
                  </div>
                </div>

                {/* スマホ: 体験種別バッジ */}
                <div className="mt-2 sm:hidden">
                  <span
                    className={`text-[10px] tracking-widest px-2.5 py-1 rounded-full inline-block ${badge}`}
                  >
                    {meta.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* ── 注意書き ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-[11px] text-haicha/60 text-center mt-6 leading-relaxed"
      >
        ご希望の時間枠を選択してください
        <br />
        選択後、予約フォームへ進みます
      </motion.p>
    </div>
  );
}
