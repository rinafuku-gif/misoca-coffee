import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

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
      />

      {/* Brand Name Origin */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-8">
            ── 「三十日」の由来 ──
          </h2>
          <div className="text-center text-haicha leading-loose">
            <p>コーヒー豆の鮮度は、焙煎から約30日で落ちていきます。</p>
            <p>そして「三十日（みそか）」は、月の最後の日。</p>
            <p className="mt-6">30日に一度、会いに来てほしい。</p>
            <p>焙煎したての一杯と一緒に、</p>
            <p>この場所で過ごす時間を届けたい。</p>
            <p className="mt-6">
              そんな想いを込めて「三十日珈琲」と名付けました。
            </p>
          </div>
        </div>
      </section>

      {/* Founders Story */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── 2人の出会い ──
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white aspect-[3/4] rounded-lg flex items-center justify-center text-haicha text-sm">
              後藤さん ポートレート写真
            </div>
            <div className="bg-white aspect-[3/4] rounded-lg flex items-center justify-center text-haicha text-sm">
              稲福さん ポートレート写真
            </div>
          </div>
          <p className="text-center text-haicha leading-relaxed">
            ※実際のインタビュー・コンセプトブックの内容をもとに、2人の出会い、
            コーヒーへの想い、なぜ上野原を選んだか、ADDressとの関わりなどの
            リアルストーリーを掲載予定。
          </p>
        </div>
      </section>

      {/* The House */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-8">
            ── 築300年の古民家 ──
          </h2>
          <div className="aspect-video bg-tsuchikabe rounded-lg flex items-center justify-center text-haicha text-sm mb-8">
            古民家の内部写真（梁・柱・自然光）
          </div>
          <div className="text-center text-haicha leading-loose">
            <p>山梨県上野原市。東京から約1時間の里山に、</p>
            <p>築300年を超える古民家があります。</p>
            <p className="mt-4">かつて地域の人々が集った場所を、</p>
            <p>コーヒーを通じて「みんなの焙煎所」として再生。</p>
            <p>古い梁の下で、焙煎機の音と香りが広がります。</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── 3つの約束 ──
          </h2>
          <div className="space-y-10">
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
            ].map((value) => (
              <div key={value.num} className="max-w-2xl mx-auto">
                <p className="text-gold font-bold text-lg mb-1">
                  {value.num}. {value.title}
                </p>
                <p className="text-haicha leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
