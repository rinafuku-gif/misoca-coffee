import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "焙煎体験・見学予約",
  description:
    "築300年の古民家で、自分だけのコーヒーを焙煎する体験。生豆の選別から焙煎、ドリップまで約90分。完全予約制・少人数制。",
};

const steps = [
  {
    num: "①",
    title: "古民家へようこそ",
    text: "焙煎士がお迎え。まずはウェルカムコーヒーでひと息。",
  },
  {
    num: "②",
    title: "生豆を選ぶ",
    text: "産地の異なる生豆からお好みを選んでいただきます。",
  },
  {
    num: "③",
    title: "焙煎する",
    text: "手回し焙煎機で自分の手で焙煎。焙煎士がマンツーマンでサポートします。",
  },
  {
    num: "④",
    title: "テイスティング",
    text: "自分で焙煎した豆をその場でドリップ。味わいの違いをじっくり楽しみます。",
  },
  {
    num: "⑤",
    title: "お持ち帰り",
    text: "焙煎した豆（約200g）はお土産に。ご自宅でも焙煎所の味を楽しめます。",
  },
];

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        title="EXPERIENCE"
        subtitle="焙煎体験・見学"
        description="築300年の古民家で、自分だけのコーヒーを焙煎する。"
      />

      {/* Flow */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── 体験の流れ（約90分） ──
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-white p-6 rounded-lg text-center shadow-sm"
              >
                <p className="text-2xl mb-2">{step.num}</p>
                <h3 className="font-serif font-bold text-konsumi mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-haicha">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── プラン・料金 ──
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg text-center shadow-sm">
              <p className="text-3xl mb-2">☕</p>
              <h3 className="font-serif text-xl font-bold text-konsumi mb-2">
                焙煎体験コース
              </h3>
              <p className="text-2xl font-bold text-gold mb-4">¥3,500〜/人</p>
              <p className="text-xs text-haicha mb-4">（税込）</p>
              <ul className="text-sm text-haicha space-y-2 text-left">
                <li>✓ 所要約90分</li>
                <li>✓ 焙煎指導</li>
                <li>✓ テイスティング</li>
                <li>✓ 豆お持ち帰り（約200g）</li>
                <li>✓ 少人数制（最大4名）</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg text-center shadow-sm">
              <p className="text-3xl mb-2">👀</p>
              <h3 className="font-serif text-xl font-bold text-konsumi mb-2">
                見学コース
              </h3>
              <p className="text-2xl font-bold text-gold mb-4">¥1,000/人</p>
              <p className="text-xs text-haicha mb-4">（税込）</p>
              <ul className="text-sm text-haicha space-y-2 text-left">
                <li>✓ 所要約45分</li>
                <li>✓ 焙煎所見学</li>
                <li>✓ コーヒー1杯</li>
                <li>✓ 焙煎士とのトーク</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-4">
            ── ご予約 ──
          </h2>
          <p className="text-haicha mb-8">
            完全予約制・少人数制です。
            <br />
            予約フォームは準備中です。お問い合わせからご連絡ください。
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded font-medium transition-colors"
          >
            お問い合わせから予約する
          </Link>
        </div>
      </section>
    </>
  );
}
