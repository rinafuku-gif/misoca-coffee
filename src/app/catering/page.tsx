import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "ケータリング・出張珈琲",
  description:
    "三十日珈琲の焙煎士がイベントに伺い、その場で淹れたてのコーヒーをご提供。結婚式、企業イベント、マルシェなど。",
};

const scenes = [
  {
    label: "WEDDING",
    title: "ウェディング・パーティー",
    description:
      "大切なゲストに、焙煎士が一杯ずつ心を込めてお淹れします。新郎新婦のオリジナルブレンドもご用意可能。",
  },
  {
    label: "CORPORATE",
    title: "企業イベント・展示会",
    description:
      "来場者の記憶に残る特別な体験を。ブースでの焙煎デモンストレーションは集客力も抜群です。",
  },
  {
    label: "MARCHÉ",
    title: "マルシェ・フェスティバル",
    description:
      "屋外イベントにも対応。目の前で豆を挽き、淹れる臨場感が、お客様との会話を生みます。",
  },
  {
    label: "PRIVATE",
    title: "プライベートパーティー",
    description:
      "ご自宅やレンタルスペースでの少人数の集まりにも。ゲストと一緒に焙煎を楽しむ演出もおすすめです。",
  },
];

const plans = [
  {
    name: "ライト",
    subtitle: "ハンドドリップ提供",
    cups: "〜30杯",
    price: "¥10,000〜",
    features: [
      "焙煎士1名派遣",
      "スペシャルティコーヒー提供",
      "ハンドドリップ",
      "カップ・備品一式",
    ],
  },
  {
    name: "スタンダード",
    subtitle: "ドリップ + 焙煎デモ",
    cups: "〜50杯",
    price: "¥25,000〜",
    recommended: true,
    features: [
      "焙煎士1〜2名派遣",
      "焙煎デモンストレーション",
      "2種類の豆から選べる",
      "ハンドドリップ提供",
      "オリジナルメニューカード",
    ],
  },
  {
    name: "プレミアム",
    subtitle: "フル体験 + ワークショップ",
    cups: "〜80杯",
    price: "¥42,000〜",
    features: [
      "焙煎士2名派遣",
      "参加型焙煎ワークショップ",
      "3種類の豆テイスティング",
      "ハンドドリップ提供",
      "オリジナルラベル対応",
      "焙煎豆のお土産付き",
    ],
  },
];

const flow = [
  {
    num: "01",
    title: "お問い合わせ",
    text: "イベントの日程・会場・規模・ご予算をお知らせください。",
  },
  {
    num: "02",
    title: "ヒアリング・ご提案",
    text: "ご要望を伺い、最適なプランをご提案。お見積りをお出しします。",
  },
  {
    num: "03",
    title: "準備・打ち合わせ",
    text: "メニュー・提供スタイル・タイムテーブルを決定。必要な準備を進めます。",
  },
  {
    num: "04",
    title: "当日",
    text: "機材の搬入からセッティング、提供、撤収まですべてお任せください。",
  },
];

const faqs = [
  {
    q: "対応エリアはどこですか？",
    a: "山梨県・東京都・神奈川県が基本エリアです。その他の地域も交通費のご相談で対応可能です。",
  },
  {
    q: "何日前までに依頼すればいいですか？",
    a: "2週間前までにお問い合わせください。繁忙期（春・秋）は1ヶ月前のご依頼をおすすめします。",
  },
  {
    q: "屋外でも対応できますか？",
    a: "はい。電源と水場をご用意いただければ、屋外での提供も可能です。",
  },
  {
    q: "少人数でも依頼できますか？",
    a: "10名様からご依頼いただけます。少人数の場合はライトプランがおすすめです。",
  },
  {
    q: "キャンセル料はかかりますか？",
    a: "7日前まで無料。7〜3日前は50%、2日前〜当日は100%のキャンセル料が発生します。",
  },
];

export default function CateringPage() {
  return (
    <>
      <PageHero
        title="CATERING"
        subtitle="出張珈琲サービス"
        description="焙煎士が、あなたのイベントに伺います。"
        image="/images/catering/event.jpg"
      />

      {/* Introduction */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/catering/event.jpg"
                  alt="ケータリング提供風景"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-konsumi mb-8">
                特別な一杯を、
                <br />
                あなたの場所で。
              </h2>
              <p className="text-haicha text-lg leading-loose mb-6">
                結婚式、企業イベント、マルシェ。
                どんなシーンにも、焙煎したてのコーヒーが
                特別な時間を演出します。
              </p>
              <p className="text-haicha text-lg leading-loose">
                その場で豆を挽き、ハンドドリップで
                一杯ずつ丁寧にお淹れします。
                香りと味わいが、ゲストの記憶に残る体験に。
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-6">
              ご利用シーン
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10">
            {scenes.map((scene, i) => (
              <ScrollReveal key={scene.title} direction="up" delay={i * 0.1}>
                <div className="bg-white p-10 rounded-lg shadow-sm">
                  <p className="text-xs tracking-[0.3em] text-gold mb-4">
                    {scene.label}
                  </p>
                  <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                    {scene.title}
                  </h3>
                  <p className="text-haicha leading-loose">
                    {scene.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-6">
              プラン・料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name} direction="up" delay={i * 0.15}>
                <div
                  className={`bg-white rounded-lg p-10 text-center shadow-sm h-full ${
                    plan.recommended ? "ring-2 ring-gold relative" : ""
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-3 py-1 rounded-full">
                      おすすめ
                    </span>
                  )}
                  <h3 className="font-serif text-xl font-bold text-konsumi mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-haicha mb-2">{plan.subtitle}</p>
                  <p className="text-xs text-haicha mb-6">（{plan.cups}）</p>
                  <p className="text-3xl font-bold text-gold mb-8">
                    {plan.price}
                  </p>
                  <ul className="text-sm text-haicha space-y-4 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="w-4 h-px bg-gold flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-sm text-haicha mt-12">
              ※ 交通費は別途。すべて税別表記です。
              <br />
              対応エリア: 山梨県・東京都・神奈川県（その他はご相談ください）
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Flow */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <Image
          src="/images/catering/event.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-white mb-6">
              ご依頼の流れ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10">
            {flow.map((step, i) => (
              <ScrollReveal key={step.num} direction="up" delay={i * 0.1}>
                <div className="flex items-start gap-6">
                  <span className="text-3xl font-serif text-gold/50 font-bold flex-shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-loose">{step.text}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-6">
              よくある質問
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16" />
          </ScrollReveal>

          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 0.08}>
                <details className="bg-white p-8 rounded-lg shadow-sm">
                  <summary className="font-medium text-konsumi cursor-pointer">
                    {faq.q}
                  </summary>
                  <p className="mt-4 text-haicha leading-loose">{faq.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-6">
              お問い合わせ・ご依頼
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
            <p className="text-haicha leading-loose mb-12">
              イベントの規模やご要望に合わせてご提案いたします。
              <br />
              まずはお気軽にお問い合わせください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-12 py-4 rounded text-lg font-medium transition-colors"
            >
              お問い合わせする
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
