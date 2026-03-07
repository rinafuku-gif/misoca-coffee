import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "焙煎体験予約",
  description:
    "築300年の古民家で、自分だけのコーヒーを焙煎する体験。生豆の選別から焙煎、ドリップまで約90分。公式サイトからの直予約が最もお得です。",
};

const steps = [
  {
    num: "01",
    title: "古民家へようこそ",
    text: "焙煎士がお迎え。まずはウェルカムコーヒーでひと息。",
    image: "/images/about/kominka.jpg",
  },
  {
    num: "02",
    title: "生豆を選ぶ",
    text: "エチオピア、グアテマラ、ブラジル──産地の異なる生豆からお好みを選んでいただきます。",
    image: "/images/experience/roasting.jpg",
  },
  {
    num: "03",
    title: "焙煎する",
    text: "手回し焙煎機で自分の手で焙煎。焙煎士がマンツーマンでサポートします。",
    image: "/images/experience/roasting.jpg",
  },
  {
    num: "04",
    title: "テイスティング",
    text: "自分で焙煎した豆をその場でドリップ。味わいの違いをじっくり楽しみます。",
    image: "/images/hero/hero-3.jpg",
  },
  {
    num: "05",
    title: "お持ち帰り",
    text: "焙煎した豆（約200g）はお土産に。ご自宅でも焙煎所の味をお楽しみいただけます。",
    image: "/images/menu/ethiopia.jpg",
  },
];

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        title="EXPERIENCE"
        subtitle="焙煎体験"
        description="築300年の古民家で、自分だけのコーヒーを焙煎する。"
        image="/images/experience/roasting.jpg"
      />

      {/* Direct Booking Merit Banner */}
      <section className="bg-konsumi py-6 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/90 text-sm md:text-base tracking-wider">
            公式サイトからの直予約が最もお得です ／ OTAサイト経由より最大60%OFF
          </p>
        </div>
      </section>

      {/* Plans & Pricing - Top priority section */}
      <section className="py-20 md:py-28 overflow-hidden">
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

          <div className="grid md:grid-cols-2 gap-10 md:gap-12 max-w-4xl mx-auto">
            <ScrollReveal direction="left">
              <div className="bg-white rounded-lg p-10 text-center shadow-sm h-full ring-2 ring-gold relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-3 py-1 rounded-full">
                  公式サイト限定価格
                </span>
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-3">
                  PERSONAL
                </p>
                <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                  焙煎体験（直予約）
                </h3>
                <p className="text-4xl font-bold text-gold mb-1">¥4,400</p>
                <p className="text-xs text-haicha mb-8">（税込 / 1名）</p>
                <ul className="text-sm text-haicha space-y-4 text-left mb-10">
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />所要約90分
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />マンツーマン焙煎指導
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />テイスティング
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />焙煎豆お持ち帰り（約200g）
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />完全予約制・少人数制
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded font-medium transition-colors w-full"
                >
                  このプランを予約する
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white rounded-lg p-10 text-center shadow-sm h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-3 mt-3">
                  GROUP
                </p>
                <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                  グループ焙煎体験
                </h3>
                <p className="text-4xl font-bold text-gold mb-1">¥3,300</p>
                <p className="text-xs text-haicha mb-8">（税込 / 1名）</p>
                <ul className="text-sm text-haicha space-y-4 text-left mb-10">
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />所要約90分
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />グループでの焙煎体験
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />テイスティング
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />焙煎豆お持ち帰り
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0" />団体・イベント向け
                  </li>
                </ul>
                <Link
                  href="/contact"
                  className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 rounded font-medium transition-all duration-300 w-full"
                >
                  このプランを予約する
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-sm text-haicha mt-12">
              ※ SOW Experience・anatae経由は¥11,000/組（2名まで）。公式サイトからの直予約が最もお得です。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Experience Flow - alternating layout like Top page */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              FLOW
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              体験の流れ
            </h2>
            <p className="text-center text-haicha mb-2">所要約90分</p>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="space-y-24 md:space-y-32">
            {steps.map((step, i) => (
              <div
                key={step.num}
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
                      src={step.image}
                      alt={step.title}
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
                  <span className="text-3xl font-serif text-gold/40 font-bold block mb-4">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-konsumi mb-4">
                    {step.title}
                  </h3>
                  <p className="text-haicha text-lg leading-loose">
                    {step.text}
                  </p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Info */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              ACCESS
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              アクセス
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 max-w-4xl mx-auto">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 rounded-lg shadow-sm">
                <h3 className="font-serif text-lg font-bold text-konsumi mb-6">
                  電車でお越しの方
                </h3>
                <ul className="text-haicha space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    JR中央本線「上野原」駅
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    新宿から約50分（特急利用）
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    高尾から約15分
                  </li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white p-10 rounded-lg shadow-sm">
                <h3 className="font-serif text-lg font-bold text-konsumi mb-6">
                  お車でお越しの方
                </h3>
                <ul className="text-haicha space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    中央自動車道「上野原IC」から約10分
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-4 h-px bg-gold flex-shrink-0 mt-3" />
                    駐車場あり
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/experience/interior.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 mb-4">
              RESERVATION
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">
              ご予約・お問い合わせ
            </h2>
            <p className="text-lg text-white/80 leading-loose mb-10">
              完全予約制・少人数制です。
              <br />
              日程・人数をお知らせいただければ、折り返しご連絡いたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
              >
                予約・お問い合わせ
              </Link>
            </div>
            <p className="text-sm text-white/50 mt-6">
              Instagram DM・LINE・お電話でもご予約いただけます
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* After Experience - EC Bridge */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/menu/ethiopia.jpg"
                  alt="焙煎豆"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                ONLINE SHOP
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                体験で出会った豆を、
                <br />
                ご自宅でも。
              </h2>
              <p className="text-haicha text-lg leading-loose mb-10">
                焙煎体験で気に入った豆を、オンラインショップから
                ご注文いただけます。焙煎3日以内の新鮮な豆を
                ご自宅へお届けします。
              </p>
              <Link
                href="/shop"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-all duration-300"
              >
                オンラインショップへ →
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
