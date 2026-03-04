import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "定期便",
  description:
    "三十日珈琲の定期便。毎月届く、上野原からの手紙。焙煎したてのコーヒーと里山の暮らしの便り。月額¥2,980〜。",
};

const plans = [
  {
    name: "おためし",
    amount: "100g",
    price: "¥2,980",
    features: ["淹れ方ガイド付き", "焙煎所近況レター"],
  },
  {
    name: "スタンダード",
    amount: "200g",
    price: "¥3,980",
    recommended: true,
    features: ["淹れ方ガイド付き", "焙煎所近況レター", "テイスティングノート"],
  },
  {
    name: "たっぷり",
    amount: "300g",
    price: "¥4,980",
    features: [
      "淹れ方ガイド付き",
      "焙煎所近況レター",
      "テイスティングノート",
      "焙煎体験優先予約",
      "限定豆優先案内",
    ],
  },
];

export default function SubscriptionPage() {
  return (
    <>
      <PageHero
        title="SUBSCRIPTION"
        subtitle="毎月届く、上野原からの手紙。"
        description="焙煎したてのコーヒーと、里山の暮らしの便り。三十日珈琲の日常を、毎月お届けします。"
      />

      {/* Plans */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-lg p-8 text-center shadow-sm ${
                  plan.recommended ? "ring-2 ring-gold relative" : ""
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs px-3 py-1 rounded-full">
                    おすすめ
                  </span>
                )}
                <h3 className="font-serif text-xl font-bold text-konsumi mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-haicha mb-4">毎月 {plan.amount}</p>
                <p className="text-3xl font-bold text-karekusa mb-1">
                  {plan.price}
                </p>
                <p className="text-xs text-haicha mb-6">/ 月（税・送料込）</p>
                <ul className="text-sm text-haicha space-y-2 text-left mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <button className="w-full bg-karekusa hover:bg-karekusa-dark text-white py-3 rounded font-medium transition-colors">
                  このプランを選ぶ
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── お届けの流れ ──
          </h2>
          <div className="space-y-6">
            {[
              { step: "1", text: "プランを選んでお申し込み" },
              { step: "2", text: "毎月20日頃にご注文分を焙煎" },
              { step: "3", text: "焙煎から3日以内に発送" },
              { step: "4", text: "ポスト投函でお届け（近況レター同封）" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center font-bold">
                  {item.step}
                </span>
                <p className="text-sumi">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-12">
            ── よくある質問 ──
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "いつでも解約できますか？",
                a: "はい。マイページからいつでも解約できます。次回発送日の5日前までにお手続きください。",
              },
              {
                q: "届く豆は自分で選べますか？",
                a: "焙煎士が毎月厳選してお届けします。苦手な味の傾向はマイページで設定できます。",
              },
              {
                q: "スキップはできますか？",
                a: "はい。マイページから翌月のスキップが可能です。",
              },
            ].map((item) => (
              <details key={item.q} className="bg-white p-6 rounded-lg shadow-sm">
                <summary className="font-medium text-konsumi cursor-pointer">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm text-haicha">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
