import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

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
      />

      {/* ADDress Partnership */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── ADDressとの連携 ──
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] bg-tsuchikabe rounded-lg flex items-center justify-center text-haicha text-sm">
              ADDress拠点での写真
            </div>
            <div className="text-haicha leading-relaxed space-y-4">
              <p>
                多拠点生活の中で出会った2人の創業者が、
                「旅するようにコーヒーと出会う場所」を作りたいと始めた焙煎所です。
              </p>
              <p>
                ADDress会員の方は滞在中にお気軽にお立ち寄りください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Member Registration */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-8">
            ── 焙煎所メンバー登録（無料） ──
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <ul className="text-sm text-haicha space-y-3 text-left mb-8">
              <li>✓ 限定ブログ（焙煎レシピ・産地情報）が読める</li>
              <li>✓ 焙煎体験の優先予約</li>
              <li>✓ 来訪スタンプカード（特典あり）</li>
              <li>✓ メンバー限定イベントのご案内</li>
            </ul>
            <button className="w-full bg-karekusa hover:bg-karekusa-dark text-white py-3 rounded font-medium transition-colors">
              無料メンバー登録する
            </button>
            <p className="text-xs text-haicha mt-3">
              ※ メンバー登録機能は準備中です
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
