import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "コーヒースタンド",
  description:
    "三十日珈琲のコーヒースタンド。ハンドドリップで一杯ずつ丁寧に淹れるスペシャルティコーヒー。不定期営業、Instagramで営業情報をお知らせしています。",
};

const menuItems = [
  {
    name: "ハンドドリップコーヒー",
    price: "¥500〜¥850",
    description: "焙煎したてのスペシャルティコーヒーを一杯ずつ丁寧に。産地により価格が異なります。",
  },
  {
    name: "本日のコーヒー",
    price: "¥500",
    description: "焙煎士おすすめの一杯。その日の気分と季節に合わせてセレクト。",
  },
  {
    name: "カフェオレ",
    price: "¥600",
    description: "深煎りのコーヒーにミルクをたっぷり。やさしい味わい。",
  },
];

export default function StandPage() {
  return (
    <>
      <PageHero
        title="COFFEE STAND"
        subtitle="コーヒースタンド"
        description="一杯ずつ、丁寧に。"
        image="/images/stand/stand-1.jpg"
      />

      {/* About the Stand */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-8">
                THE STAND
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8 leading-tight">
                焙煎したてを、
                <br />
                その場で一杯
              </h2>
              <div className="w-16 h-px bg-gold mb-10" />
              <p className="text-haicha text-lg leading-loose mb-6">
                三十日珈琲のコーヒースタンドでは、焙煎したてのスペシャルティコーヒーを
                ハンドドリップで一杯ずつお淹れしています。
              </p>
              <p className="text-haicha text-lg leading-loose">
                豆の個性を最大限に引き出すために、産地や焙煎度合いに合わせた
                抽出レシピで丁寧に。上野原の空気のなかで飲む一杯は格別です。
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/stand/stand-2.jpg"
                  alt="コーヒースタンドの様子"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/stand/stand-3.jpg"
                alt="コーヒースタンド"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Menu */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              MENU
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              メニュー
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="space-y-0">
            {menuItems.map((item, i) => (
              <ScrollReveal key={item.name} direction="up" delay={i * 0.1}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-haicha leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gold whitespace-nowrap">
                    {item.price}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-sm text-haicha mt-8 leading-loose">
              ※ 季節や仕入れ状況により、メニュー・価格が変わる場合があります。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 営業情報 */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              INFO
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              営業情報
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 md:p-14 rounded-lg shadow-sm text-center">
              <p className="font-serif text-2xl text-konsumi mb-6">
                不定期営業
              </p>
              <p className="text-haicha text-lg leading-loose mb-8">
                営業日はInstagramでお知らせしています。
                <br />
                フォローしてお待ちください。
              </p>
              <div className="w-16 h-px bg-gold mx-auto mb-8" />
              <p className="text-sm text-haicha leading-loose">
                〒409-0115 山梨県上野原市松留939
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8">
              最新情報をチェック
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              営業日や新しい豆の入荷情報は、Instagramでお知らせしています。
              <br />
              ご来店前にぜひご確認ください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://instagram.com/misoca_coffee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
              >
                Instagramをフォロー
              </a>
              <Link
                href="/shop"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-10 py-4 rounded text-lg font-medium transition-all duration-300"
              >
                オンラインショップへ
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
