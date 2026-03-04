import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

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
    image: "/images/menu/ethiopia.jpg",
  },
  {
    name: "グアテマラ アンティグア",
    description: "チョコレートのようなコクと甘み",
    roast: "中煎り",
    price: "¥1,480",
    image: "/images/menu/guatemala.jpg",
  },
  {
    name: "ブラジル セラード",
    description: "ナッツの甘みとクリーンな味",
    roast: "中深煎り",
    price: "¥1,380",
    image: "/images/menu/brazil.jpg",
  },
  {
    name: "コロンビア ウィラ",
    description: "バランスの良い甘みと柔らかな酸味",
    roast: "中煎り",
    price: "¥1,480",
    image: "/images/menu/colombia.jpg",
  },
  {
    name: "ケニア AA",
    description: "ベリーのような華やかさと豊かなボディ",
    roast: "中煎り",
    price: "¥1,680",
    image: "/images/menu/kenya.jpg",
  },
  {
    name: "インドネシア マンデリン",
    description: "スパイシーで深みのあるコクとアーシーな風味",
    roast: "深煎り",
    price: "¥1,580",
    image: "/images/menu/indonesia.jpg",
  },
];

export default function MenuPage() {
  return (
    <>
      <PageHero
        title="MENU"
        subtitle="コーヒー豆ラインナップ"
        description="すべて焙煎から3日以内に発送。スペシャルティグレードの豆のみを厳選。"
        image="/images/menu/ethiopia.jpg"
      />

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, i) => (
              <ScrollReveal key={product.name} direction="up" delay={i * 0.1}>
                <div className="group bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs border border-karekusa/30 text-karekusa px-2 py-1 rounded">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
