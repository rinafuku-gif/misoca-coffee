import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "FAQ",
  description: "三十日珈琲のよくある質問。焙煎体験、商品、配送、ケータリングについて。",
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
        a: "全国一律 ¥370です。¥5,000以上のご注文で送料無料になります。",
      },
      {
        q: "届くまでどのくらいかかりますか？",
        a: "ご注文後に焙煎し、3日以内に発送します。発送後1〜3日でお届けします。",
      },
    ],
  },
  {
    title: "ケータリングについて",
    items: [
      {
        q: "対応エリアはどこですか？",
        a: "山梨県上野原市（全域）、相模原市緑区（藤野エリア周辺）、山梨県大月市（市内中心部・近隣）が基本エリアです。対応エリア内は配送料・設置費が無料です。その他の近隣エリアもご相談ください。",
      },
      {
        q: "前日でも予約できますか？",
        a: "はい、前日の午前中まで承ります。ただし在庫状況によりご希望に添えない場合もございますので、お早めのご予約をおすすめします。",
      },
      {
        q: "カップは付いていますか？",
        a: "はい。すべてのプランに紙カップ・マドラー・シュガー・ミルクをセットでお届けします。",
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
                <h2 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-2">
                  {category.title}
                </h2>
                <div className="w-8 h-px bg-gold/40 mb-6" />
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <details
                      key={item.q}
                      className="bg-white p-8"
                    >
                      <summary className="text-sm text-sumi cursor-pointer tracking-wide">
                        {item.q}
                      </summary>
                      <p className="mt-3 text-sm text-haicha leading-[2.2] tracking-wide">
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
