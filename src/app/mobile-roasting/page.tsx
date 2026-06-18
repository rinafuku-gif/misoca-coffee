import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { MobileRoastingReservation } from "./MobileRoastingReservation";

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
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Concept
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
              焙煎所の体験を、
              <br />
              あなたの場所へ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha leading-loose max-w-2xl mx-auto">
              焙煎士が焙煎機と生豆を持って、あなたの場所へ伺います。
              生豆の選別から焙煎、テイスティングまで──
              古民家で行っている焙煎体験を、そのままお届けするサービスです。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* What We Bring */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              What We Bring
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              お持ちするもの
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
            {whatWeBring.map((item, i) => (
              <ScrollReveal key={item.title} direction="up" delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-sm text-center h-full">
                  <span className="text-2xl font-serif text-gold/15 font-light block mb-4">
                    0{i + 1}
                  </span>
                  <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
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
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/experience/roaster-machine.jpg"
                  alt="出張焙煎体験の様子"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                Suitable For
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8 leading-[1.5]">
                こんなシーンに
              </h2>
              <div className="space-y-6">
                {suitableFor.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-2">
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
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Pricing
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-sm p-10 md:p-14">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      基本料金
                    </h3>
                    <p className="text-sm text-haicha">2名様まで</p>
                  </div>
                  <p className="text-3xl font-light text-gold">
                    ¥11,000
                    <span className="text-sm text-haicha ml-2">（税込）</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      追加料金
                    </h3>
                    <p className="text-sm text-haicha">3名様目以降、1名あたり</p>
                  </div>
                  <p className="text-3xl font-light text-gold">
                    +¥4,400
                    <span className="text-sm text-haicha ml-2">（税込 / 人）</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      大人数・特別プラン
                    </h3>
                    <p className="text-sm text-haicha">10名様以上やカスタム内容</p>
                  </div>
                  <p className="text-xl font-light text-konsumi">
                    要相談
                  </p>
                </div>
              </div>
              <p className="text-sm text-haicha mt-10 leading-loose">
                ※ 交通費は別途ご相談。所要時間は約90〜120分が目安です。
                <br />
                ※ 電源（家庭用コンセント）と作業スペース（テーブル1台分）をご用意ください。
              </p>
              <div className="mt-8 pt-8 border-t border-usuzumi/30">
                <h4 className="font-serif text-base text-konsumi tracking-wider font-light mb-3">
                  対応エリア
                </h4>
                <ul className="text-sm text-haicha leading-loose space-y-1">
                  <li>山梨県 上野原市（全域）</li>
                  <li>山梨県 大月市（市内中心部・近隣）</li>
                  <li>相模原市 緑区（藤野エリア周辺）</li>
                  <li className="text-haicha/60">※ 上記以外の近隣エリアもご相談ください</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Reservation */}
      <MobileRoastingReservation />
    </>
  );
}