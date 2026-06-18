import type { Metadata } from "next";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

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
        a: "はい、年齢を問わずどなたでも歓迎です。コーヒーに興味があるお子様もぜひご一緒にどうぞ。なお、高校生以上の方は1名分の体験料金をいただいております。",
      },
      {
        q: "持ち物は何が必要ですか？",
        a: "特に必要ありません。手ぶらでお越しください。",
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
        q: "何日前までに予約すれば良いですか？",
        a: "基本的には3日前までにご予約ください。ただし、豆の在庫状況によっては直前のご注文にも対応できる場合がございますので、お急ぎの場合はお気軽にご相談ください。",
      },
      {
        q: "カップは付いていますか？",
        a: "はい、人数分の紙カップをご用意いたします。シュガー・ミルク・マドラーが必要な場合は、オプション（+500円/1ポット）でお付けできます。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero title="FAQ" subtitle="よくある質問" />

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-20 md:space-y-24">
          {faqCategories.map((category, ci) => (
            <ScrollReveal key={category.title} delay={ci * 0.1}>
              <div>
                <h2 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-3">
                  {category.title}
                </h2>
                <div className="w-8 h-px bg-gold/40 mb-8" />
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <details
                      key={item.q}
                      className="bg-white rounded-sm group"
                    >
                      <summary className="text-sm text-sumi cursor-pointer tracking-wide px-6 py-5 leading-relaxed">
                        {item.q}
                      </summary>
                      <div className="px-6 pb-6">
                        <p className="text-sm text-haicha leading-[2] tracking-wide">
                          {item.a}
                        </p>
                      </div>
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
