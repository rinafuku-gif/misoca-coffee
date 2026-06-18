"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { HeroSlideshow } from "@/shared/ui/HeroSlideshow";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

/* ───────────────────────── Data ───────────────────────── */

const services = [
  {
    title: "焙煎体験",
    text: "生豆を選び、自分の手で焙煎する。\n築300年の古民家で、五感を開く時間。",
    image: "/images/experience/bean-sorting.jpg",
    href: "/experience",
    cta: "体験を詳しく見る",
  },
  {
    title: "コーヒーケータリング",
    text: "スペシャルティコーヒーを、保温ポットでお届け。\nポットひとつで、そこがカフェになる。",
    image: "/images/catering/hand-drip.jpg",
    href: "/catering",
    cta: "ケータリングを見る",
  },
  {
    title: "出張焙煎体験",
    text: "焙煎所の体験を、あなたの場所へ。\n企業研修やイベントに、焙煎士が伺います。",
    image: "/images/experience/roaster-machine.jpg",
    href: "/mobile-roasting",
    cta: "出張焙煎を見る",
  },
];

const galleryImages = [
  { src: "/images/experience/roaster-machine.jpg", alt: "Aillio Bullet焙煎機" },
  { src: "/images/about/scenery-1.jpg", alt: "コーヒー生豆の麻袋" },
  { src: "/images/about/exterior-window.jpg", alt: "窓辺のドリッパーとカップ" },
  { src: "/images/about/interior-shelf.jpg", alt: "焙煎所の棚" },
  { src: "/images/about/scenery-2.jpg", alt: "焙煎機クローズアップ" },
  { src: "/images/about/open-sign.jpg", alt: "古民家の外観" },
];

const fallbackJournals = [
  {
    category: "上野原の暮らし",
    title: "古民家の冬支度──薪ストーブとコーヒーの日々",
    excerpt: "焙煎所のある古民家では、冬が近づくと薪ストーブの準備が始まります。",
    date: "2026.02.15",
  },
  {
    category: "産地レポート",
    title: "エチオピアのコーヒー農園を訪ねて",
    excerpt: "イルガチェフェの農園で見た、コーヒーチェリーの収穫風景。",
    date: "2026.02.01",
  },
  {
    category: "お知らせ",
    title: "焙煎体験 春の予約受付開始のお知らせ",
    excerpt: "3月〜5月の焙煎体験予約を受け付けています。",
    date: "2026.01.20",
  },
];

const fallbackProducts = [
  {
    name: "エチオピア イルガチェフェ",
    price: 1200,
    image: "/images/experience/bean-selection.jpg",
  },
  {
    name: "グアテマラ アンティグア",
    price: 1100,
    image: "/images/experience/roaster-machine.jpg",
  },
  {
    name: "ブラジル セラード",
    price: 1000,
    image: "/images/experience/coffee-meter.jpg",
  },
];

/* ───────────────── Arrow SVG ───────────────── */

function ArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ──────────────────── Component ──────────────────── */

interface JournalEntry {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
}

export default function Home() {
  const [products, setProducts] = useState(fallbackProducts);
  const [journals, setJournals] = useState<JournalEntry[]>(fallbackJournals.map((j, i) => ({
    id: String(i),
    coverImage: "",
    ...j,
  })));
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.slice(0, 3).map((p: { name: string; price: number; image: string }) => ({
              name: p.name,
              price: p.price,
              image: p.image,
            }))
          );
        }
      })
      .catch(() => {});

    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setJournals(data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ─── 1. Hero Slideshow ─── */}
      <HeroSlideshow />

      {/* ─── 2. Our Story ─── */}
      <section className="py-36 md:py-52">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-28 md:mb-36">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Our Story
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                コーヒーがつないだ、人と場所。
              </h2>
            </div>
          </ScrollReveal>

          {/* Story Block 1 - left image, right text */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center mb-28 md:mb-36">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/about/house-exterior.jpg"
                  alt="築300年の古民家 母屋全景"
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <h3 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-6">
                築300年の古民家から
              </h3>
              <div className="w-10 h-px bg-gold/40 mb-8" />
              <p className="text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-6">
                住まいのサブスクサービス「ADDress」での出会いをきっかけに、山梨県上野原市にある築300年の古民家に辿り着きました。
              </p>
              <p className="text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide">
                太い梁、土壁、障子から差し込む光── この場所でしか生まれない空気の中で、長屋門の一室に小さな焙煎所を開きました。
              </p>
            </ScrollReveal>
          </div>

          {/* Story Block 2 - right image, left text */}
          <div className="flex flex-col md:flex-row-reverse gap-12 md:gap-20 items-center">
            <ScrollReveal direction="right" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/about/open-sign.jpg"
                  alt="三十日珈琲の看板"
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="w-full md:w-1/2">
              <h3 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-6">
                ただの焙煎所ではなく
              </h3>
              <div className="w-10 h-px bg-gold/40 mb-8" />
              <p className="text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-6">
                コーヒーを「飲む」だけでなく、「つくる」「届ける」「つながる」体験を通じて、日常にもうひとつの居場所をつくりたい。
              </p>
              <p className="text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-10">
                30日に一度、会いに来てほしい。焙煎したての一杯と一緒に、この場所で過ごす時間そのものを届けたい── それが三十日珈琲の原点です。
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
              >
                私たちについて詳しく
                <ArrowIcon />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── 3. Brand Statement ─── */}
      <section className="bg-tsuchikabe py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-6 mb-10">
              <span className="w-12 h-px bg-gold/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
              <span className="w-12 h-px bg-gold/40" />
            </div>
            <p className="font-serif text-konsumi text-base md:text-lg tracking-wider leading-[2.2] font-light">
              焙煎する、届ける、出会う。
              <br />
              三十日珈琲の3つの体験をご紹介します。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 4. Services ─── */}
      <section className="py-36 md:py-52">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-28 md:mb-36">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Services
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                三十日珈琲の体験
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-40 md:space-y-56">
            {services.map((service, i) => (
              <div
                key={service.title}
                className={`flex flex-col ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-12 md:gap-20 items-center`}
              >
                <ScrollReveal
                  direction={i % 2 === 0 ? "left" : "right"}
                  className="w-full md:w-1/2"
                >
                  <Link href={service.href} className="block group">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    </div>
                  </Link>
                </ScrollReveal>
                <ScrollReveal
                  direction={i % 2 === 0 ? "right" : "left"}
                  delay={0.2}
                  className="w-full md:w-1/2"
                >
                  <h3 className="font-serif text-xl md:text-2xl text-konsumi mb-8 tracking-wider font-light">
                    {service.title}
                  </h3>
                  <p className="text-haicha text-sm md:text-[15px] leading-[2.2] mb-10 whitespace-pre-line tracking-wide">
                    {service.text}
                  </p>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
                  >
                    {service.cta}
                    <ArrowIcon />
                  </Link>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. New Arrival ─── */}
      <section className="bg-tsuchikabe py-36 md:py-52">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src="/images/about/scenery-1.jpg"
                  alt="上野原のゆずを使ったインフューズドコーヒー"
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="font-[family-name:var(--font-display)] text-[11px] tracking-[0.5em] text-gold font-light mb-6 uppercase">
                New Arrival
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
                上野原のゆずから生まれた、もうひとつのコーヒー
              </h2>
              <div className="w-10 h-px bg-gold/40 mb-8" />
              <p className="text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-10">
                山梨県上野原市の規格外ゆずを、コーヒー生豆に漬け込んでから焙煎した、紅茶のように楽しむ新しい一杯。
              </p>
              <Link
                href="/shop/uenohara-yuzu"
                className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
              >
                詳しく見る
                <ArrowIcon />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── 6. Experience CTA ─── */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <Image
          src="/images/experience/roasting-hands.jpg"
          alt="焙煎体験"
          fill
          className="object-cover scale-110"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 md:px-8 flex items-end pb-16 md:pb-24">
          <ScrollReveal>
            <p className="font-serif text-white/90 text-lg md:text-xl tracking-wider font-light leading-relaxed mb-8">
              生豆の選別から焙煎、ドリップまで。
              <br />
              あなただけのコーヒーを、古民家で仕上げる。
            </p>
            <Link
              href="/experience"
              className="inline-flex items-center gap-3 border border-white/40 text-white/90 text-xs tracking-[0.2em] px-8 py-4 hover:bg-white/15 transition-all duration-500"
            >
              焙煎体験を予約する
              <ArrowIcon />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 7. Gallery ─── */}
      <section className="py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-24">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Gallery
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                焙煎所の風景
              </h2>
            </div>
          </ScrollReveal>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-6 md:px-8 pb-4 snap-x snap-mandatory">
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className="flex-shrink-0 w-[70vw] md:w-[35vw] lg:w-[28vw] snap-center"
            >
              <div className="relative aspect-[3/4] overflow-hidden group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 70vw, (max-width: 1024px) 35vw, 28vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 8. Online Shop ─── */}
      <section className="py-36 md:py-52">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 md:mb-28">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Online Shop
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                焙煎したてをお届け
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {products.map((item, i) => (
              <ScrollReveal key={item.name} direction="up" delay={i * 0.15}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[4/5] overflow-hidden mb-6">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <h3 className="font-serif text-base text-konsumi mb-3 tracking-wider font-light">
                    {item.name}
                  </h3>
                  <p className="text-karekusa text-sm tracking-wider">
                    ¥{item.price.toLocaleString()}
                    <span className="text-[10px] text-haicha/50 ml-2">/ 100g</span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-20 md:mt-28">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
              >
                オンラインショップへ
                <ArrowIcon />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 9. Journal ─── */}
      <section className="py-36 md:py-52">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 md:mb-28">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Journal
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                コラム・お知らせ
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {journals.map((post, i) => (
              <ScrollReveal key={post.id} direction="up" delay={i * 0.15}>
                <Link href={`/blog/${post.id}`} className="group block">
                  <div className="relative aspect-[16/9] overflow-hidden bg-tsuchikabe mb-4 rounded-sm">
                    {post.coverImage && !failedImages.has(post.id) ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        onError={() => setFailedImages((prev) => new Set(prev).add(post.id))}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl text-karekusa/20 font-serif">JOURNAL</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <p className="text-[10px] tracking-[0.3em] text-karekusa uppercase">
                    {post.category}
                  </p>
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mt-3 mb-3 leading-snug group-hover:text-gold/80 transition-colors duration-300">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs md:text-sm text-haicha leading-[2] tracking-wide mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-[11px] text-haicha/50 tracking-wide">
                    {post.date ? post.date.replace(/-/g, ".") : ""}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-20 md:mt-28">
              <Link
                href="/blog"
                className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
              >
                すべてのジャーナルを見る
                <ArrowIcon />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 10. Instagram ─── */}
      <section className="py-32 md:py-48">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <ScrollReveal>
            <p className="font-serif text-konsumi text-base md:text-lg tracking-wider leading-[2.4] font-light mb-12">
              焙煎の様子や季節の風景を
              <br />
              Instagramでお届けしています。
            </p>
            <a
              href="https://instagram.com/misoca_coffee"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              @misoca_coffee
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
