import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "メニュー",
  description:
    "三十日珈琲のコーヒー豆ラインナップ。スペシャルティコーヒーを焙煎から3日以内に発送。",
};

const products = [
  {
    name: "エチオピア イルガチェフェ",
    description: "フローラルな香りと柑橘系の明るい酸味",
    roast: "浅煎り",
    price: "¥1,580",
  },
  {
    name: "グアテマラ アンティグア",
    description: "チョコレートのようなコクと甘み",
    roast: "中煎り",
    price: "¥1,480",
  },
  {
    name: "ブラジル セラード",
    description: "ナッツの甘みとクリーンな味",
    roast: "中深煎り",
    price: "¥1,380",
  },
  {
    name: "コロンビア ウィラ",
    description: "バランスの良い甘みと柔らかな酸味",
    roast: "中煎り",
    price: "¥1,480",
  },
  {
    name: "ケニア AA",
    description: "ベリーのような華やかさと豊かなボディ",
    roast: "中煎り",
    price: "¥1,680",
  },
  {
    name: "インドネシア マンデリン",
    description: "スパイシーで深みのあるコクとアーシーな風味",
    roast: "深煎り",
    price: "¥1,580",
  },
];

export default function MenuPage() {
  return (
    <>
      <PageHero
        title="MENU"
        subtitle="コーヒー豆ラインナップ"
        description="すべて焙煎から3日以内に発送。スペシャルティグレードの豆のみを厳選。"
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-tsuchikabe flex items-center justify-center text-haicha text-sm">
                  商品写真
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-karekusa/10 text-karekusa px-2 py-1 rounded">
                      {product.roast}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-konsumi mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-haicha mb-3">
                    {product.description}
                  </p>
                  <p className="font-bold text-karekusa">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
