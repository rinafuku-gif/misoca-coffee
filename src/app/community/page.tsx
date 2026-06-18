import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

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
              <a
                href="https://lin.ee/ihDBxM8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEでお問い合わせ
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
