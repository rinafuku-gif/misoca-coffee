"use client";

import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

const useCases = [
  {
    label: "TEAM BUILDING",
    title: "企業研修・チームビルディング",
    description:
      "チームで生豆を選び、焙煎から抽出までを体験。共同作業を通じてコミュニケーションが自然と生まれます。",
    image: "/images/experience/roasting.jpg",
  },
  {
    label: "WORKSHOP",
    title: "ワークショップ・スクール",
    description:
      "学校やコミュニティスペースでの学びの場に。コーヒーの科学、産地の文化、サステナビリティを体感で学べます。",
    image: "/images/experience/roasting.jpg",
  },
  {
    label: "EVENT",
    title: "地域イベント・マルシェ",
    description:
      "マルシェやフェスティバルに焙煎体験ブースを出展。来場者にインタラクティブな体験を提供します。",
    image: "/images/experience/roasting.jpg",
  },
];

const steps = [
  {
    num: "01",
    title: "お問い合わせ",
    text: "ご希望の日程・場所・人数をお知らせください。",
  },
  {
    num: "02",
    title: "プランご提案",
    text: "ご要望に合わせて最適な体験プランをご提案します。",
  },
  {
    num: "03",
    title: "当日の準備",
    text: "焙煎機・生豆・器具一式を持ち込み、セッティングまで対応。",
  },
  {
    num: "04",
    title: "焙煎体験",
    text: "焙煎士がレクチャーしながら、参加者全員が焙煎を体験。",
  },
  {
    num: "05",
    title: "テイスティング",
    text: "焙煎した豆をその場でドリップ。自分だけの味わいを楽しめます。",
  },
];

export default function MobileRoastingPage() {
  return (
    <>
      <PageHero
        title="MOBILE ROASTING"
        subtitle="出張焙煎体験"
        description="あなたの場所に、焙煎所の体験をお届けします。"
        image="/images/experience/roasting.jpg"
      />

      {/* Introduction - Top page style split layout */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/experience/roasting.jpg"
                  alt="出張焙煎体験の様子"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                MOBILE ROASTING
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                焙煎所の体験を、
                <br />
                どこへでも。
              </h2>
              <p className="text-haicha text-lg leading-loose">
                三十日珈琲の焙煎士が、焙煎機と厳選した生豆を持って
                あなたの元へ伺います。生豆の選別から焙煎、
                ドリップまで。五感で味わう本格的な焙煎体験を、
                オフィスでも、イベント会場でもお届けします。
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Use Cases - Top page alternating layout */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              こんなシーンに
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="space-y-32 md:space-y-44">
            {useCases.map((useCase, i) => (
              <div
                key={useCase.title}
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
                      src={useCase.image}
                      alt={useCase.title}
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
                    {useCase.label}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-konsumi mb-6">
                    {useCase.title}
                  </h3>
                  <p className="text-haicha text-lg leading-loose">
                    {useCase.description}
                  </p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              ご依頼の流れ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <ScrollReveal
                key={step.num}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.08}
              >
                <div className="flex items-start gap-8 py-10 border-b border-usuzumi last:border-b-0">
                  <span className="text-3xl font-serif text-gold/40 font-bold flex-shrink-0 w-12">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-3">
                      {step.title}
                    </h3>
                    <p className="text-haicha leading-loose">{step.text}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Full-width photo background like Top page CTA */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/images/experience/interior.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 text-center mb-4">
              PRICING
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-white mb-6">
              料金目安
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-12">
            <ScrollReveal direction="left">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-lg text-center">
                <p className="text-sm tracking-[0.3em] text-white/50 mb-4">
                  SMALL
                </p>
                <h3 className="font-serif text-xl font-bold text-white mb-6">
                  少人数プラン
                </h3>
                <p className="text-3xl font-bold text-gold mb-2">¥30,000〜</p>
                <p className="text-xs text-white/50 mb-8">（税別 / 〜10名）</p>
                <ul className="text-sm text-white/70 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />焙煎体験（1人1回）
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />テイスティング
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />焙煎豆お持ち帰り
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />所要約90分
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-lg text-center">
                <p className="text-sm tracking-[0.3em] text-white/50 mb-4">
                  LARGE
                </p>
                <h3 className="font-serif text-xl font-bold text-white mb-6">
                  大人数プラン
                </h3>
                <p className="text-3xl font-bold text-gold mb-2">¥60,000〜</p>
                <p className="text-xs text-white/50 mb-8">（税別 / 11〜30名）</p>
                <ul className="text-sm text-white/70 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />焙煎体験（グループ制）
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />テイスティング
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />焙煎豆お持ち帰り
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />コーヒー講座付き
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />所要約120分
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-sm text-white/50 mt-10">
              ※ 交通費・出張費は別途ご相談。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              対応エリア
            </h2>
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

      {/* CTA */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-haicha mb-4">
              CONTACT
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8">
              お問い合わせ・ご依頼
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              人数・会場・ご予算に合わせてご提案いたします。
              <br />
              まずはお気軽にご相談ください。
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
    </>
  );
}
