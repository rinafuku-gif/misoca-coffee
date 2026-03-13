import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "コミュニティ",
  description:
    "三十日珈琲のコミュニティ。コーヒーを通じてつながる人と場所。焙煎体験、イベント、地域交流を通じた新しいつながりの形。",
};

const connections = [
  {
    num: "01",
    title: "焙煎体験でつながる",
    text: "一緒に豆を焙煎し、テイスティングする時間は、自然と会話が生まれる時間。初対面の方同士が、コーヒーを通じて友人になることも珍しくありません。",
  },
  {
    num: "02",
    title: "地域でつながる",
    text: "上野原の農家さんや職人さんとの協業、地域イベントへの出店。コーヒーを起点に、まちの魅力を内外に発信しています。",
  },
  {
    num: "03",
    title: "オンラインでつながる",
    text: "Instagramでの情報発信、オンラインショップを通じたやりとり。遠くにいても三十日珈琲とつながれる仕組みをつくっています。",
  },
];

export default function CommunityPage() {
  return (
    <>
      <PageHero
        title="COMMUNITY"
        subtitle="コミュニティ"
        description="コーヒーでつながる、人と場所。"
      />

      {/* Concept */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Concept
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
              コーヒーでつながる
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha leading-loose max-w-2xl mx-auto mb-6">
              三十日珈琲は、コーヒーを「飲む場所」であると同時に、
              「人と出会う場所」でありたいと考えています。
            </p>
            <p className="text-haicha leading-loose max-w-2xl mx-auto">
              焙煎体験に訪れる人、コーヒースタンドで立ち寄る人、
              オンラインで豆を注文する人。さまざまな形で三十日珈琲と関わるすべての人が、
              ゆるやかにつながるコミュニティを育てています。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Three Connections */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Connections
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              3つのつながり
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-10">
            {connections.map((item, i) => (
              <ScrollReveal
                key={item.num}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={i * 0.1}
              >
                <div className="bg-white p-8 md:p-12 rounded-sm">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                    <span className="text-3xl font-serif text-gold/15 font-light flex-shrink-0">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                        {item.title}
                      </h3>
                      <p className="text-haicha leading-loose">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram & Events */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <ScrollReveal direction="left">
              <div className="bg-tsuchikabe p-10 rounded-sm h-full">
                <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                  Instagram
                </p>
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  日々の発信
                </h3>
                <p className="text-haicha leading-loose mb-8">
                  焙煎の様子、季節の風景、新しい豆の入荷情報。
                  三十日珈琲の日常をInstagramでお届けしています。
                </p>
                <a
                  href="https://instagram.com/misoca_coffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-6 py-3 text-xs tracking-[0.2em] transition-all duration-500"
                >
                  @misoca_coffee
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.15}>
              <div className="bg-tsuchikabe p-10 rounded-sm h-full">
                <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-4 uppercase">
                  Events
                </p>
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  イベント
                </h3>
                <p className="text-haicha leading-loose mb-8">
                  地域のマルシェやお祭りへの出店、
                  ワークショップの開催など、
                  さまざまなイベントに参加しています。
                  最新情報はInstagramをご確認ください。
                </p>
                <Link
                  href="/stand"
                  className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-6 py-3 text-xs tracking-[0.2em] transition-all duration-500"
                >
                  コーヒースタンドへ
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8">
              三十日珈琲とつながる
            </h2>
            <p className="text-haicha leading-loose mb-12">
              焙煎体験でお会いしましょう。
              <br />
              コーヒーを通じた新しいつながりが、ここから始まります。
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
                href="/contact"
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
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
