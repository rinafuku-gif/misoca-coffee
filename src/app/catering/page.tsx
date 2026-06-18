import type { Metadata } from "next";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "コーヒーケータリング",
  description:
    "三十日珈琲のコーヒーケータリング。プロが焙煎したスペシャルティコーヒーを保温ポットでお届け。企業イベント、ウェディング、地域イベントに。",
};

const plans = [
  {
    label: "S",
    name: "Sプラン",
    price: "¥10,000",
    campaign: "初回半額 ¥5,000",
    description: "〜15名様向け",
    includes: [
      "ポット1本（約3.4L）",
      "15〜20杯分",
      "紙カップ付き",
      "配送・回収費込み",
    ],
  },
  {
    label: "M",
    name: "Mプラン",
    price: "¥18,000",
    featured: true,
    description: "〜30名様向け",
    note: "Sプラン×2より2,000円お得",
    includes: [
      "ポット2本（約6.8L）",
      "30〜40杯分",
      "紙カップ付き",
      "配送・回収費込み",
    ],
  },
  {
    label: "L",
    name: "Lプラン",
    price: "¥26,000",
    description: "〜45名様向け",
    note: "1杯あたり約400円台の高コスパ",
    includes: [
      "ポット3本（約10.2L）",
      "45〜60杯分",
      "紙カップ付き",
      "配送・回収費込み",
    ],
  },
];

const largePlans = [
  { name: "LLプラン", capacity: "〜80名様", price: "¥34,000" },
  { name: "MAXプラン", capacity: "〜100名様", price: "¥42,000" },
];

const features = [
  {
    title: "ずっと美味しい、保温ポット",
    text: "バリスタが抽出したスペシャルティコーヒーを、高性能保温ポットでお届け。長時間温かい状態でお楽しみいただけます。",
  },
  {
    title: "準備・片付け不要",
    text: "ドリップ器具の準備や粉の処理、洗い物は一切不要。ポットは後日回収に伺います。",
  },
  {
    title: "たっぷりマグサイズ",
    text: "1杯約180mlのたっぷりサイズ。「おかわり」の余裕もあるので、ゆったりお楽しみいただけます。",
  },
];

const orderSteps = [
  {
    num: "01",
    title: "ご予約",
    text: "3日前までにLINE・メール・お電話でご予約ください。",
  },
  {
    num: "02",
    title: "お届け",
    text: "ご指定の時間・場所へ保温ポットをお届けします。",
  },
  {
    num: "03",
    title: "コーヒータイム",
    text: "カップに注ぐだけ。すぐにお楽しみいただけます。",
  },
  {
    num: "04",
    title: "回収",
    text: "ポットは当日または後日、回収に伺います。",
  },
];

const faqs = [
  {
    q: "何日前までに予約すれば良いですか？",
    a: "基本的には3日前までにご予約ください。ただし、豆の在庫状況によっては直前のご注文にも対応できる場合がございますので、お急ぎの場合はお気軽にご相談ください。",
  },
  {
    q: "配送時間は指定できますか？",
    a: "はい、午前9時〜午後6時の間でご指定いただけます。ご利用開始時刻の30分前のお届けを推奨しております。",
  },
  {
    q: "保温時間はどのくらいですか？",
    a: "高性能な保温ポットを使用しているため、長時間温かい状態を保つことができます。イベントや会議中はもちろん、休憩時間を通して美味しい温度でお楽しみいただけます。",
  },
  {
    q: "カップは付いていますか？",
    a: "はい、人数分の紙カップをご用意いたします。シュガー・ミルク・マドラーが必要な場合は、オプション（+500円/1ポット）でお付けできます。",
  },
];

const serviceAreas = [
  "山梨県上野原市（全域）",
  "相模原市緑区（藤野エリア周辺）",
  "山梨県大月市（市内中心部・近隣）",
];

export default function CateringPage() {
  return (
    <>
      <PageHero
        title="CATERING"
        subtitle="コーヒーケータリング"
        description="ポットひとつで、そこがカフェになる。"
        image="/images/catering/hand-drip.jpg"
      />

      {/* Concept */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Concept
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
              ポットひとつで、
              <br />
              そこがカフェになる
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha leading-loose max-w-2xl mx-auto">
              プロが焙煎したスペシャルティコーヒーを、保温ポットでお届けします。
              準備も片付けも不要。あなたのイベントに、最高の一杯を添えるだけ。
              コーヒーの香りが、その場の空気を変えます。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Features
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              3つの特徴
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.title} direction="up" delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-sm text-center h-full">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-6">
                    {feature.title}
                  </h3>
                  <div className="w-8 h-px bg-gold/30 mx-auto mb-6" />
                  <p className="text-sm text-haicha leading-loose">
                    {feature.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Plans
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              プラン・料金
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.label} direction="up" delay={i * 0.15}>
                <div
                  className={`bg-white rounded-sm p-10 text-center h-full flex flex-col relative ${
                    plan.featured ? "ring-1 ring-gold/40" : ""
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
                      おすすめ
                    </span>
                  )}
                  <p className="text-[10px] tracking-[0.5em] text-gold font-light mb-3 mt-2 uppercase">
                    {plan.label}
                  </p>
                  <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-light text-gold mb-1">
                    {plan.price}
                  </p>
                  <p className="text-xs text-haicha mb-2">（税込）</p>
                  {plan.campaign && (
                    <p className="text-xs text-gold font-medium mb-4 tracking-wide">
                      {plan.campaign}
                    </p>
                  )}
                  {plan.note && (
                    <p className="text-xs text-karekusa mb-4 tracking-wide">
                      {plan.note}
                    </p>
                  )}
                  <p className="text-sm text-haicha mb-8 leading-relaxed">
                    {plan.description}
                  </p>
                  <ul className="text-sm text-haicha space-y-3 text-left mb-10">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <a
                      href="https://lin.ee/ihDBxM8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block w-full py-4 text-xs tracking-[0.2em] transition-all duration-500 ${
                        plan.featured
                          ? "bg-gold/90 hover:bg-gold text-white"
                          : "border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white"
                      }`}
                    >
                      LINEで相談する
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Large Plans */}
          <ScrollReveal delay={0.3}>
            <div className="mt-12 bg-white rounded-sm p-8 md:p-10 max-w-2xl mx-auto">
              <h3 className="font-serif text-base text-konsumi tracking-wider font-light text-center mb-6">
                大規模プラン
              </h3>
              <div className="space-y-4">
                {largePlans.map((plan) => (
                  <div
                    key={plan.name}
                    className="flex items-center justify-between border-b border-usuzumi/20 pb-4"
                  >
                    <div>
                      <p className="text-sm text-konsumi font-light tracking-wide">
                        {plan.name}
                      </p>
                      <p className="text-xs text-haicha">{plan.capacity}</p>
                    </div>
                    <p className="text-lg font-light text-gold">
                      {plan.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mt-10 text-center space-y-2">
              <p className="text-xs text-haicha leading-relaxed">
                ※ オプション：シュガー・ミルク・マドラーセット +¥500/1ポット
              </p>
              <p className="text-xs text-haicha leading-relaxed">
                ※ 人数・内容に応じてカスタマイズも可能です。お気軽にご相談ください。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Order Flow */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Flow
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              ご注文の流れ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {orderSteps.map((step, i) => (
              <ScrollReveal key={step.num} direction="up" delay={i * 0.1}>
                <div className="text-center">
                  <span className="text-4xl text-gold/20 font-light block mb-4 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-haicha leading-loose">
                    {step.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Service Area
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              対応エリア
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 md:p-14 rounded-sm text-center">
              <ul className="space-y-4 mb-8">
                {serviceAreas.map((area) => (
                  <li
                    key={area}
                    className="text-konsumi flex items-center justify-center gap-3"
                  >
                    <span className="w-6 h-px bg-gold/40" />
                    {area}
                    <span className="w-6 h-px bg-gold/40" />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-haicha leading-relaxed">
                ※ 上記以外の近隣エリアもご相談ください。送料無料で対応可能です。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              FAQ
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              よくあるご質問
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="bg-white p-8 md:p-10 rounded-sm">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-4">
                    Q. {faq.q}
                  </h3>
                  <p className="text-sm text-haicha leading-loose">
                    {faq.a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8">
              ケータリングのご相談
            </h2>
            <p className="text-haicha leading-loose mb-12">
              日程・人数をお知らせいただければ、
              <br />
              最適なプランをご提案いたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://lin.ee/ihDBxM8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEでお問い合わせ
              </a>
              <a
                href="tel:090-8080-2165"
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                電話で相談する
              </a>
            </div>
            <p className="text-xs text-haicha/60 leading-relaxed">
              Instagram DM・メール（misocacoffee@gmail.com）でもご相談いただけます
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
