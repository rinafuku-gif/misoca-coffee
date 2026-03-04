import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "ブランドストーリー",
  description:
    "三十日珈琲の創業ストーリー。ADDressでの出会いから生まれた、築300年の古民家を拠点とするシェアロースタリー。",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="ABOUT"
        subtitle="三十日珈琲のこと"
        image="/images/about/kominka.jpg"
      />

      {/* Brand Name Origin */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-4">
              「三十日」の由来
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="text-center text-haicha text-lg leading-loose">
              <p>コーヒー豆の鮮度は、焙煎から約30日で落ちていきます。</p>
              <p>そして「三十日（みそか）」は、月の最後の日。</p>
              <p className="mt-8">30日に一度、会いに来てほしい。</p>
              <p>焙煎したての一杯と一緒に、</p>
              <p>この場所で過ごす時間を届けたい。</p>
              <p className="mt-8 font-serif text-konsumi">
                そんな想いを込めて「三十日珈琲」と名付けました。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Founders Story */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-4">
              2人の出会い
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16" />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <ScrollReveal direction="left">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/founder-1.jpg"
                  alt="後藤さん"
                  fill
                  className="object-cover"
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
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <p className="text-center text-haicha leading-relaxed max-w-2xl mx-auto">
              ※実際のインタビュー・コンセプトブックの内容をもとに、2人の出会い、
              コーヒーへの想い、なぜ上野原を選んだか、ADDressとの関わりなどの
              リアルストーリーを掲載予定。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The House */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-4">
              築300年の古民家
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16" />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl mb-12">
              <Image
                src="/images/about/house-interior.jpg"
                alt="古民家の内部（梁・柱・自然光）"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="text-center text-haicha text-lg leading-loose max-w-2xl mx-auto">
              <p>山梨県上野原市。東京から約1時間の里山に、</p>
              <p>築300年を超える古民家があります。</p>
              <p className="mt-6">かつて地域の人々が集った場所を、</p>
              <p>コーヒーを通じて「みんなの焙煎所」として再生。</p>
              <p>古い梁の下で、焙煎機の音と香りが広がります。</p>
            </div>
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
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-white mb-4">
              3つの約束
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16" />
          </ScrollReveal>
          <div className="space-y-12">
            {[
              {
                num: "01",
                title: "シェアロースタリーとして",
                text: 'コーヒーは「飲む」だけでなく「作る」もの。焙煎体験を通じて、自分だけのコーヒーを仕上げる喜びを分かち合います。',
              },
              {
                num: "02",
                title: "鮮度と品質へのこだわり",
                text: "受注後に焙煎し、3日以内に発送。SCA基準のスペシャルティコーヒーを厳選し、最も美味しい状態でお届けします。",
              },
              {
                num: "03",
                title: "地域とのつながり",
                text: "上野原の農家さんや職人さんとの協業。コーヒーを起点に、地域の魅力を内外に発信していきます。",
              },
            ].map((value, i) => (
              <ScrollReveal
                key={value.num}
                direction={i % 2 === 0 ? "left" : "right"}
              >
                <div className="max-w-2xl mx-auto">
                  <p className="text-gold font-bold text-xl mb-2">
                    {value.num}. {value.title}
                  </p>
                  <p className="text-white/80 leading-relaxed text-lg">
                    {value.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
