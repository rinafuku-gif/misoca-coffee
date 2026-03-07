import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "三十日珈琲について",
  description:
    "三十日珈琲のストーリー。築300年の古民家を拠点に、コーヒーを入口とした「暮らしの体験」を届ける焙煎所。上野原の場所そのものが価値。",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="ABOUT"
        subtitle="三十日珈琲のこと"
        image="/images/about/kominka.jpg"
      />

      {/* Brand Concept */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium mb-8">
              CONCEPT
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-konsumi mb-8 leading-tight">
              コーヒーから始まる。
              <br />
              もうひとつの日常。
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha text-lg leading-loose max-w-2xl mx-auto">
              一杯の先に、体験がある。場所がある。人がいる。
              <br />
              <br />
              三十日珈琲は、コーヒーを「飲む」だけでなく
              「つくる」「届ける」「つながる」体験を通じて、
              日常にもうひとつの居場所をつくる焙煎所です。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Name Origin */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/hero/hero-2.jpg"
                  alt="焙煎風景"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                NAME
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                「三十日」の由来
              </h2>
              <p className="text-haicha text-lg leading-loose mb-6">
                コーヒー豆の鮮度は、焙煎から約30日で落ちていきます。
                そして「三十日（みそか）」は、月の最後の日。
              </p>
              <p className="text-haicha text-lg leading-loose">
                30日に一度、会いに来てほしい。
                焙煎したての一杯と一緒に、この場所で過ごす時間を届けたい。
                そんな想いを込めて「三十日珈琲」と名付けました。
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The Place - Key differentiator */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              THE PLACE
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              築300年の古民家
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl mb-16">
              <Image
                src="/images/about/house-interior.jpg"
                alt="古民家の内部──梁・柱・自然光"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-haicha text-lg leading-loose mb-8">
                山梨県上野原市。東京から約1時間の里山に、
                築300年を超える古民家があります。
              </p>
              <p className="text-haicha text-lg leading-loose mb-8">
                太い梁、土壁、障子から差す自然光──
                この場所でしか生まれない空気の中で、
                焙煎機の音と、コーヒーの香りが広がります。
              </p>
              <p className="font-serif text-xl text-konsumi leading-loose">
                この場所は、代替できない。
                <br />
                だからこそ、ここに来る理由になる。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Founders */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              FOUNDERS
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              2人の出会い
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <ScrollReveal direction="left">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/founder-1.jpg"
                  alt="後藤さん"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/founder-2.jpg"
                  alt="稲福さん"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <p className="text-center text-haicha text-lg leading-loose max-w-2xl mx-auto">
              ADDress（多拠点居住サービス）での出会いをきっかけに、
              上野原の古民家を拠点としたコーヒー焙煎所を立ち上げました。
              「コーヒーを通じて、人と場所をつなげたい」──
              その想いが、三十日珈琲の原点です。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/about/kominka.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 text-center mb-4">
              VALUES
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-white mb-6">
              3つの約束
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                num: "01",
                title: "体験を届ける",
                text: "コーヒーは「飲む」だけでなく「作る」もの。焙煎体験を通じて、自分だけのコーヒーを仕上げる喜びを分かち合います。",
              },
              {
                num: "02",
                title: "鮮度と品質",
                text: "受注後に焙煎し、3日以内に発送。SCA基準のスペシャルティコーヒーを厳選し、最も美味しい状態でお届けします。",
              },
              {
                num: "03",
                title: "地域とつながる",
                text: "上野原の農家さんや職人さんとの協業。コーヒーを起点に、地域の魅力を内外に発信していきます。",
              },
            ].map((value, i) => (
              <ScrollReveal key={value.num} direction="up" delay={i * 0.15}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-10 rounded-lg text-center h-full">
                  <span className="text-3xl font-serif text-gold/50 font-bold block mb-6">
                    {value.num}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-white/70 leading-loose">{value.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8">
              三十日珈琲を体験する
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              焙煎体験、コーヒースタンド、オンラインショップ。
              <br />
              あなたに合った入口から、三十日珈琲に出会ってください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/experience"
                className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
              >
                焙煎体験を予約する
              </Link>
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
