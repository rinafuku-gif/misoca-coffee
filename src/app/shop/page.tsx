import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "オンラインショップ",
  description:
    "三十日珈琲のスペシャルティコーヒーをオンラインでお届け。焙煎3日以内の新鮮な豆を全国発送。定期便もご用意。",
};

const beans = [
  {
    name: "エチオピア イルガチェフェ",
    origin: "エチオピア",
    roast: "浅煎り",
    flavor: "フローラルな香りと柑橘系の明るい酸味",
    price: "¥1,200",
    unit: "100g",
    image: "/images/menu/ethiopia.jpg",
  },
  {
    name: "グアテマラ アンティグア",
    origin: "グアテマラ",
    roast: "中煎り",
    flavor: "チョコレートのようなコクと甘み",
    price: "¥1,100",
    unit: "100g",
    image: "/images/menu/guatemala.jpg",
  },
  {
    name: "ブラジル セラード",
    origin: "ブラジル",
    roast: "中深煎り",
    flavor: "ナッツの甘みとクリーンな後味",
    price: "¥1,000",
    unit: "100g",
    image: "/images/menu/brazil.jpg",
  },
  {
    name: "コロンビア ウィラ",
    origin: "コロンビア",
    roast: "中煎り",
    flavor: "キャラメルのような甘みとバランスの良い酸味",
    price: "¥1,100",
    unit: "100g",
    image: "/images/menu/guatemala.jpg",
  },
  {
    name: "ケニア AA",
    origin: "ケニア",
    roast: "中煎り",
    flavor: "ベリーのような果実感と力強いボディ",
    price: "¥1,400",
    unit: "100g",
    image: "/images/menu/ethiopia.jpg",
  },
  {
    name: "インドネシア マンデリン",
    origin: "インドネシア",
    roast: "深煎り",
    flavor: "どっしりとしたボディとスパイシーな余韻",
    price: "¥1,200",
    unit: "100g",
    image: "/images/menu/brazil.jpg",
  },
];

export default function ShopPage() {
  return (
    <>
      <PageHero
        title="ONLINE SHOP"
        subtitle="焙煎したてをお届け"
        description="焙煎3日以内のスペシャルティコーヒーを、ご自宅へ。"
        image="/images/menu/ethiopia.jpg"
      />

      {/* Freshness Promise */}
      <section className="bg-konsumi py-6 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/90 text-sm md:text-base tracking-wider">
            すべてスペシャルティグレード ／ 焙煎3日以内に発送 ／ 全国一律 ¥370（¥5,000以上で送料無料）
          </p>
        </div>
      </section>

      {/* Bean Lineup */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              COFFEE BEANS
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              コーヒー豆
            </h2>
            <p className="text-haicha text-center leading-loose mb-4">
              焙煎体験でも使用しているスペシャルティコーヒーを、ご自宅でお楽しみいただけます。
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {beans.map((bean, i) => (
              <ScrollReveal key={bean.name} direction="up" delay={i * 0.1}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg mb-8">
                    <Image
                      src={bean.image}
                      alt={bean.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                    <span className="absolute top-4 left-4 bg-konsumi/80 text-white text-xs px-3 py-1 rounded">
                      {bean.roast}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-konsumi mb-2">
                    {bean.name}
                  </h3>
                  <p className="text-xs text-haicha mb-3">
                    {bean.origin} ／ {bean.roast}
                  </p>
                  <p className="text-sm text-haicha mb-4 leading-relaxed">
                    {bean.flavor}
                  </p>
                  <p className="font-bold text-karekusa text-lg">
                    {bean.price}
                    <span className="text-sm font-normal text-haicha ml-1">
                      / {bean.unit}
                    </span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <p className="text-center text-sm text-haicha mt-16">
              ※ 豆の在庫状況により、取り扱い銘柄が変更になる場合があります。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Drip Bags */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/hero/hero-3.jpg"
                  alt="ドリップバッグ"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                DRIP BAG
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                ドリップバッグ
              </h2>
              <p className="text-haicha text-lg leading-loose mb-6">
                器具がなくても手軽に楽しめるドリップバッグ。
                贈り物やオフィスのお供にもおすすめです。
              </p>
              <p className="font-bold text-karekusa text-xl mb-10">
                ¥500〜
                <span className="text-sm font-normal text-haicha ml-1">/ 1杯</span>
              </p>
              <Link
                href="/contact"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-all duration-300"
              >
                購入のお問い合わせ →
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Subscription Teaser */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/images/hero/hero-2.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 mb-4">
              SUBSCRIPTION
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">
              豆の定期便（準備中）
            </h2>
            <p className="text-lg text-white/80 leading-loose mb-10">
              毎月届く、焙煎したてのスペシャルティコーヒー。
              <br />
              季節や産地に合わせてセレクトした豆を、定期的にお届けします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              定期便の案内を受け取る
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              配送について
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  SHIPPING
                </p>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                  送料
                </h3>
                <p className="text-haicha leading-loose">
                  全国一律 ¥370（ネコポス）
                  <br />
                  ¥5,000以上で送料無料
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  FRESHNESS
                </p>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                  鮮度
                </h3>
                <p className="text-haicha leading-loose">
                  ご注文後に焙煎
                  <br />
                  3日以内に発送します
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  DELIVERY
                </p>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                  お届け
                </h3>
                <p className="text-haicha leading-loose">
                  発送後1〜3日で到着
                  <br />
                  ポスト投函で受取不要
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8">
              ご注文・お問い合わせ
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              現在はお問い合わせフォームまたはSTORESからご注文いただけます。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
