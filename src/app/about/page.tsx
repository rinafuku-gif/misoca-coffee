import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

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
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="text-center md:text-left">
                <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                  Brand Story
                </p>
                <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
                  コーヒーと暮らす。
                  <br />
                  古くて新しい、みんなの焙煎所。
                </h2>
                <div className="w-16 h-px bg-gold mb-10 mx-auto md:mx-0" />
                <p className="text-haicha leading-loose mb-6">
                  一杯の先に、体験がある。場所がある。人がいる。
                </p>
                <p className="text-haicha leading-loose mb-6">
                  三十日珈琲は、コーヒーを「飲む」だけでなく
                  「つくる」「届ける」「つながる」体験を通じて、
                  日常にもうひとつの居場所をつくる焙煎所です。
                </p>
                <p className="text-haicha leading-loose">
                  コーヒーを入口に、暮らしそのものを体験として届けたい。
                  それが三十日珈琲の願いです。
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/about/house-garden.jpg"
                  alt="古民家の庭"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The Place */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              The Place
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              築300年の古民家
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-haicha leading-loose mb-6">
                山梨県上野原市。東京から約1時間の里山に、
                築300年を超える古民家があります。
              </p>
              <p className="text-haicha leading-loose">
                太い梁、土壁、障子から差す自然光──
                この場所でしか生まれない空気の中で、
                焙煎機の音と、コーヒーの香りが広がります。
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/about/kominka-interior-1.jpg"
                  alt="古民家の内観"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/about/kominka-interior-2.jpg"
                  alt="古民家の内装"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="font-serif text-lg text-konsumi tracking-wider font-light leading-loose text-center mt-14">
              この場所は、代替できない。
              <br />
              だからこそ、ここに来る理由になる。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The People */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-10 md:gap-20 items-center">
            <ScrollReveal direction="right" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/about/founders.jpg"
                  alt="共同代表 稲福良祐（左）と後藤伸啓（右）。焙煎機Aillio Bulletの前で"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                The People
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
                つくる人たち
              </h2>
              <p className="text-haicha leading-loose mb-6">
                <span className="font-medium text-konsumi">後藤伸啓</span>（兵庫県出身・東京都在住）と
                <span className="font-medium text-konsumi">稲福良祐</span>（大阪府出身・山梨県在住）。
                関西出身の二人が、多拠点居住サービスADDressを通じて上野原で出会い、
                2023年11月に三十日珈琲を立ち上げました。
              </p>
              <p className="text-haicha leading-loose mb-6">
                後藤はスペシャルティコーヒーの世界に惹かれ、
                「自分の場所をつくって、そこから価値を届けたい」という想いを温めていた人。
                稲福はADDress上野原A邸の家守として暮らすなか、
                古民家の空きスペースに可能性を感じていた人。
                二人とも焙煎なんてしたこともなかったけれど、
                「やってみないと始まらない」と意気投合して、長屋門の一室から始めました。
              </p>
              <p className="text-haicha leading-loose">
                「30日に一度、会いに来てほしい」──
                コーヒー豆がおいしく飲める約1ヶ月という時間にのせて、
                ゆっくりと関係をつくっていきたい。
                日常とは違う「もうひとつの大切な場所」になれたら。
                それが、三十日珈琲という名前に込めた想いです。
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scenery */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Scenery
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              上野原の風景
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/about/scenery-1.jpg"
                  alt="上野原の風景"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.15}>
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/about/scenery-2.jpg"
                  alt="上野原の自然"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-haicha leading-loose max-w-2xl mx-auto mt-14">
              四季折々の山並み、澄んだ空気、鳥のさえずり。
              <br />
              この風景のなかで飲むコーヒーは、どこよりも特別です。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8">
              三十日珈琲を体験する
            </h2>
            <p className="text-haicha leading-loose mb-12">
              焙煎体験、コーヒースタンド、オンラインショップ。
              <br />
              あなたに合った入口から、三十日珈琲に出会ってください。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/experience"
                className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                焙煎体験を予約する
              </Link>
              <Link
                href="/shop"
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
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
