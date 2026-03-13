import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "出張焙煎体験",
  description:
    "三十日珈琲の出張焙煎体験。焙煎機と生豆を持って、あなたの場所へ伺います。企業研修、チームビルディング、ワークショップに最適。",
};

const whatWeBring = [
  {
    title: "焙煎機",
    text: "手回し焙煎機を持参。実際に焙煎の工程を体験していただけます。",
  },
  {
    title: "生豆",
    text: "厳選したスペシャルティグレードの生豆を複数種ご用意。産地の違いを体感。",
  },
  {
    title: "器具一式",
    text: "ドリッパー、ケトル、スケール等、テイスティングに必要な器具をすべて持参します。",
  },
];

const suitableFor = [
  {
    title: "企業研修",
    text: "コーヒー焙煎を通じた五感の体験で、クリエイティビティを刺激します。",
  },
  {
    title: "チームビルディング",
    text: "焙煎からテイスティングまでの共同作業が、自然なコミュニケーションを生みます。",
  },
  {
    title: "地域イベント",
    text: "マルシェや文化祭に。参加者が自分で焙煎する体験型コンテンツとして。",
  },
  {
    title: "ワークショップ",
    text: "コーヒーの座学と実技を組み合わせた、学びのある時間をお届けします。",
  },
];

export default function MobileRoastingPage() {
  return (
    <>
      <PageHero
        title="MOBILE ROASTING"
        subtitle="出張焙煎体験"
        description="焙煎所の体験を、あなたの場所へ。"
        image="/images/experience/roaster-machine.jpg"
      />

      {/* Concept */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium mb-8">
              CONCEPT
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-konsumi mb-8 leading-tight">
              焙煎所の体験を、
              <br />
              あなたの場所へ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha text-lg leading-loose max-w-2xl mx-auto">
              焙煎士が焙煎機と生豆を持って、あなたの場所へ伺います。
              生豆の選別から焙煎、テイスティングまで──
              古民家で行っている焙煎体験を、そのままお届けするサービスです。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* What We Bring */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              WHAT WE BRING
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              お持ちするもの
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
            {whatWeBring.map((item, i) => (
              <ScrollReveal key={item.title} direction="up" delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm text-center h-full">
                  <span className="text-2xl font-serif text-gold/40 font-bold block mb-4">
                    0{i + 1}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-konsumi mb-4">
                    {item.title}
                  </h3>
                  <p className="text-haicha leading-loose">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Suitable For */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/experience/roaster-machine.jpg"
                  alt="出張焙煎体験の様子"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                SUITABLE FOR
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                こんなシーンに
              </h2>
              <div className="space-y-6">
                {suitableFor.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-2">
                      {item.title}
                    </h3>
                    <p className="text-haicha leading-loose">{item.text}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              PRICING
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-lg p-10 md:p-14 shadow-sm">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-1">
                      基本料金
                    </h3>
                    <p className="text-sm text-haicha">2名様まで</p>
                  </div>
                  <p className="text-3xl font-bold text-gold">
                    ¥11,000
                    <span className="text-sm font-normal text-haicha ml-2">（税込）</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-1">
                      追加料金
                    </h3>
                    <p className="text-sm text-haicha">3名様目以降、1名あたり</p>
                  </div>
                  <p className="text-3xl font-bold text-gold">
                    +¥3,300
                    <span className="text-sm font-normal text-haicha ml-2">（税込 / 人）</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-1">
                      大人数・特別プラン
                    </h3>
                    <p className="text-sm text-haicha">10名様以上やカスタム内容</p>
                  </div>
                  <p className="text-xl font-bold text-konsumi">
                    要相談
                  </p>
                </div>
              </div>
              <p className="text-sm text-haicha mt-10 leading-loose">
                ※ 交通費は別途ご相談。所要時間は約90〜120分が目安です。
                <br />
                ※ 電源（家庭用コンセント）と作業スペース（テーブル1台分）をご用意ください。
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
              出張焙煎のご相談
            </h2>
            <p className="text-haicha text-lg leading-loose mb-10">
              日程・場所・人数をお知らせいただければ、
              <br />
              折り返しご連絡いたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/contact"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              お問い合わせはこちら
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
