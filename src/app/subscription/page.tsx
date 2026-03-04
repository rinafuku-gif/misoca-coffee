import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

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
        image="/images/hero/hero-3.jpg"
      />

      {/* Plans */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name} direction="up" delay={i * 0.15}>
                <div
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
                  <p className="text-3xl font-bold text-gold mb-1">
                    {plan.price}
                  </p>
                  <p className="text-xs text-haicha mb-6">/ 月（税・送料込）</p>
                  <ul className="text-sm text-haicha space-y-3 text-left mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="w-4 h-px bg-gold flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-gold hover:bg-gold-dark text-white py-3 rounded font-medium transition-colors">
                    このプランを選ぶ
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/hero/hero-2.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-white mb-4">
              お届けの流れ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <div className="space-y-8">
            {[
              { step: "01", text: "プランを選んでお申し込み" },
              { step: "02", text: "毎月20日頃にご注文分を焙煎" },
              { step: "03", text: "焙煎から3日以内に発送" },
              { step: "04", text: "ポスト投函でお届け（近況レター同封）" },
            ].map((item, i) => (
              <ScrollReveal
                key={item.step}
                direction={i % 2 === 0 ? "left" : "right"}
              >
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-serif text-gold/50 font-bold flex-shrink-0 w-10">
                    {item.step}
                  </span>
                  <p className="text-white text-lg">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-4">
              よくある質問
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <div className="space-y-4">
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
            ].map((item, i) => (
              <ScrollReveal key={item.q} delay={i * 0.1}>
                <details className="bg-white p-6 rounded-lg shadow-sm">
                  <summary className="font-medium text-konsumi cursor-pointer">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm text-haicha">{item.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
