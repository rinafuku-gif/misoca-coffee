"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  // 月初・月末
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // 月曜始まり: 月初の曜日（0=日→6, 1=月→0, ...）
  const startDow = (firstDay.getDay() + 6) % 7; // 0=月, 6=日

  // 月末の曜日
  const endDow = (lastDay.getDay() + 6) % 7;

  const cells: DayCell[] = [];

  // 前月の日付を埋める
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

  // 翌月の日付を埋める（6行×7=42マス になるよう）
  const remaining = (7 - ((endDow + 1) % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, isCurrentMonth: false, event: null });
  }

  // 行数が5行の場合は35マス、6行なら42マス（常に42マスに揃える）
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
  const calendarRef = useRef<HTMLDivElement>(null);

  // カレンダーデータ取得
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

  // 月移動
  function goPrev() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
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
        backgroundColor: "#5C5C4A",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let drawWidth = pdfWidth;
      let drawHeight = pdfWidth / imgRatio;
      if (imgRatio < pdfRatio) {
        drawHeight = pdfHeight;
        drawWidth = pdfHeight * imgRatio;
      }

      const offsetX = (pdfWidth - drawWidth) / 2;
      const offsetY = (pdfHeight - drawHeight) / 2;

      pdf.addImage(imgData, "JPEG", offsetX, offsetY, drawWidth, drawHeight);
      pdf.save(`misoca-coffee-stand-${year}-${String(month).padStart(2, "0")}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  // Instagram用画像ダウンロード
  async function downloadInstagram() {
    if (!calendarRef.current || downloading) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");

      const srcCanvas = await html2canvas(calendarRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#5C5C4A",
      });

      // 1080×1350 (4:5) にリサイズ
      const targetW = 1080;
      const targetH = 1350;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = targetW;
      outCanvas.height = targetH;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) throw new Error("canvas context error");

      ctx.fillStyle = "#5C5C4A";
      ctx.fillRect(0, 0, targetW, targetH);

      // アスペクト比を維持してセンタリング
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

  return (
    <div className="flex flex-col items-center gap-6">
      {/* カレンダー本体 */}
      <div
        ref={calendarRef}
        className="w-full max-w-2xl rounded-lg overflow-hidden"
        style={{ backgroundColor: "#5C5C4A", padding: "28px" }}
      >
        {/* ヘッダー上部 */}
        <div className="flex items-start justify-between mb-4">
          {/* 左: 月数字 */}
          <div className="flex items-baseline gap-3">
            <span style={{ fontSize: "72px", fontWeight: 300, lineHeight: 1, color: "#fff" }}>
              {month}
            </span>
            <div style={{ color: "#fff", lineHeight: 1.3 }}>
              <div style={{ fontSize: "13px", fontWeight: 400 }}>{year}</div>
              <div style={{ fontSize: "15px", fontWeight: 300 }}>{MONTH_NAMES[month - 1]}</div>
            </div>
          </div>

          {/* 中央: ロゴ */}
          <div className="flex flex-col items-center" style={{ color: "#fff" }}>
            {/* ロゴマーク（葉っぱモチーフのSVG） */}
            <svg
              viewBox="0 0 60 50"
              width="60"
              height="50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginBottom: "4px" }}
            >
              {/* コーヒーカップシルエット */}
              <ellipse cx="30" cy="20" rx="14" ry="8" stroke="#fff" strokeWidth="1.5" fill="none" />
              <path d="M16 20 Q14 34 30 38 Q46 34 44 20" stroke="#fff" strokeWidth="1.5" fill="none" />
              <path d="M44 22 Q52 22 52 28 Q52 34 44 34" stroke="#fff" strokeWidth="1.2" fill="none" />
              {/* 湯気 */}
              <path d="M24 14 Q26 10 24 6" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
              <path d="M30 13 Q32 9 30 5" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
              <path d="M36 14 Q38 10 36 6" stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
            </svg>
            <span style={{ fontSize: "12px", letterSpacing: "0.12em", fontWeight: 300 }}>
              misoca coffee
            </span>
          </div>

          {/* 右: Instagram情報 */}
          <div
            className="flex flex-col items-end text-right"
            style={{ color: "#fff", maxWidth: "140px" }}
          >
            {/* QRコードプレースホルダー */}
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#fff",
                borderRadius: "4px",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "flex-end",
              }}
            >
              {/* QRコード風パターン */}
              <svg viewBox="0 0 40 40" width="56" height="56">
                <rect x="2" y="2" width="16" height="16" fill="none" stroke="#333" strokeWidth="2" />
                <rect x="6" y="6" width="8" height="8" fill="#333" />
                <rect x="22" y="2" width="16" height="16" fill="none" stroke="#333" strokeWidth="2" />
                <rect x="26" y="6" width="8" height="8" fill="#333" />
                <rect x="2" y="22" width="16" height="16" fill="none" stroke="#333" strokeWidth="2" />
                <rect x="6" y="26" width="8" height="8" fill="#333" />
                <rect x="22" y="22" width="4" height="4" fill="#333" />
                <rect x="28" y="22" width="4" height="4" fill="#333" />
                <rect x="34" y="22" width="4" height="4" fill="#333" />
                <rect x="22" y="28" width="4" height="4" fill="#333" />
                <rect x="28" y="34" width="4" height="4" fill="#333" />
                <rect x="34" y="28" width="4" height="4" fill="#333" />
                <rect x="34" y="34" width="4" height="4" fill="#333" />
              </svg>
            </div>
            <div style={{ fontSize: "9px", letterSpacing: "0.05em", fontWeight: 500 }}>
              MISOCA_COFFEESTAND
            </div>
            <div style={{ fontSize: "7px", letterSpacing: "0.02em", lineHeight: 1.5, marginTop: "3px", color: "rgba(255,255,255,0.8)" }}>
              最新の情報はInstagramにて発信中
              <br />
              上記QRコードからご確認お願いします。
            </div>
          </div>
        </div>

        {/* タイトル */}
        <div style={{ color: "#fff", fontSize: "13px", letterSpacing: "0.1em", fontWeight: 300, marginBottom: "12px" }}>
          misoca coffee stand OPENDAY
        </div>

        {/* カレンダーグリッド */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "4px",
            overflow: "hidden",
            fontSize: "12px",
          }}
        >
          {/* 曜日ヘッダー */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {WEEK_DAYS.map((day) => {
              const isSat = day === "SAT";
              const isSun = day === "SUN";
              return (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    padding: "6px 2px",
                    fontSize: "10px",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                    backgroundColor: isSat ? "#dce8f5" : isSun ? "#fde8e8" : "#f0ede8",
                    color: isSat ? "#3a5a8a" : isSun ? "#8a3a3a" : "#5C5C4A",
                    borderBottom: "1px solid #e0ddd6",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* 日付グリッド */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((cell, idx) => {
              const dow = idx % 7; // 0=月, 5=土, 6=日
              const isSat = dow === 5;
              const isSun = dow === 6;
              const isOpen = cell.event !== null && cell.isCurrentMonth;

              let bgColor = "#fff";
              let textColor = cell.isCurrentMonth ? "#3d3a34" : "#c0bdb5";
              if (isOpen) {
                bgColor = "#4A6FA5";
                textColor = "#fff";
              } else if (!cell.isCurrentMonth) {
                bgColor = "#fafaf8";
              } else if (isSat) {
                textColor = "#3a5a8a";
              } else if (isSun) {
                textColor = "#8a3a3a";
              }

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: bgColor,
                    borderRight: "1px solid #e0ddd6",
                    borderBottom: "1px solid #e0ddd6",
                    padding: "5px 4px",
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* 日付番号 */}
                  <span
                    style={{
                      color: textColor,
                      fontSize: "12px",
                      fontWeight: isOpen ? 600 : 400,
                      lineHeight: 1,
                      marginBottom: "3px",
                    }}
                  >
                    {cell.date.getDate()}
                  </span>

                  {/* 営業時間 */}
                  {isOpen && cell.event && (
                    <>
                      <span style={{ color: "#fff", fontSize: "9px", lineHeight: 1.3, fontWeight: 600 }}>
                        {cell.event.startTime}-{cell.event.endTime}
                      </span>
                      {cell.event.description && (
                        <span
                          style={{
                            color: "rgba(255,255,255,0.85)",
                            fontSize: "8px",
                            lineHeight: 1.3,
                            marginTop: "2px",
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
        </div>
      </div>

      {/* ローディング・エラー */}
      {loading && (
        <p className="text-sm text-haicha">読み込み中...</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* 月移動ボタン */}
      <div className="flex items-center gap-8">
        <button
          onClick={goPrev}
          className="text-xs tracking-[0.2em] text-haicha hover:text-konsumi transition-colors px-4 py-2 border border-usuzumi/30 hover:border-usuzumi/60"
          aria-label="前の月"
        >
          ← 前月
        </button>
        <span className="text-sm text-konsumi font-light tracking-wider">
          {year}年 {month}月
        </span>
        <button
          onClick={goNext}
          className="text-xs tracking-[0.2em] text-haicha hover:text-konsumi transition-colors px-4 py-2 border border-usuzumi/30 hover:border-usuzumi/60"
          aria-label="次の月"
        >
          翌月 →
        </button>
      </div>

      {/* ダウンロードボタン */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <button
          onClick={() => { void downloadPDF(); }}
          disabled={downloading || loading}
          className="flex-1 bg-gold/90 hover:bg-gold disabled:opacity-50 text-white px-6 py-3 text-xs tracking-[0.15em] transition-colors duration-300"
        >
          {downloading ? "生成中..." : "PDFダウンロード（A4）"}
        </button>
        <button
          onClick={() => { void downloadInstagram(); }}
          disabled={downloading || loading}
          className="flex-1 border border-karekusa/40 text-karekusa hover:bg-karekusa hover:text-white disabled:opacity-50 px-6 py-3 text-xs tracking-[0.15em] transition-colors duration-300"
        >
          {downloading ? "生成中..." : "Instagram用画像をダウンロード"}
        </button>
      </div>
    </div>
  );
}
