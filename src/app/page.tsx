"use client";

import Link from "next/link";
import Image from "next/image";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ScrollReveal } from "@/components/ScrollReveal";

const features = [
  {
    title: "古民家で過ごす",
    description: "築300年の古民家で里山の時間を楽しむ。",
    image: "/images/about/kominka.jpg",
    label: "01",
  },
  {
    title: "自分だけの焙煎体験",
    description: "生豆を選び、自分の手で焙煎する。世界に一つのコーヒーを。",
    image: "/images/experience/roasting.jpg",
    label: "02",
  },
  {
    title: "人とつながる",
    description: "ADDressと連携したコミュニティで、コーヒー好きと出会う。",
    image: "/images/community/people.jpg",
    label: "03",
  },
];

const pickupMenus = [
  {
    name: "エチオピア イルガチェフェ",
    description: "フローラルな香りと柑橘系の明るい酸味",
    price: "¥1,580",
    image: "/images/menu/ethiopia.jpg",
  },
  {
    name: "グアテマラ アンティグア",
    description: "チョコレートのようなコクと甘み",
    price: "¥1,480",
    image: "/images/menu/guatemala.jpg",
  },
  {
    name: "ブラジル セラード",
    description: "ナッツの甘みとクリーンな味",
    price: "¥1,380",
    image: "/images/menu/brazil.jpg",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Slideshow */}
      <HeroSlideshow />

      {/* Features Section - Photo-centric with slide-in animations */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              三十日珈琲でできること
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

      {/* Experience CTA - Full-width photo background */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/images/experience/interior.jpg"
          alt="古民家の内部"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 mb-4">
              EXPERIENCE
            </p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8">
              焙煎体験・見学のご予約
            </h2>
            <p className="text-lg text-white/80 mb-10 leading-loose">
              生豆の選別から焙煎、ドリップまで。
              <br />
              あなただけのコーヒーを、古民家で仕上げる特別な時間。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-white/70 mb-10">
              <span className="flex items-center gap-2"><span className="w-4 h-px bg-white/40" />所要時間: 約90分</span>
              <span className="flex items-center gap-2"><span className="w-4 h-px bg-white/40" />焙煎した豆はお持ち帰り</span>
              <span className="flex items-center gap-2"><span className="w-4 h-px bg-white/40" />少人数制・完全予約制</span>
            </div>
            <Link
              href="/experience"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              焙煎体験を予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Pickup Menu - Photo cards with hover effects */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              今月のおすすめ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {pickupMenus.map((item, i) => (
              <ScrollReveal key={item.name} direction="up" delay={i * 0.15}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg mb-8">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-konsumi mb-3">
                    {item.name}
                  </h3>
                  <p className="text-sm text-haicha mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="font-bold text-karekusa text-lg">
                    {item.price}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-16">
              <Link
                href="/menu"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-10 py-4 rounded font-medium transition-all duration-300"
              >
                すべてのメニューを見る
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Catering - Photo split layout */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/catering/event.jpg"
                  alt="ケータリング風景"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-haicha mb-4">
                CATERING
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                イベント・企業向け
                <br />
                出張珈琲
              </h2>
              <p className="text-haicha text-lg leading-loose mb-10">
                お客様のイベントに焙煎士が伺い、
                その場で淹れたてのコーヒーをご提供します。
              </p>
              <Link
                href="/catering"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-all duration-300"
              >
                詳しく見る →
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 md:py-44 bg-tsuchikabe overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              訪れた方の声
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="space-y-10">
            <ScrollReveal direction="left">
              <blockquote className="bg-white p-10 md:p-12 rounded-lg shadow-sm border-l-4 border-gold">
                <p className="text-lg text-sumi leading-relaxed mb-4 font-serif italic">
                  &ldquo;東京から1時間で、まるで別世界。古民家で自分で焙煎したコーヒーは格別でした。&rdquo;
                </p>
                <cite className="text-sm text-haicha not-italic">
                  ── 東京都 M.S.さん (30代)
                </cite>
              </blockquote>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <blockquote className="bg-white p-10 md:p-12 rounded-lg shadow-sm border-l-4 border-gold">
                <p className="text-lg text-sumi leading-relaxed mb-4 font-serif italic">
                  &ldquo;ADDressで知って訪問。後藤さん・稲福さんのお話が面白くて、毎月通いたくなります。&rdquo;
                </p>
                <cite className="text-sm text-haicha not-italic">
                  ── 神奈川県 K.T.さん (40代)
                </cite>
              </blockquote>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              @misoca_coffee
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-tsuchikabe rounded overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-14">
              <a
                href="https://instagram.com/misoca_coffee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-all duration-300"
              >
                Instagramをフォローする
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
