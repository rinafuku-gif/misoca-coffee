import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "三十日珈琲について",
  description:
    "三十日珈琲のストーリー。築300年の古民家を拠点に、コーヒーを入口とした「暮らしの体験」を届ける焙煎所。コーヒーと暮らす。古くて新しい、みんなの焙煎所。",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="ABOUT"
        subtitle="三十日珈琲について"
        image="/images/about/open-sign.jpg"
      />

      {/* Brand Story */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="text-center md:text-left">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-8">
                  BRAND STORY
                </p>
                <h2 className="font-serif text-3xl md:text-5xl text-konsumi mb-8 leading-tight">
                  コーヒーと暮らす。
                  <br />
                  古くて新しい、みんなの焙煎所。
                </h2>
                <div className="w-16 h-px bg-gold mb-10 mx-auto md:mx-0" />
                <p className="text-haicha text-lg leading-loose mb-6">
                  一杯の先に、体験がある。場所がある。人がいる。
                </p>
                <p className="text-haicha text-lg leading-loose mb-6">
                  三十日珈琲は、コーヒーを「飲む」だけでなく
                  「つくる」「届ける」「つながる」体験を通じて、
                  日常にもうひとつの居場所をつくる焙煎所です。
                </p>
                <p className="text-haicha text-lg leading-loose">
                  コーヒーを入口に、暮らしそのものを体験として届けたい。
                  それが三十日珈琲の願いです。
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/signboard.jpg"
                  alt="三十日珈琲の看板"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The Place */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
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

          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-haicha text-lg leading-loose mb-6">
                山梨県上野原市。都心から少し足を伸ばした里山に、
                築300年を超える古民家があります。
              </p>
              <p className="text-haicha text-lg leading-loose">
                太い梁、土壁、障子から差す自然光──
                この場所でしか生まれない空気の中で、
                焙煎機の音と、コーヒーの香りが広がります。
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/exterior-window.jpg"
                  alt="古民家の外観"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/interior-shelf.jpg"
                  alt="古民家の内装"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="font-serif text-xl text-konsumi leading-loose text-center mt-14">
              この場所は、代替できない。
              <br />
              だからこそ、ここに来る理由になる。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The People */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-10 md:gap-20 items-center">
            <ScrollReveal direction="right" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/founder-1.jpg"
                  alt="三十日珈琲のメンバー"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                THE PEOPLE
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                つくる人たち
              </h2>
              <p className="text-haicha text-lg leading-loose mb-6">
                ADDress（多拠点居住サービス）での出会いをきっかけに、
                上野原の古民家を拠点としたコーヒー焙煎所を立ち上げました。
              </p>
              <p className="text-haicha text-lg leading-loose">
                「コーヒーを通じて、人と場所をつなげたい」──
                その想いが、三十日珈琲の原点です。
                30日に一度、会いに来てほしい。焙煎したての一杯と一緒に、
                この場所で過ごす時間を届けたい。
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scenery */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              SCENERY
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              上野原の風景
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/scenery-1.jpg"
                  alt="上野原の風景"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/scenery-2.jpg"
                  alt="上野原の自然"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-haicha text-lg leading-loose max-w-2xl mx-auto mt-14">
              四季折々の山並み、澄んだ空気、鳥のさえずり。
              <br />
              この風景のなかで飲むコーヒーは、どこよりも特別です。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Media */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              MEDIA
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              メディア掲載
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl mx-auto">
              <a
                href="https://note.com/misocacoffee/n/n8e21668e7775"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <p className="text-xs text-gold font-medium tracking-wide mb-2">note</p>
                <h3 className="font-serif text-lg text-konsumi mb-2">
                  三十日珈琲のストーリー
                </h3>
                <p className="text-sm text-haicha leading-relaxed">
                  三十日珈琲が生まれるまでの物語をnoteで公開しています。
                </p>
              </a>
            </div>
          </ScrollReveal>
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
