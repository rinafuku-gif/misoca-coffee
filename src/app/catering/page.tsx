import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "コーヒーケータリング",
  description:
    "三十日珈琲のコーヒーケータリング。プロが焙煎したスペシャルティコーヒーを保温ポットでお届け。企業イベント、ウェディング、地域イベントに。",
};

const plans = [
  {
    label: "LIGHT",
    name: "ライトプラン",
    price: "¥10,000〜",
    description: "少人数の打ち合わせやミーティングに最適",
    includes: [
      "スペシャルティコーヒー（1種）",
      "保温ポットでお届け",
      "紙カップ・マドラー付き",
      "〜10名様目安",
    ],
  },
  {
    label: "STANDARD",
    name: "スタンダードプラン",
    price: "¥15,000〜",
    featured: true,
    description: "イベントやパーティーにおすすめの定番プラン",
    includes: [
      "スペシャルティコーヒー（2種）",
      "保温ポットでお届け",
      "紙カップ・マドラー・砂糖・ミルク付き",
      "〜30名様目安",
      "焙煎士による簡単なコーヒー紹介",
    ],
  },
  {
    label: "GRAND",
    name: "グランドプラン",
    price: "¥26,000〜",
    description: "大規模イベントやウェディングに対応するプレミアムプラン",
    includes: [
      "スペシャルティコーヒー（3種）",
      "保温ポット複数台でお届け",
      "オリジナルカップ対応可",
      "〜50名様目安",
      "焙煎士が現地でサービング",
      "オリジナルラベル対応可",
    ],
  },
];

const useCases = [
  {
    title: "企業イベント",
    text: "社内会議、セミナー、懇親会に。本格コーヒーで場の質を高めます。",
  },
  {
    title: "ウェディング",
    text: "ゲストへのおもてなしに。オリジナルラベルで特別な一杯を。",
  },
  {
    title: "地域イベント",
    text: "マルシェ、お祭り、ワークショップに。地域のつながりをコーヒーで。",
  },
  {
    title: "プライベートパーティー",
    text: "誕生日、記念日、ホームパーティーに。手軽に本格コーヒーを楽しめます。",
  },
];

const serviceAreas = [
  "上野原市全域",
  "相模原市緑区（藤野エリア）",
  "大月市",
];

export default function CateringPage() {
  return (
    <>
      <PageHero
        title="CATERING"
        subtitle="コーヒーケータリング"
        description="ポットひとつで、そこがカフェになる。"
        image="/images/experience/couple-beans.jpg"
      />

      {/* Concept */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium mb-8">
              CONCEPT
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-konsumi mb-8 leading-tight">
              ポットひとつで、
              <br />
              そこがカフェになる
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha text-lg leading-loose max-w-2xl mx-auto">
              プロが焙煎したスペシャルティコーヒーを、保温ポットでお届けします。
              準備も片付けも不要。あなたのイベントに、最高の一杯を添えるだけ。
              コーヒーの香りが、その場の空気を変えます。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              PLANS
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              プラン・料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.label} direction="up" delay={i * 0.15}>
                <div
                  className={`bg-white rounded-lg p-10 text-center shadow-sm h-full flex flex-col relative ${
                    plan.featured ? "ring-2 ring-gold" : ""
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-3 py-1 rounded-full">
                      おすすめ
                    </span>
                  )}
                  <p className="text-sm tracking-[0.3em] text-gold font-medium mb-3 mt-1">
                    {plan.label}
                  </p>
                  <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-bold text-gold mb-2">
                    {plan.price}
                  </p>
                  <p className="text-xs text-haicha mb-6">（税込）</p>
                  <p className="text-sm text-haicha mb-8 leading-relaxed">
                    {plan.description}
                  </p>
                  <ul className="text-sm text-haicha space-y-3 text-left mb-10">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Link
                      href="/contact"
                      className={`inline-block w-full py-4 rounded font-medium transition-all duration-300 ${
                        plan.featured
                          ? "bg-gold hover:bg-gold-dark text-white"
                          : "border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white"
                      }`}
                    >
                      このプランで相談する
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <p className="text-center text-sm text-haicha mt-12">
              ※ 人数・内容に応じてカスタマイズも可能です。お気軽にご相談ください。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              USE CASES
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              ご利用シーン
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
            {useCases.map((useCase, i) => (
              <ScrollReveal
                key={useCase.title}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
              >
                <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm border-l-4 border-gold h-full">
                  <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                    {useCase.title}
                  </h3>
                  <p className="text-haicha leading-loose">{useCase.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              SERVICE AREA
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              対応エリア
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 md:p-14 rounded-lg shadow-sm text-center">
              <ul className="space-y-4 mb-8">
                {serviceAreas.map((area) => (
                  <li
                    key={area}
                    className="text-lg text-konsumi flex items-center justify-center gap-3"
                  >
                    <span className="w-6 h-px bg-gold" />
                    {area}
                    <span className="w-6 h-px bg-gold" />
                  </li>
                ))}
              </ul>
              <p className="text-sm text-haicha leading-loose">
                ※ 上記以外のエリアもご相談ください。交通費別途で対応可能な場合があります。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8">
              ケータリングのご相談
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              日程・人数・ご予算をお知らせいただければ、
              <br />
              最適なプランをご提案いたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              お問い合わせはこちら
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
