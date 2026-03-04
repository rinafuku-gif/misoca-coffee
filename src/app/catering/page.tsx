import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "ケータリング・出張珈琲",
  description:
    "三十日珈琲の焙煎士がイベントに伺い、その場で淹れたてのコーヒーをご提供。結婚式、企業イベント、マルシェなど。",
};

const plans = [
  {
    name: "ライト",
    content: "ドリップ提供（〜30杯）",
    price: "¥10,000〜",
  },
  {
    name: "スタンダード",
    content: "ドリップ + 焙煎デモ（〜50杯）",
    price: "¥25,000〜",
  },
  {
    name: "プレミアム",
    content: "フル体験 + 焙煎ワークショップ（〜80杯）",
    price: "¥42,000〜",
  },
];

export default function CateringPage() {
  return (
    <>
      <PageHero
        title="CATERING"
        subtitle="イベント・企業向け 出張珈琲"
        description="三十日珈琲の焙煎士が、あなたのイベントに伺います。"
      />

      {/* Service Overview */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] bg-tsuchikabe rounded-lg flex items-center justify-center text-haicha text-sm">
              ケータリング提供風景の写真
            </div>
            <div>
              <p className="text-haicha leading-relaxed">
                結婚式、企業イベント、マルシェ、プライベートパーティーなど、
                さまざまなシーンで焙煎したてのコーヒーをご提供します。
              </p>
              <p className="text-haicha leading-relaxed mt-4">
                その場で豆を挽き、ハンドドリップで一杯ずつ丁寧に。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── メニュー・料金目安 ──
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="bg-white p-6 rounded-lg text-center shadow-sm"
              >
                <h3 className="font-serif text-lg font-bold text-konsumi mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-haicha mb-4">{plan.content}</p>
                <p className="text-xl font-bold text-gold">{plan.price}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-haicha mt-8">
            対応エリア: 山梨県・東京都・神奈川県（その他の地域はご相談ください）
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-konsumi mb-4">
            ── お問い合わせ・ご依頼 ──
          </h2>
          <p className="text-haicha mb-8">
            イベントの規模やご要望に合わせてご提案いたします。
            <br />
            まずはお気軽にお問い合わせください。
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded font-medium transition-colors"
          >
            お問い合わせする
          </Link>
        </div>
      </section>
    </>
  );
}
