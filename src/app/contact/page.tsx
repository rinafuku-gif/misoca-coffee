"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

const inquiryTypes = [
  "焙煎体験の予約",
  "ケータリングのお問い合わせ",
  "出張焙煎のお問い合わせ",
  "オンラインショップについて",
  "その他",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    type: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.name || !form.email || !form.message) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("sent");
        setForm({ type: "", name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClasses =
    "w-full border border-usuzumi/30 px-4 py-3.5 text-sm focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none transition-all duration-300 bg-white";

  return (
    <>
      <PageHero
        title="CONTACT"
        subtitle="お問い合わせ"
        description="ご質問・ご相談はお気軽にどうぞ。2営業日以内にご返信いたします。"
      />

      {/* LINE誘導 */}
      <section className="bg-tsuchikabe py-16 md:py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Recommended
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
              LINEでのお問い合わせが便利です
            </h2>
            <p className="text-haicha leading-loose mb-10">
              焙煎体験の予約やご質問は、LINE公式アカウントからが一番スムーズです。
              <br />
              お気軽にメッセージをお送りください。
            </p>
            <a
              href="https://lin.ee/ihDBxM8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white px-10 py-4 text-xs tracking-[0.2em] transition-all duration-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINE公式アカウントを友だち追加
            </a>
            <p className="text-xs text-haicha/60 mt-6">
              Instagram DM（@misoca_coffee）でもお問い合わせいただけます
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* フォームでのお問い合わせ */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-center text-sm text-haicha mb-12">
              LINEをご利用でない方は、以下のフォームからもお問い合わせいただけます。
            </p>
          </ScrollReveal>
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            {/* Form */}
            <div className="w-full md:w-2/3">
              <ScrollReveal>
                <AnimatePresence mode="wait">
                  {status === "sent" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.6 }}
                      className="text-center py-20"
                    >
                      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8">
                        <svg
                          className="w-8 h-8 text-gold"
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
                      </div>
                      <h2 className="text-xl font-serif text-konsumi tracking-wider font-light mb-6">
                        お問い合わせありがとうございます
                      </h2>
                      <p className="text-haicha leading-loose">
                        2営業日以内にご返信いたします。
                        <br />
                        しばらくお待ちください。
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleSubmit}
                      className="space-y-8"
                    >
                      <div>
                        <label className="block text-sm text-sumi mb-2.5">
                          お問い合わせ種別{" "}
                          <span className="text-error">*</span>
                        </label>
                        <select
                          value={form.type}
                          onChange={(e) =>
                            setForm({ ...form, type: e.target.value })
                          }
                          required
                          className={inputClasses}
                        >
                          <option value="">選択してください</option>
                          {inquiryTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-sumi mb-2.5">
                          お名前 <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          required
                          placeholder="山田 太郎"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-sumi mb-2.5">
                          メールアドレス{" "}
                          <span className="text-error">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          required
                          placeholder="example@email.com"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-sumi mb-2.5">
                          電話番号{" "}
                          <span className="text-haicha text-xs">（任意）</span>
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          placeholder="090-1234-5678"
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-sumi mb-2.5">
                          お問い合わせ内容{" "}
                          <span className="text-error">*</span>
                        </label>
                        <textarea
                          rows={7}
                          value={form.message}
                          onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                          }
                          required
                          placeholder="ご質問・ご要望をご記入ください"
                          className={`${inputClasses} resize-y`}
                        />
                      </div>

                      {status === "error" && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-error text-sm bg-error/5 border border-error/20 p-4"
                        >
                          送信に失敗しました。時間をおいて再度お試しいただくか、
                          misocacoffee@gmail.com まで直接ご連絡ください。
                        </motion.p>
                      )}

                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="w-full bg-gold/90 hover:bg-gold disabled:opacity-50 text-white py-4 text-xs tracking-[0.2em] transition-all duration-500"
                      >
                        {status === "sending" ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-5 w-5"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            送信中...
                          </span>
                        ) : (
                          "送信する"
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </ScrollReveal>
            </div>

            {/* Side Info */}
            <div className="w-full md:w-1/3">
              <ScrollReveal direction="right" delay={0.3}>
                <div className="bg-tsuchikabe p-8 md:p-10 rounded-sm space-y-10">
                  <div>
                    <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                      LINE
                    </p>
                    <a
                      href="https://lin.ee/ihDBxM8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-konsumi hover:text-[#06C755] transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      LINE公式アカウント
                    </a>
                    <p className="text-sm text-haicha mt-2 leading-relaxed">
                      一番早くお返事できます
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                      Instagram
                    </p>
                    <a
                      href="https://instagram.com/misoca_coffee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-konsumi hover:text-gold transition-colors"
                    >
                      @misoca_coffee
                    </a>
                    <p className="text-sm text-haicha mt-2 leading-relaxed">
                      DMでもお問い合わせいただけます
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                      Email
                    </p>
                    <a
                      href="mailto:misocacoffee@gmail.com"
                      className="text-konsumi hover:text-gold transition-colors text-sm break-all"
                    >
                      misocacoffee@gmail.com
                    </a>
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                      Address
                    </p>
                    <p className="text-sm text-konsumi leading-loose">
                      〒409-0115
                      <br />
                      山梨県上野原市松留939
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                      Response Time
                    </p>
                    <p className="text-sm text-haicha leading-relaxed">
                      フォームからは2営業日以内にご返信いたします。
                      お急ぎの場合はLINEをご利用ください。
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
