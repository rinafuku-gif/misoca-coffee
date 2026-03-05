import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "焙煎体験・見学予約",
  description:
    "築300年の古民家で、自分だけのコーヒーを焙煎する体験。生豆の選別から焙煎、ドリップまで約90分。完全予約制・少人数制。",
};

const steps = [
  {
    num: "01",
    title: "古民家へようこそ",
    text: "焙煎士がお迎え。まずはウェルカムコーヒーでひと息。",
  },
  {
    num: "02",
    title: "生豆を選ぶ",
    text: "産地の異なる生豆からお好みを選んでいただきます。",
  },
  {
    num: "03",
    title: "焙煎する",
    text: "手回し焙煎機で自分の手で焙煎。焙煎士がマンツーマンでサポートします。",
  },
  {
    num: "04",
    title: "テイスティング",
    text: "自分で焙煎した豆をその場でドリップ。味わいの違いをじっくり楽しみます。",
  },
  {
    num: "05",
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
        image="/images/experience/roasting.jpg"
      />

      {/* Flow */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-6">
              体験の流れ
            </h2>
            <p className="text-center text-haicha mb-2">約90分</p>
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
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-2">
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

      {/* Plans */}
      <section className="relative py-32 md:py-44 overflow-hidden">
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
            <h2 className="font-serif text-2xl md:text-3xl text-center text-white mb-6">
              プラン・料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-10">
            <ScrollReveal direction="left">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-lg text-center">
                <p className="text-sm tracking-[0.3em] text-white/50 mb-3">PERSONAL</p>
                <h3 className="font-serif text-xl font-bold text-white mb-4">
                  焙煎体験（直予約）
                </h3>
                <p className="text-3xl font-bold text-gold mb-2">¥4,400</p>
                <p className="text-xs text-white/50 mb-6">（税込 / 1名）</p>
                <ul className="text-sm text-white/70 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />所要約90分
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />マンツーマン焙煎指導
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />テイスティング
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />焙煎豆お持ち帰り（約200g）
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />完全予約制・少人数制
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-lg text-center">
                <p className="text-sm tracking-[0.3em] text-white/50 mb-3">GROUP</p>
                <h3 className="font-serif text-xl font-bold text-white mb-4">
                  グループ焙煎体験
                </h3>
                <p className="text-3xl font-bold text-gold mb-2">¥3,300</p>
                <p className="text-xs text-white/50 mb-6">（税込 / 1名）</p>
                <ul className="text-sm text-white/70 space-y-4 text-left">
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />所要約90分
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />グループでの焙煎体験
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />テイスティング
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />焙煎豆お持ち帰り
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold" />団体・イベント向け
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-6">
              ご予約
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
            <p className="text-haicha mb-12 leading-loose">
              完全予約制・少人数制です。
              <br />
              予約フォームは準備中です。お問い合わせからご連絡ください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              お問い合わせから予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
