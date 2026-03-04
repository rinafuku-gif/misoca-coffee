"use client";

import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

const features = [
  {
    label: "01",
    title: "ずっとおいしい、保温ポット",
    description:
      "プロの焙煎士が焙煎したスペシャルティコーヒーを、高性能保温ポットでお届け。届いた瞬間から最後の一杯まで、おいしい温度をキープします。",
    image: "/images/catering/event.jpg",
  },
  {
    label: "02",
    title: "手間は一切ナシ、準備・片付け不要",
    description:
      "届いたポットから注ぐだけ。カップや備品もすべてセットでお届けするので、準備も片付けも必要ありません。",
    image: "/images/catering/event.jpg",
  },
  {
    label: "03",
    title: "少人数からOK、たっぷりがうれしい",
    description:
      "10名程度の打ち合わせから、数十名規模のイベントまで。人数に合わせたプランで、一杯あたりのコスパも抜群です。",
    image: "/images/catering/event.jpg",
  },
];

const plans = [
  {
    name: "S",
    subtitle: "少人数の打ち合わせに",
    price: "¥10,000",
    tax: "税込",
    features: [
      "ポット 1本",
      "約10〜15杯分",
      "カップ・備品一式",
      "配送料・設置費 無料",
    ],
  },
  {
    name: "M",
    subtitle: "チームミーティング・小規模イベントに",
    price: "¥18,000",
    tax: "税込",
    recommended: true,
    features: [
      "ポット 2本",
      "約20〜30杯分",
      "2種類の豆から選べる",
      "カップ・備品一式",
      "配送料・設置費 無料",
    ],
  },
  {
    name: "L",
    subtitle: "大人数のイベント・パーティーに",
    price: "¥26,000",
    tax: "税込",
    features: [
      "ポット 3本",
      "約30〜45杯分",
      "3種類の豆から選べる",
      "カップ・備品一式",
      "配送料・設置費 無料",
    ],
  },
];

const orderFlow = [
  {
    num: "01",
    title: "ご予約",
    text: "お電話・フォームから、日程・人数・お届け先をお知らせください。ご希望に合わせたプランをご提案します。",
  },
  {
    num: "02",
    title: "お届け",
    text: "当日、ご指定の時間にポットとカップをお届け。セッティングまで対応いたします。",
  },
  {
    num: "03",
    title: "コーヒータイム",
    text: "あとは注ぐだけ。保温ポットだから、好きなタイミングでおいしい一杯をお楽しみいただけます。",
  },
];

const faqs = [
  {
    q: "前日まで予約できますか？",
    a: "はい、前日の午前中までご予約を承ります。ただし、在庫状況によりご希望に添えない場合もございますので、お早めのご予約をおすすめします。",
  },
  {
    q: "配送時間は指定できますか？",
    a: "はい。ご希望の時間帯をお知らせいただければ、できる限り調整いたします。",
  },
  {
    q: "対象エリア以外にも届けてもらえますか？",
    a: "基本エリア外でも、近隣であれば柔軟に対応いたします。まずはお気軽にご相談ください。",
  },
  {
    q: "カップは付いていますか？",
    a: "はい。すべてのプランに紙カップ・マドラー・シュガー・ミルクをセットでお届けします。",
  },
];

export default function CateringPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        title="CATERING"
        subtitle="ポットひとつで、そこがカフェになる。"
        description="プロの焙煎士が焙煎したスペシャルティコーヒーを、保温ポットであなたの元へ。学校・オフィス・イベント、どんなシーンにもおいしい一杯を。"
        image="/images/catering/event.jpg"
      />

      {/* Intro banner */}
      <section className="bg-konsumi py-6 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/90 text-sm md:text-base tracking-wider">
            対応エリア内は配送料・設置費すべて無料 ／ 一杯あたり約600円〜のプロの味
          </p>
        </div>
      </section>

      {/* Features - Top page alternating layout */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              CATERING
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              「置くだけ」デリバリー 3つの特徴
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="space-y-32 md:space-y-44">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`flex flex-col ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-8 md:gap-16 items-center`}
              >
                <ScrollReveal
                  direction={i % 2 === 0 ? "left" : "right"}
                  className="w-full md:w-3/5"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal
                  direction={i % 2 === 0 ? "right" : "left"}
                  delay={0.2}
                  className="w-full md:w-2/5"
                >
                  <span className="text-sm tracking-[0.3em] text-gold font-medium mb-8 block">
                    {feature.label}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-konsumi mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-haicha text-lg leading-loose">
                    {feature.description}
                  </p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              THREE PLANS
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              人数に合わせて選べるプラン
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name} direction="up" delay={i * 0.15}>
                <div
                  className={`bg-white rounded-lg p-10 text-center shadow-sm h-full flex flex-col ${
                    plan.recommended ? "ring-2 ring-gold relative" : ""
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-3 py-1 rounded-full">
                      おすすめ
                    </span>
                  )}
                  <h3 className="font-serif text-2xl font-bold text-konsumi mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-haicha mb-6">{plan.subtitle}</p>
                  <p className="text-3xl font-bold text-gold mb-1">
                    {plan.price}
                  </p>
                  <p className="text-xs text-haicha mb-8">（{plan.tax}）</p>
                  <ul className="text-sm text-haicha space-y-4 text-left mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="w-4 h-px bg-gold flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <Link
                      href="/contact"
                      className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-6 py-3 rounded text-sm font-medium transition-all duration-300 w-full"
                    >
                      このプランを相談する
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Large Event Plan */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/images/catering/event.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 mb-4">
              CUSTOM PLAN
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">
              大規模イベント・総合対応プラン
            </h2>
            <p className="text-lg text-white/80 leading-loose mb-10">
              100名以上のイベントや、焙煎デモンストレーション付きの
              <br className="hidden md:block" />
              特別プランもご用意できます。規模やご要望に応じてお見積りいたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              まずはお問い合わせ
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Delivery Area */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              DELIVERY AREA
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              地域密着だからできる「送料無料」
            </h2>
            <p className="text-haicha text-lg text-center leading-loose mb-4">
              下記エリアでは、配送料・設置費がすべて無料です。
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  AREA 01
                </p>
                <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                  山梨県 上野原市
                </h3>
                <p className="text-haicha leading-loose">全域</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  AREA 02
                </p>
                <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                  相模原市 緑区
                </h3>
                <p className="text-haicha leading-loose">藤野エリア周辺</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  AREA 03
                </p>
                <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                  山梨県 大月市
                </h3>
                <p className="text-haicha leading-loose">市内中心部・近隣</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            <p className="text-center text-sm text-haicha mt-12">
              ※ その他の近隣エリアも柔軟に対応いたします。お気軽にご相談ください。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Order Flow */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              HOW TO ORDER
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              ご注文の流れ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {orderFlow.map((step, i) => (
              <ScrollReveal key={step.num} direction="up" delay={i * 0.15}>
                <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                  <span className="text-4xl font-serif text-gold/40 font-bold block mb-6">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                    {step.title}
                  </h3>
                  <p className="text-haicha leading-loose">{step.text}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              よくあるご質問
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
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
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-haicha mb-4">
              CONTACT
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8">
              お問い合わせ
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              プランのご相談・お見積り・ご予約など、
              <br />
              お気軽にお問い合わせください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              お問い合わせする
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* About Misoca Coffee */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/kominka.jpg"
                  alt="三十日珈琲 古民家外観"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                ABOUT
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-6">
                三十日珈琲について
              </h2>
              <p className="text-sm tracking-wider text-haicha mb-8">
                Roasting Coffee Experience
              </p>
              <p className="text-haicha text-lg leading-loose mb-10">
                コーヒーと暮らす、古くて新しい、みんなの焙煎所。
                <br />
                築300年の古民家を拠点に、焙煎体験や
                スペシャルティコーヒーをお届けしています。
              </p>
              <Link
                href="/about"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-all duration-300"
              >
                詳しく見る →
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
