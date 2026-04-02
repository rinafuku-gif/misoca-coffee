"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  eventId: string;
  experienceType: string;
  email: string;
  name: string;
  nameKana: string;
  birthDate: string;
  phone: string;
  address: string;
  transportation: string;
  howFound: string;
  roastingExperience: string;
  favoriteCoffee: string;
  numberOfGuests: number;
  coffeeDrinkingFrequency: string;
  cancellationToken: string;
  paymentIntentId: string;
}

type Status = "pending" | "success" | "error";

export function ReservationCompleteClient(props: Props) {
  const [status, setStatus] = useState<Status>("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [slotDate, setSlotDate] = useState<string>("");
  const [slotStartTime, setSlotStartTime] = useState<string>("");
  const [slotEndTime, setSlotEndTime] = useState<string>("");
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // 二重呼び出しを防ぐ（React Strict Mode の二重エフェクト対策）
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const confirmReservation = async () => {
      try {
        const payload = {
          eventId: props.eventId,
          experienceType: props.experienceType,
          email: props.email,
          name: props.name,
          nameKana: props.nameKana,
          birthDate: props.birthDate,
          phone: props.phone,
          address: props.address,
          transportation: props.transportation,
          howFound: props.howFound,
          roastingExperience: props.roastingExperience,
          favoriteCoffee: props.favoriteCoffee,
          numberOfGuests: props.numberOfGuests,
          coffeeDrinkingFrequency: props.coffeeDrinkingFrequency,
          cancellationToken: props.cancellationToken,
          paymentIntentId: props.paymentIntentId,
        };

        const res = await fetch("/api/reservation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
          date?: string;
          startTime?: string;
          endTime?: string;
        };

        if (res.status === 409) {
          // すでに予約済み = 二重呼び出し = 正常
          setStatus("success");
          return;
        }

        if (!res.ok) {
          throw new Error(data.error ?? "予約処理に失敗しました");
        }

        if (data.date) setSlotDate(data.date);
        if (data.startTime) setSlotStartTime(data.startTime);
        if (data.endTime) setSlotEndTime(data.endTime);
        setStatus("success");
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "予約処理に失敗しました。お手数ですが、お問い合わせください。"
        );
        setStatus("error");
      }
    };

    void confirmReservation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${year}年${month}月${day}日（${weekdays[d.getDay()]}）`;
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kominka-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-sm text-haicha tracking-wide">予約を確定しています...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kominka-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-7 h-7 text-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-[11px] tracking-[0.4em] text-error/60 uppercase mb-3">
            Error
          </p>
          <h1 className="font-serif text-xl text-konsumi tracking-wider font-light mb-4">
            予約処理に問題が発生しました
          </h1>
          <p className="text-sm text-haicha leading-relaxed mb-2">
            {errorMessage}
          </p>
          <p className="text-xs text-haicha/60 leading-relaxed mb-8">
            決済は完了しています。お手数ですが、InstagramまたはLINEにてご連絡ください。
          </p>
          <Link
            href="/experience"
            className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 text-xs tracking-[0.2em] transition-all duration-500"
          >
            体験ページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-kominka-white px-4 py-16">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
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
          className="text-center"
        >
          <p className="text-[11px] tracking-[0.4em] text-gold/70 uppercase mb-3">
            Reservation Complete
          </p>
          <h1 className="font-serif text-xl text-konsumi tracking-wider font-light mb-5">
            ご予約が確定しました
          </h1>

          <div className="bg-white rounded-sm shadow-sm px-6 py-6 mb-6 text-left">
            <p className="text-xs text-haicha/70 tracking-wide mb-3">
              ご予約内容
            </p>
            <p className="text-sm text-konsumi font-medium mb-1">
              {props.experienceType}
            </p>
            {slotDate && (
              <p className="text-sm text-haicha">
                {formatDate(slotDate)}{" "}
                {slotStartTime}〜{slotEndTime}
              </p>
            )}
            <p className="text-sm text-haicha mt-1">
              {props.name} 様（{props.numberOfGuests}名）
            </p>
          </div>

          <p className="text-sm text-haicha leading-loose mb-4">
            ご予約ありがとうございます。
            <br />
            確認メールを{" "}
            <span className="text-sumi">{props.email}</span>{" "}
            へお送りします。
          </p>
          <p className="text-xs text-haicha/60 leading-relaxed mb-6">
            ご不明な点はLINEまたはInstagram DMでお気軽にお問い合わせください。
          </p>

          <div className="bg-white border border-usuzumi/30 rounded-sm px-4 py-3 mb-8 text-left">
            <p className="text-[10px] text-haicha/60 tracking-wide mb-1">
              キャンセルトークン（スクリーンショットで保存してください）
            </p>
            <p className="text-xs text-sumi font-mono break-all">
              {props.cancellationToken}
            </p>
          </div>

          <Link
            href="/experience"
            className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 text-xs tracking-[0.2em] transition-all duration-500"
          >
            体験ページに戻る
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
