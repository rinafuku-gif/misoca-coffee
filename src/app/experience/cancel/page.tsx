"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

type Status = "idle" | "loading" | "success" | "error" | "invalid";

function CancelPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get("eventId") ?? "";
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>(
    eventId && token ? "idle" : "invalid"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCancel() {
    setStatus("loading");

    try {
      const res = await fetch("/api/reservation/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          cancellationToken: token,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setErrorMessage(data.error ?? "キャンセルに失敗しました");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("通信エラーが発生しました。しばらくしてから再度お試しください。");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-kominka-white flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        {/* ロゴ的なヘッダー */}
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.5em] text-gold/70 font-light uppercase mb-3">
            Misoca Coffee
          </p>
          <h1 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light">
            予約キャンセル
          </h1>
          <div className="w-10 h-px bg-gold/50 mx-auto mt-5" />
        </div>

        {/* コンテンツカード */}
        <div className="bg-white rounded-sm shadow-sm p-8 md:p-12">
          {status === "invalid" && (
            <div className="text-center">
              <p className="text-sm text-haicha leading-loose mb-8">
                キャンセルリンクが無効です。
                <br />
                予約確認メールのリンクをご確認ください。
              </p>
              <button
                type="button"
                onClick={() => router.push("/experience")}
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                体験ページへ戻る
              </button>
            </div>
          )}

          {status === "idle" && (
            <div className="text-center">
              <p className="text-sm text-haicha leading-loose mb-8">
                以下のご予約をキャンセルします。
                <br />
                よろしいですか？
              </p>
              <div className="bg-tsuchikabe/60 rounded-sm p-6 mb-10 text-left">
                <p className="text-xs text-haicha/70 tracking-wide">
                  キャンセルは取り消しできません。
                  <br />
                  再度ご予約される場合は、
                  <br />
                  予約ページからお申し込みください。
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-6 py-4 text-xs tracking-[0.2em] transition-all duration-500"
                >
                  戻る
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-error/90 hover:bg-error text-white px-6 py-4 text-xs tracking-[0.2em] transition-all duration-500"
                >
                  キャンセルする
                </button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-6" />
              <p className="text-sm text-haicha">処理中です...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-lg text-konsumi mb-4 tracking-wider font-light">
                キャンセルを受け付けました
              </h2>
              <p className="text-sm text-haicha leading-loose mb-10">
                ご予約のキャンセルを受け付けました。
                <br />
                確認メールをお送りしましたのでご確認ください。
                <br />
                <br />
                またのご予約をお待ちしております。
              </p>
              <button
                type="button"
                onClick={() => router.push("/experience")}
                className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                体験ページへ戻る
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-6 h-6 text-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-lg text-konsumi mb-4 tracking-wider font-light">
                エラーが発生しました
              </h2>
              <p className="text-sm text-haicha leading-loose mb-2">
                {errorMessage}
              </p>
              <p className="text-xs text-haicha/60 leading-loose mb-10">
                解決しない場合は下記よりお問い合わせください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
                >
                  もう一度試す
                </button>
                <a
                  href="mailto:misocacoffee@gmail.com"
                  className="inline-block border border-gold/40 text-gold hover:bg-gold hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500 text-center"
                >
                  メールで問い合わせる
                </a>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="text-center mt-10">
          <p className="text-xs text-haicha/50 tracking-wide">
            三十日珈琲（みそかこーひー）
          </p>
          <p className="text-xs text-haicha/40 mt-1">
            misocacoffee@gmail.com
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CancelPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-kominka-white flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </main>
      }
    >
      <CancelPageContent />
    </Suspense>
  );
}
