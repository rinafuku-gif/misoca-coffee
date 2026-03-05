import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "コーヒースタンド",
  description:
    "三十日珈琲のコーヒースタンド。焙煎したてのスペシャルティコーヒーをハンドドリップで一杯ずつ。上野原の日常に溶け込む、ふらっと立ち寄れる場所。",
};

const menuItems = [
  { name: "ハンドドリップコーヒー", price: "¥500", note: "本日の豆" },
  { name: "ハンドドリップコーヒー", price: "¥600〜", note: "豆を選べる" },
  { name: "アイスコーヒー", price: "¥550", note: "季節限定" },
  { name: "カフェオレ", price: "¥600", note: "" },
  { name: "焙煎豆（テイクアウト）", price: "¥800〜", note: "100g" },
];

export default function StandPage() {
  return (
    <>
      <PageHero
        title="COFFEE STAND"
        subtitle="コーヒースタンド"
        description="焙煎したての一杯を、ふらっと。"
        image="/images/about/kominka.jpg"
      />

      {/* Introduction */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/kominka.jpg"
                  alt="コーヒースタンド"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                COFFEE STAND
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                里山の日常に、
                <br />
                一杯のコーヒーを。
              </h2>
              <p className="text-haicha text-lg leading-loose">
                焙煎したてのスペシャルティコーヒーを
                ハンドドリップで一杯ずつ丁寧にお淹れします。
                予約不要、ふらっと立ち寄れる場所です。
                散歩の途中に、買い物帰りに、
                上野原の日常に溶け込むコーヒースタンドです。
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              MENU
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              メニュー
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="space-y-0">
            {menuItems.map((item, i) => (
              <ScrollReveal key={`${item.name}-${i}`} delay={i * 0.08}>
                <div className="flex items-center justify-between py-6 border-b border-usuzumi">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi">
                      {item.name}
                    </h3>
                    {item.note && (
                      <p className="text-sm text-haicha mt-1">{item.note}</p>
                    )}
                  </div>
                  <p className="font-bold text-karekusa text-lg flex-shrink-0 ml-4">
                    {item.price}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <p className="text-sm text-haicha mt-8">
              ※ メニュー・価格は変更になる場合があります。現金決済のみ。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Business Hours & Access */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              営業情報
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 max-w-4xl mx-auto">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 rounded-lg shadow-sm">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-6">
                  HOURS
                </p>
                <dl className="text-haicha space-y-4">
                  <div className="flex justify-between">
                    <dt className="font-medium text-konsumi">営業形態</dt>
                    <dd>不定期営業</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-konsumi">営業時間</dt>
                    <dd>Instagramでお知らせ</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-konsumi">決済</dt>
                    <dd>現金のみ</dd>
                  </div>
                </dl>
                <p className="text-sm text-haicha mt-6">
                  ※ 営業日はInstagramでご確認ください。
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white p-10 rounded-lg shadow-sm">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-6">
                  ACCESS
                </p>
                <dl className="text-haicha space-y-4">
                  <div>
                    <dt className="font-medium text-konsumi mb-1">住所</dt>
                    <dd>〒409-0112 山梨県上野原市上野原</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-konsumi mb-1">電車</dt>
                    <dd>JR中央本線「上野原」駅</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-konsumi mb-1">車</dt>
                    <dd>中央道「上野原IC」から約10分</dd>
                  </div>
                </dl>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Experience Bridge */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/images/experience/roasting.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 mb-4">
              EXPERIENCE
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">
              コーヒースタンドの豆を、
              <br />
              自分で焙煎してみませんか？
            </h2>
            <p className="text-lg text-white/80 leading-loose mb-10">
              スタンドで飲んだコーヒーの原点を知る焙煎体験。
              <br />
              同じ古民家で、生豆から自分だけの一杯を。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/experience"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              焙煎体験を予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
