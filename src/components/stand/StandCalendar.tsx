"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---- 型定義 ----------------------------------------------------------------

interface StandEvent {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  description: string;
}

interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  event: StandEvent | null;
}

// ---- カレンダー計算 ----------------------------------------------------------

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
] as const;

function buildCalendarCells(year: number, month: number, events: StandEvent[]): DayCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // 月曜始まり: 月初の曜日（0=日→6, 1=月→0）
  const startDow = (firstDay.getDay() + 6) % 7;
  const endDow = (lastDay.getDay() + 6) % 7;

  const cells: DayCell[] = [];

  // 前月の日付
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, -i);
    cells.push({ date: d, isCurrentMonth: false, event: null });
  }

  // 当月の日付
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const event = events.find((e) => e.date === dateStr) ?? null;
    cells.push({ date, isCurrentMonth: true, event });
  }

  // 翌月の日付（42マスに揃える）
  const remaining = (7 - ((endDow + 1) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, isCurrentMonth: false, event: null });
  }

  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const d = new Date(last.date);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, isCurrentMonth: false, event: null });
  }

  return cells;
}

// ---- メインコンポーネント ---------------------------------------------------

export function StandCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [events, setEvents] = useState<StandEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1); // 1=次月, -1=前月
  const [animKey, setAnimKey] = useState(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  const fetchEvents = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stand/calendar?year=${y}&month=${m}`);
      if (!res.ok) throw new Error("取得に失敗しました");
      const data = (await res.json()) as { events: StandEvent[] };
      setEvents(data.events);
    } catch {
      setError("営業日情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents(year, month);
  }, [year, month, fetchEvents]);

  function goPrev() {
    setDirection(-1);
    setAnimKey((k) => k + 1);
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    setDirection(1);
    setAnimKey((k) => k + 1);
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // PDF ダウンロード
  async function downloadPDF() {
    if (!calendarRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(calendarRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#5F5E4A",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight();  // 297mm

      // A4全面に背景色を塗る
      pdf.setFillColor(95, 94, 74); // #5F5E4A
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      // カレンダーをA4全面に引き伸ばし（上下の余白を最小限に）
      const drawWidth = pdfWidth;
      const drawHeight = drawWidth * (canvas.height / canvas.width);
      const offsetX = 0;
      // 上下余白を均等にするが、ページ高さを超える場合は高さに合わせる
      let finalWidth = drawWidth;
      let finalHeight = drawHeight;
      if (drawHeight > pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * (canvas.width / canvas.height);
      }
      const offsetY = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "JPEG", (pdfWidth - finalWidth) / 2, offsetY, finalWidth, finalHeight);
      pdf.save(`misoca-coffee-stand-${year}-${String(month).padStart(2, "0")}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  // Instagram用画像ダウンロード（1080×1350 / 4:5）
  async function downloadInstagram() {
    if (!calendarRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");

      const srcCanvas = await html2canvas(calendarRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#5F5E4A",
      });

      const targetW = 1080;
      const targetH = 1350;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) throw new Error("canvas context error");

      ctx.fillStyle = "#5F5E4A";
      ctx.fillRect(0, 0, targetW, targetH);

      const srcRatio = srcCanvas.width / srcCanvas.height;
      const dstRatio = targetW / targetH;
      let drawW = targetW;
      let drawH = targetW / srcRatio;
      if (srcRatio < dstRatio) {
        drawH = targetH;
        drawW = targetH * srcRatio;
      }
      const dx = (targetW - drawW) / 2;
      const dy = (targetH - drawH) / 2;

      ctx.drawImage(srcCanvas, dx, dy, drawW, drawH);

      const link = document.createElement("a");
      link.download = `misoca-coffee-stand-instagram-${year}-${String(month).padStart(2, "0")}.png`;
      link.href = outCanvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  const cells = buildCalendarCells(year, month, events);

  // スライドアニメーションのバリアント
  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
    exit: (d: number) => ({
      x: d > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
    }),
  };

  // サイトカラー定数
  // globals.css より:
  //   --color-karekusa: #5F5E4A  (オリーブグリーン / 背景)
  //   --color-karekusa-dark: #4A4B3A (濃いオリーブ)
  //   --color-gold: #C8973E  (アクセント)
  //   --color-konsumi: #4A4B5F (ブルーグレー / 営業日強調)
  //   --color-ainezu: #A0A1B5 (淡いブルーグレー)
  //   --color-kominka-white: #F7F6F1 (オフホワイト)
  //   --color-usuzumi: #D5D1C9 (薄いグレー)
  //   --color-haicha: #7A7569 (グレイッシュブラウン)
  //   --color-sumi: #2A2A2A (ほぼ黒)

  const BG = "#5F5E4A";          // karekusa
  const BG_DARK = "#4A4B3A";     // karekusa-dark
  const GOLD = "#C8973E";        // gold
  const KONSUMI = "#4A4B5F";     // konsumi (営業日背景)
  const AINEZU = "#A0A1B5";      // ainezu (営業日テキスト補助)
  const KOMINKA_WHITE = "#F7F6F1"; // kominka-white
  const USUZUMI = "#D5D1C9";     // usuzumi
  const HAICHA = "#7A7569";      // haicha

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-6"
    >
      {/* カレンダー本体 */}
      <div
        ref={calendarRef}
        style={{
          backgroundColor: BG,
          padding: "28px",
          width: "100%",
          maxWidth: "640px",
          borderRadius: "2px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* 上部ゴールドライン */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${GOLD} 30%, ${GOLD} 70%, transparent)`,
          }}
        />

        {/* ── ヘッダー: 左=月 / 中央=ロゴ / 右=QR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          {/* 左: 月数字 */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flex: 1 }}>
            <span
              style={{
                fontSize: "72px",
                fontWeight: 200,
                lineHeight: 1,
                color: KOMINKA_WHITE,
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "-0.02em",
              }}
            >
              {month}
            </span>
            <div style={{ lineHeight: 1.4 }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 400,
                  color: `${USUZUMI}CC`,
                  letterSpacing: "0.08em",
                }}
              >
                {year}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 300,
                  color: KOMINKA_WHITE,
                  letterSpacing: "0.1em",
                }}
              >
                {MONTH_NAMES[month - 1]}
              </div>
            </div>
          </div>

          {/* 中央: ロゴ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-circle-green.jpg"
              alt="三十日珈琲 ロゴ"
              width={80}
              height={80}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: `1.5px solid ${GOLD}66`,
              }}
            />
          </div>

          {/* 右: QRコード + Instagram情報 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "5px",
              flex: 1,
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "4px",
                overflow: "hidden",
                backgroundColor: BG_DARK,
                padding: "3px",
                border: `1px solid ${GOLD}44`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/instagram-qr.png"
                alt="Instagram QRコード"
                width={58}
                height={58}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                fontSize: "8px",
                letterSpacing: "0.06em",
                fontWeight: 600,
                color: GOLD,
                textAlign: "right",
              }}
            >
              @MISOCA_COFFEESTAND
            </div>
            <div
              style={{
                fontSize: "7px",
                letterSpacing: "0.02em",
                lineHeight: 1.5,
                color: `${USUZUMI}99`,
                textAlign: "right",
              }}
            >
              最新の情報はInstagramにて発信中
              <br />
              QRコードからご確認お願いします。
            </div>
          </div>
        </div>

        {/* タイトルライン */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              height: "1px",
              flex: 1,
              background: `${KOMINKA_WHITE}33`,
            }}
          />
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "0.28em",
              fontWeight: 400,
              color: `${USUZUMI}CC`,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            misoca coffee stand openday
          </span>
          <div
            style={{
              height: "1px",
              flex: 1,
              background: `${KOMINKA_WHITE}33`,
            }}
          />
        </div>

        {/* ── カレンダーグリッド（アニメーション付き） ── */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={animKey}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* 曜日ヘッダー */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  marginBottom: "4px",
                }}
              >
                {WEEK_DAYS.map((day) => {
                  const isSat = day === "SAT";
                  const isSun = day === "SUN";
                  return (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        padding: "6px 2px",
                        fontSize: "9px",
                        letterSpacing: "0.12em",
                        fontWeight: 500,
                        color: isSat
                          ? AINEZU
                          : isSun
                          ? "#C8A0A0"
                          : `${USUZUMI}BB`,
                        borderBottom: `1px solid ${KOMINKA_WHITE}22`,
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* 日付グリッド */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "2px",
                }}
              >
                {cells.map((cell, idx) => {
                  const dow = idx % 7; // 0=月, 5=土, 6=日
                  const isSat = dow === 5;
                  const isSun = dow === 6;
                  const isOpen = cell.event !== null && cell.isCurrentMonth;

                  // 色の決定: セルは白ベース、営業日だけ色付け
                  let bgColor = cell.isCurrentMonth ? KOMINKA_WHITE : `${USUZUMI}44`;
                  let borderColor = `${USUZUMI}66`;
                  let dateColor = cell.isCurrentMonth
                    ? isSat
                      ? "#4A6FA5"
                      : isSun
                      ? "#B85555"
                      : HAICHA
                    : `${USUZUMI}88`;

                  if (isOpen) {
                    bgColor = `${KONSUMI}`;
                    borderColor = `${KONSUMI}`;
                    dateColor = KOMINKA_WHITE;
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: bgColor,
                        border: `1px solid ${borderColor}`,
                        padding: "6px 5px 8px",
                        minHeight: "56px",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: "1px",
                      }}
                    >
                      {/* 日付番号 */}
                      <span
                        style={{
                          color: dateColor,
                          fontSize: "13px",
                          fontWeight: isOpen ? 600 : 300,
                          lineHeight: 1,
                          marginBottom: "4px",
                          fontFamily: isOpen ? "'Playfair Display', serif" : "inherit",
                        }}
                      >
                        {cell.date.getDate()}
                      </span>

                      {/* 営業時間バッジ */}
                      {isOpen && cell.event && (
                        <>
                          {/* 時間 */}
                          <span
                            style={{
                              fontSize: "8px",
                              lineHeight: 1.3,
                              fontWeight: 500,
                              color: KOMINKA_WHITE,
                              letterSpacing: "0.02em",
                            }}
                          >
                            {cell.event.startTime}
                            <br />
                            -{cell.event.endTime}
                          </span>
                          {/* 補足テキスト */}
                          {cell.event.description && (
                            <span
                              style={{
                                color: `${AINEZU}CC`,
                                fontSize: "7px",
                                lineHeight: 1.4,
                                marginTop: "3px",
                              }}
                            >
                              {cell.event.description}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 下部装飾ライン */}
        <div
          style={{
            height: "1px",
            marginTop: "16px",
            background: `linear-gradient(90deg, transparent, ${KOMINKA_WHITE}33 50%, transparent)`,
          }}
        />
      </div>

      {/* ── ローディング・エラー ── */}
      {loading && (
        <p className="text-xs tracking-[0.15em] text-haicha">読み込み中...</p>
      )}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {/* ── 月移動ボタン ── */}
      <div className="flex items-center gap-6">
        <button
          onClick={goPrev}
          className="group flex items-center gap-2 text-xs tracking-[0.2em] text-haicha hover:text-gold transition-colors duration-300 px-4 py-2"
          aria-label="前の月"
        >
          <svg
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            className="transition-transform duration-300 group-hover:-translate-x-1"
          >
            <path d="M13 4H1M1 4L5 1M1 4L5 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          前月
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-[0.3em] text-gold/50 uppercase font-light">
            {MONTH_NAMES[month - 1]}
          </span>
          <span className="text-sm text-konsumi font-light tracking-[0.2em]">
            {year}年 {month}月
          </span>
        </div>

        <button
          onClick={goNext}
          className="group flex items-center gap-2 text-xs tracking-[0.2em] text-haicha hover:text-gold transition-colors duration-300 px-4 py-2"
          aria-label="次の月"
        >
          翌月
          <svg
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M1 4H13M13 4L9 1M13 4L9 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── ダウンロードボタン ── */}
      <div className="relative w-full max-w-[640px]">
        <button
          onClick={() => setShowDownloadMenu((v) => !v)}
          disabled={downloading || loading}
          className="w-full flex items-center justify-center gap-2 bg-gold/90 hover:bg-gold disabled:opacity-40 text-white px-6 py-3.5 text-[11px] tracking-[0.2em] transition-all duration-300 group"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          >
            <path d="M7 1v8M7 9L4 6M7 9l3-3M1 11v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {downloading ? "生成中..." : "カレンダーダウンロード"}
        </button>
        {showDownloadMenu && !downloading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-usuzumi/30 shadow-lg z-10 overflow-hidden">
            <button
              onClick={() => { setShowDownloadMenu(false); void downloadPDF(); }}
              className="w-full px-6 py-3 text-[11px] tracking-[0.1em] text-haicha hover:bg-kominka-white transition-colors text-left"
            >
              PDF（A4 印刷用）
            </button>
            <div className="border-t border-usuzumi/20" />
            <button
              onClick={() => { setShowDownloadMenu(false); void downloadInstagram(); }}
              className="w-full px-6 py-3 text-[11px] tracking-[0.1em] text-haicha hover:bg-kominka-white transition-colors text-left"
            >
              PNG（SNS投稿用）
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
