import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "コミュニティ",
  description:
    "三十日珈琲は、ADDress（多拠点生活サービス）から生まれたコミュニティ型の焙煎所です。",
};

export default function CommunityPage() {
  return (
    <>
      <PageHero
        title="COMMUNITY"
        subtitle="コーヒーでつながる"
        description="三十日珈琲は、ADDress（多拠点生活サービス）から生まれたコミュニティ型の焙煎所です。"
        image="/images/community/people.jpg"
      />

      {/* ADDress Partnership */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-6">
              ADDressとの連携
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/community/people.jpg"
                  alt="ADDress拠点での写真"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="text-haicha text-lg leading-loose space-y-4">
                <p>
                  多拠点生活の中で出会った2人の創業者が、
                  「旅するようにコーヒーと出会う場所」を作りたいと始めた焙煎所です。
                </p>
                <p>
                  ADDress会員の方は滞在中にお気軽にお立ち寄りください。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Member Registration */}
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-6">
              焙煎所メンバー登録
            </h2>
            <p className="text-sm text-haicha mb-8">無料</p>
            <div className="w-16 h-px bg-gold mx-auto mb-16" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 rounded-lg shadow-sm">
              <ul className="text-sm text-haicha space-y-4 text-left mb-12">
                <li className="flex items-center gap-3">
                  <span className="w-4 h-px bg-gold flex-shrink-0" />
                  限定ブログ（焙煎レシピ・産地情報）が読める
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-4 h-px bg-gold flex-shrink-0" />
                  焙煎体験の優先予約
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-4 h-px bg-gold flex-shrink-0" />
                  来訪スタンプカード（特典あり）
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-4 h-px bg-gold flex-shrink-0" />
                  メンバー限定イベントのご案内
                </li>
              </ul>
              <button className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded font-medium transition-colors">
                無料メンバー登録する
              </button>
              <p className="text-xs text-haicha mt-3">
                ※ メンバー登録機能は準備中です
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
