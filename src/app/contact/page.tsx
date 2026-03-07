"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

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
      if (res.ok) {
        setStatus("sent");
        setForm({ type: "", name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        title="CONTACT"
        subtitle="お問い合わせ"
        description="ご質問・ご相談はお気軽にどうぞ。2営業日以内にご返信いたします。"
        image="/images/about/kominka.jpg"
      />

      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            {status === "sent" ? (
              <div className="text-center py-16">
                <p className="text-2xl font-serif text-konsumi mb-4">
                  お問い合わせありがとうございます
                </p>
                <p className="text-haicha leading-loose">
                  2営業日以内にご返信いたします。
                  <br />
                  しばらくお待ちください。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-sumi mb-2">
                    お問い合わせ種別 <span className="text-error">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    required
                    className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors bg-white"
                  >
                    <option value="">選択してください</option>
                    <option value="焙煎体験・見学について">
                      焙煎体験・見学について
                    </option>
                    <option value="ケータリングについて">
                      ケータリングについて
                    </option>
                    <option value="商品について">商品について</option>
                    <option value="定期便について">定期便について</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sumi mb-2">
                    お名前 <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                    className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sumi mb-2">
                    メールアドレス <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sumi mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sumi mb-2">
                    お問い合わせ内容 <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    required
                    className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-gold focus:outline-none resize-y transition-colors"
                  />
                </div>

                {status === "error" && (
                  <p className="text-error text-sm">
                    送信に失敗しました。時間をおいて再度お試しいただくか、misocacoffee@gmail.com
                    まで直接ご連絡ください。
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-4 rounded font-medium transition-colors"
                >
                  {status === "sending" ? "送信中..." : "送信する"}
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
