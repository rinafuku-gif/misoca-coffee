"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { ScrollReveal } from "@/components/ScrollReveal";

/* ───────────────────────── Data ───────────────────────── */

const features = [
  {
    title: "焙煎体験",
    description:
      "生豆を選び、自分の手で焙煎する。築300年の古民家で五感を開く、世界にひとつだけのコーヒー体験。",
    image: "/images/experience/roasting-couple.jpg",
    label: "01",
    href: "/experience",
    cta: "体験を詳しく見る",
  },
  {
    title: "コーヒーケータリング",
    description:
      "ポットひとつで、そこがカフェになる。スペシャルティコーヒーを保温ポットでお届け。準備も片付けも不要。",
    image: "/images/experience/couple-beans.jpg",
    label: "02",
    href: "/catering",
    cta: "ケータリングを見る",
  },
  {
    title: "出張焙煎体験",
    description:
      "焙煎所の体験を、あなたの場所へ。企業研修、ワークショップ、地域イベントに焙煎士が伺います。",
    image: "/images/experience/young-couple.jpg",
    label: "03",
    href: "/mobile-roasting",
    cta: "出張焙煎を見る",
  },
];

const fallbackPickupMenus = [
  {
    name: "エチオピア イルガチェフェ",
    description: "フローラルな香りと柑橘系の明るい酸味",
    price: "¥1,200",
    image: "/images/menu/ethiopia.jpg",
  },
  {
    name: "グアテマラ アンティグア",
    description: "チョコレートのようなコクと甘み",
    price: "¥1,100",
    image: "/images/menu/guatemala.jpg",
  },
  {
    name: "ブラジル セラード",
    description: "ナッツの甘みとクリーンな後味",
    price: "¥1,000",
    image: "/images/menu/brazil.jpg",
  },
];

const galleryImages = [
  "/images/experience/bean-selection.jpg",
  "/images/about/signboard.jpg",
  "/images/experience/cupping.jpg",
  "/images/stand/stand-1.jpg",
  "/images/about/interior-shelf.jpg",
  "/images/experience/roaster-machine.jpg",
];

const testimonials = [
  {
    quote:
      "東京から1時間で、まるで別世界。古民家で自分で焙煎したコーヒーは格別でした。",
    author: "東京都 M.S.さん (30代)",
  },
  {
    quote:
      "ADDressで知って訪問。後藤さん・稲福さんのお話が面白くて、毎月通いたくなります。",
    author: "神奈川県 K.T.さん (40代)",
  },
  {
    quote:
      "焙煎体験後にオンラインで同じ豆を注文。自分で焙煎した味を思い出しながら楽しんでいます。",
    author: "埼玉県 Y.H.さん (20代)",
  },
];

/* ──────────────────── Component ──────────────────── */

export default function Home() {
  const [pickupMenus, setPickupMenus] = useState(fallbackPickupMenus);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPickupMenus(
            data.slice(0, 3).map((p: { name: string; flavor: string; price: number; image: string }) => ({
              name: p.name,
              description: p.flavor || "",
              price: `¥${p.price.toLocaleString()}`,
              image: p.image || "/images/menu/ethiopia.jpg",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const ctaParallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ctaParallaxRef,
    offset: ["start end", "end start"],
  });
  const ctaImageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <>
      {/* ─── 1. Hero Slideshow ─── */}
      <HeroSlideshow />

      {/* ─── 2. Brand Story Strip ─── */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-6 md:gap-8 mb-8">
              <span className="w-12 md:w-20 h-px bg-gold" />
              <span className="text-xs tracking-[0.4em] text-gold font-medium uppercase">
                Misoca Coffee
              </span>
              <span className="w-12 md:w-20 h-px bg-gold" />
            </div>
            <p className="font-serif text-xl md:text-2xl lg:text-3xl text-konsumi leading-relaxed tracking-wide">
              コーヒーと暮らす。
              <br className="md:hidden" />
              古くて新しい、みんなの焙煎所。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 3. Three Pillars Section ─── */}
      <section className="py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-gold font-medium text-center mb-4 uppercase">
              What We Offer
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              三十日珈琲でできること
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-28 md:space-y-36">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`flex flex-col ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-10 md:gap-20 items-center`}
              >
                <ScrollReveal
                  direction={i % 2 === 0 ? "left" : "right"}
                  className="w-full md:w-3/5"
                >
                  <Link href={feature.href} className="block group">
                    <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
                    </div>
                  </Link>
                </ScrollReveal>
                <ScrollReveal
                  direction={i % 2 === 0 ? "right" : "left"}
                  delay={0.2}
                  className="w-full md:w-2/5"
                >
                  <span className="text-[10px] tracking-[0.5em] text-gold/60 font-medium mb-6 block uppercase">
                    Feature {feature.label}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl text-konsumi mb-6 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-haicha leading-loose mb-10">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="group/link inline-flex items-center gap-3 text-karekusa font-medium text-sm tracking-wide hover:gap-5 transition-all duration-300"
                  >
                    <span>{feature.cta}</span>
                    <span className="w-8 h-px bg-karekusa group-hover/link:w-12 transition-all duration-300" />
                  </Link>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Experience CTA ─── */}
      <section
        ref={ctaParallaxRef}
        className="relative py-28 md:py-40 overflow-hidden"
      >
        <motion.div className="absolute inset-0" style={{ y: ctaImageY }}>
          <Image
            src="/images/experience/roasting-hands.jpg"
            alt="焙煎体験"
            fill
            className="object-cover scale-110"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-white/50 mb-6 uppercase">
              Experience
            </p>
            <h2 className="font-serif text-3xl md:text-5xl mb-8 leading-tight">
              焙煎体験のご予約
            </h2>
            <p className="text-white/70 leading-loose mb-12 max-w-xl mx-auto">
              生豆の選別から焙煎、ドリップまで。
              <br />
              あなただけのコーヒーを、古民家で仕上げる特別な時間。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-8 justify-center text-sm text-white/60 mb-12">
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-px bg-gold/60" />
                ¥4,400/人（直予約）
              </span>
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-px bg-gold/60" />
                約90分
              </span>
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-px bg-gold/60" />
                焙煎豆お持ち帰り
              </span>
            </div>
            <Link
              href="/experience"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-12 py-4 rounded-sm text-sm tracking-widest font-medium transition-colors duration-300"
            >
              焙煎体験を予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 5. Online Shop Preview ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-gold font-medium text-center mb-4 uppercase">
              Online Shop
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              焙煎したてをお届け
            </h2>
            <p className="text-haicha text-center leading-loose mb-4 max-w-lg mx-auto">
              体験で出会った豆を、ご自宅でも。焙煎3日以内の新鮮な豆をお届けします。
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {pickupMenus.map((item, i) => (
              <ScrollReveal key={item.name} direction="up" delay={i * 0.15}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square rounded-sm overflow-hidden shadow-lg mb-8">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="font-serif text-lg text-konsumi mb-2 tracking-wide">
                    {item.name}
                  </h3>
                  <p className="text-sm text-haicha mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-karekusa text-lg font-medium">
                    {item.price}
                    <span className="text-xs font-normal text-haicha ml-1">
                      / 100g
                    </span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-16">
              <Link
                href="/shop"
                className="group/link inline-flex items-center gap-3 text-karekusa font-medium text-sm tracking-wide hover:gap-5 transition-all duration-300"
              >
                <span>オンラインショップへ</span>
                <span className="w-8 h-px bg-karekusa group-hover/link:w-12 transition-all duration-300" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 6. Photo Gallery Strip ─── */}
      <section className="py-8 md:py-12 overflow-hidden">
        <ScrollReveal>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory">
            {galleryImages.map((src, i) => (
              <motion.div
                key={src}
                className="relative flex-shrink-0 w-[280px] md:w-[360px] lg:w-[420px] snap-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-sm overflow-hidden">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 280px, (max-width: 1024px) 360px, 420px"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ─── 7. Testimonials ─── */}
      <section className="py-24 md:py-32 bg-tsuchikabe overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-gold font-medium text-center mb-4 uppercase">
              Voices
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              訪れた方の声
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.15}>
                <blockquote className="bg-white p-8 md:p-10 rounded-sm shadow-sm h-full flex flex-col">
                  <div className="mb-6">
                    <svg
                      className="w-8 h-8 text-gold/30"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-sumi leading-loose mb-8 flex-1 font-serif text-[15px]">
                    {t.quote}
                  </p>
                  <cite className="text-xs text-haicha not-italic tracking-wide block">
                    ── {t.author}
                  </cite>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. Instagram CTA ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-gold font-medium mb-6 uppercase">
              Follow Us
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-konsumi mb-6 tracking-wide">
              @misoca_coffee
            </h2>
            <p className="text-haicha leading-loose mb-12 max-w-md mx-auto">
              焙煎の様子や季節の風景、新しい豆の入荷情報をお届けしています。
            </p>
            <a
              href="https://instagram.com/misoca_coffee"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-3 text-karekusa font-medium text-sm tracking-wide hover:gap-5 transition-all duration-300"
            >
              <span>Instagramをフォローする</span>
              <span className="w-8 h-px bg-karekusa group-hover/link:w-12 transition-all duration-300" />
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
