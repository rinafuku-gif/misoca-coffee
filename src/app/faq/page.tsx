import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "FAQ",
  description: "三十日珈琲のよくある質問。焙煎体験、商品、定期便、ケータリングについて。",
};

const faqCategories = [
  {
    title: "焙煎体験について",
    items: [
      {
        q: "予約は必要ですか？",
        a: "はい。完全予約制です。体験予約ページからお申し込みください。",
      },
      {
        q: "子どもも参加できますか？",
        a: "小学生以上のお子様からご参加いただけます。小さなお子様連れの場合は事前にご相談ください。",
      },
      {
        q: "持ち物は何が必要ですか？",
        a: "特に必要ありません。エプロンは用意しています。汚れても良い服装でお越しください。",
      },
    ],
  },
  {
    title: "商品・配送について",
    items: [
      {
        q: "送料はいくらですか？",
        a: "全国一律 ¥370（ネコポス）です。¥5,000以上のご注文で送料無料。定期便は送料込みの価格です。",
      },
      {
        q: "届くまでどのくらいかかりますか？",
        a: "ご注文後に焙煎し、3日以内に発送します。発送後1〜3日でお届けします。",
      },
    ],
  },
  {
    title: "定期便について",
    items: [
      {
        q: "いつでも解約できますか？",
        a: "はい。マイページからいつでも解約できます。次回発送日の5日前までにお手続きください。",
      },
      {
        q: "スキップはできますか？",
        a: "はい。マイページから翌月のスキップが可能です。",
      },
    ],
  },
  {
    title: "ケータリングについて",
    items: [
      {
        q: "対応エリアはどこですか？",
        a: "山梨県上野原市（全域）、相模原市緑区（藤野エリア周辺）、山梨県大月市（市内中心部・近隣）が基本エリアです。その他の近隣エリアも柔軟に対応いたします。",
      },
      {
        q: "何日前までに依頼が必要ですか？",
        a: "2週間前までにお問い合わせください。繁忙期は1ヶ月前のご依頼をおすすめします。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero title="FAQ" subtitle="よくある質問" />

      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {faqCategories.map((category, ci) => (
            <ScrollReveal key={category.title} delay={ci * 0.1}>
              <div className="mb-12 last:mb-0">
                <h2 className="font-serif text-xl font-bold text-konsumi mb-2">
                  {category.title}
                </h2>
                <div className="w-8 h-px bg-gold mb-6" />
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <details
                      key={item.q}
                      className="bg-white p-8 rounded-lg shadow-sm"
                    >
                      <summary className="font-medium text-sumi cursor-pointer">
                        {item.q}
                      </summary>
                      <p className="mt-3 text-sm text-haicha leading-loose">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
