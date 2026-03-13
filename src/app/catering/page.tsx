import type { Metadata } from "next";
import Link from "next/link";
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
        image="/images/experience/roasting.jpg"
      />

      {/* Concept */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Concept
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
              ポットひとつで、
              <br />
              そこがカフェになる
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha leading-loose max-w-2xl mx-auto">
              プロが焙煎したスペシャルティコーヒーを、保温ポットでお届けします。
              準備も片付けも不要。あなたのイベントに、最高の一杯を添えるだけ。
              コーヒーの香りが、その場の空気を変えます。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Plans
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              プラン・料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.label} direction="up" delay={i * 0.15}>
                <div
                  className={`bg-white rounded-sm p-10 text-center h-full flex flex-col relative ${
                    plan.featured ? "ring-1 ring-gold/40" : ""
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
                      おすすめ
                    </span>
                  )}
                  <p className="text-[10px] tracking-[0.5em] text-gold font-light mb-3 mt-2 uppercase">
                    {plan.label}
                  </p>
                  <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-light text-gold mb-2">
                    {plan.price}
                  </p>
                  <p className="text-xs text-haicha mb-6">（税込）</p>
                  <p className="text-sm text-haicha mb-8 leading-relaxed">
                    {plan.description}
                  </p>
                  <ul className="text-sm text-haicha space-y-3 text-left mb-10">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Link
                      href="/contact"
                      className={`inline-block w-full py-4 text-xs tracking-[0.2em] transition-all duration-500 ${
                        plan.featured
                          ? "bg-gold/90 hover:bg-gold text-white"
                          : "border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white"
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
            <p className="text-center text-xs text-haicha mt-14 leading-relaxed">
              ※ 人数・内容に応じてカスタマイズも可能です。お気軽にご相談ください。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Use Cases
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              ご利用シーン
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
            {useCases.map((useCase, i) => (
              <ScrollReveal
                key={useCase.title}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
              >
                <div className="bg-white p-8 md:p-10 rounded-sm border-l-2 border-gold/40 h-full">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-4">
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
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Service Area
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              対応エリア
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 md:p-14 rounded-sm text-center">
              <ul className="space-y-4 mb-8">
                {serviceAreas.map((area) => (
                  <li
                    key={area}
                    className="text-konsumi flex items-center justify-center gap-3"
                  >
                    <span className="w-6 h-px bg-gold/40" />
                    {area}
                    <span className="w-6 h-px bg-gold/40" />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-haicha leading-relaxed">
                ※ 上記以外のエリアもご相談ください。交通費別途で対応可能な場合があります。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8">
              ケータリングのご相談
            </h2>
            <p className="text-haicha leading-loose mb-12">
              日程・人数・ご予算をお知らせいただければ、
              <br />
              最適なプランをご提案いたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
            >
              お問い合わせはこちら
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
