import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ExperienceClientSections } from "./ExperienceClientSections";

export const metadata: Metadata = {
  title: "焙煎体験予約",
  description:
    "築300年の古民家で、自分だけのコーヒーを焙煎する体験。Aillio Bullet R1 V2で生豆の選別から焙煎、ドリップまで約90分。公式サイトからの直予約が最もお得です。",
};

const steps = [
  {
    num: "01",
    title: "古民家へようこそ",
    text: "焙煎士がお迎え。まずはウェルカムコーヒーでひと息。築300年の空間に身を委ねてください。",
    image: "/images/about/open-sign.jpg",
  },
  {
    num: "02",
    title: "生豆を選ぶ",
    text: "エチオピア、グアテマラ、ブラジル──産地の異なる生豆からお好みを選んでいただきます。",
    image: "/images/experience/bean-selection.jpg",
  },
  {
    num: "03",
    title: "焙煎する",
    text: "Aillio Bullet R1 V2で自分の手で焙煎。焙煎士がマンツーマンでサポートします。",
    image: "/images/experience/roasting-hands.jpg",
  },
  {
    num: "04",
    title: "テイスティング",
    text: "自分で焙煎した豆をその場でドリップ。味わいの違いをじっくり楽しみます。",
    image: "/images/experience/tasting.jpg",
  },
  {
    num: "05",
    title: "お持ち帰り",
    text: "焙煎した豆はお土産に。プライベート体験では約400g（250g×2回焙煎）、グループ体験では人数に応じた量をお持ち帰りいただけます。",
    image: "/images/experience/takeaway-bags.jpg",
  },
];

const galleryImages = [
  "/images/experience/gallery-1.jpg",
  "/images/experience/gallery-2.jpg",
  "/images/experience/gallery-3.jpg",
  "/images/experience/gallery-4.jpg",
  "/images/experience/gallery-5.jpg",
  "/images/experience/gallery-6.jpg",
];

export default function ExperiencePage() {
  return (
    <>
      {/* ─── 1. Page Hero ─── */}
      <PageHero
        title="EXPERIENCE"
        subtitle="焙煎体験"
        description="築300年の古民家で、自分だけのコーヒーを焙煎する。"
        image="/images/experience/roasting-hands.jpg"
      />

      {/* ─── 2. Direct Booking Banner ─── */}
      <section className="bg-konsumi py-5 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/80 text-xs md:text-sm tracking-[0.15em] font-light">
            じゃらんやSOW Experience経由より、公式サイトからの直予約が最もお得です
          </p>
        </div>
      </section>

      {/* ─── 3. Plans & Pricing ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Plans &amp; Pricing
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              プラン・料金
            </h2>
            <p className="text-center text-sm text-haicha tracking-wide mb-16 md:mb-20">
              じゃらん・SOW Experience経由よりお得な公式サイト限定価格
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-14 max-w-4xl mx-auto">
            {/* Personal Plan */}
            <ScrollReveal direction="left">
              <div className="bg-white rounded-sm p-10 md:p-12 text-center shadow-sm h-full ring-1 ring-gold/40 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
                  Best Value
                </span>
                <p className="text-[10px] tracking-[0.5em] text-gold font-medium mb-3 mt-2 uppercase">
                  Personal
                </p>
                <h3 className="font-serif text-xl text-konsumi mb-6">
                  焙煎体験（直予約）
                </h3>
                <p className="text-4xl md:text-5xl font-light text-gold mb-1">
                  ¥8,800
                </p>
                <p className="text-xs text-haicha mb-10">（税込 / 1組・2名まで）</p>
                <ul className="text-sm text-haicha space-y-5 text-left mb-12">
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    所要約90分
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    マンツーマン焙煎指導
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    テイスティング
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    焙煎豆お持ち帰り（プライベート: 約400g）
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    完全予約制・少人数制
                  </li>
                </ul>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSddXQX_VthNqn6GmfG_Nf_tidQgW_9q_oJtIeBMvPAGoTwCvQ/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500 w-full"
                >
                  このプランを予約する
                </a>
              </div>
            </ScrollReveal>

            {/* Group Plan */}
            <ScrollReveal direction="right">
              <div className="bg-white rounded-sm p-10 md:p-12 text-center shadow-sm h-full">
                <p className="text-[10px] tracking-[0.5em] text-gold font-medium mb-3 mt-5 uppercase">
                  Group
                </p>
                <h3 className="font-serif text-xl text-konsumi mb-6">
                  グループ焙煎体験
                </h3>
                <p className="text-4xl md:text-5xl font-light text-gold mb-1">
                  ¥4,400
                </p>
                <p className="text-xs text-haicha mb-10">（税込 / 1名）</p>
                <ul className="text-sm text-haicha space-y-5 text-left mb-12">
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    所要約90分
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    グループでの焙煎体験
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    テイスティング
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    焙煎豆お持ち帰り
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                    団体・イベント向け
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500 w-full"
                >
                  空き状況を問い合わせる
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-xs text-haicha mt-14 leading-relaxed">
              ※ SOW Experience・anatae経由は¥11,000/組（2名まで）。
              <br className="md:hidden" />
              公式サイトからの直予約が最もお得です。
              <br />
              ※ 3名以上の場合は追加料金がかかります。お気軽にお問い合わせください。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 4. Experience Flow ─── */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Flow
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              体験の流れ
            </h2>
            <p className="text-center text-haicha text-sm mb-2">
              所要約90分
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-28 md:space-y-36">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-10 md:gap-20 items-center`}
              >
                <ScrollReveal
                  direction={i % 2 === 0 ? "left" : "right"}
                  className="w-full md:w-3/5"
                >
                  <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal
                  direction={i % 2 === 0 ? "right" : "left"}
                  delay={0.2}
                  className="w-full md:w-2/5"
                >
                  <span className="text-5xl md:text-6xl text-gold/15 font-light block mb-4 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-haicha leading-loose">
                    {step.text}
                  </p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Photo Gallery ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Gallery
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              体験の風景
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {galleryImages.map((src, i) => (
              <ScrollReveal key={src} direction="up" delay={i * 0.1}>
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-lg group">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Access Info ─── */}
      <section className="py-24 md:py-32 bg-tsuchikabe overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Access
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              アクセス
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 max-w-4xl mx-auto">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 md:p-12 rounded-sm shadow-sm">
                <h3 className="font-serif text-lg text-konsumi mb-8">
                  電車でお越しの方
                </h3>
                <ul className="text-haicha space-y-5 text-sm">
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                    JR中央本線「上野原」駅
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                    新宿から約65分（中央特快利用）
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                    高尾から約16分
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white p-10 md:p-12 rounded-sm shadow-sm">
                <h3 className="font-serif text-lg text-konsumi mb-8">
                  お車でお越しの方
                </h3>
                <ul className="text-haicha space-y-5 text-sm">
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                    中央自動車道「上野原IC」から約10分
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                    駐車場あり（無料・6台）
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── 7. Reservation CTA ─── */}
      <ExperienceClientSections />
    </>
  );
}
