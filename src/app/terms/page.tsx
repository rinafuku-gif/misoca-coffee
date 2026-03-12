import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "利用規約",
};

const sections = [
  {
    title: "1. 適用範囲",
    content:
      "本規約は、三十日珈琲（以下「当店」）が提供するWebサイト・オンラインショップ・焙煎体験予約等のすべてのサービスに適用されます。",
  },
  {
    title: "2. 焙煎体験のご予約について",
    content:
      "・焙煎体験は完全予約制です。\n・ご予約後のキャンセルは、体験日の3日前までにご連絡ください。\n・当日のキャンセル・無断キャンセルの場合、キャンセル料として体験料金の100%を申し受ける場合があります。\n・天候や災害等のやむを得ない事由による場合は、日程の変更にて対応いたします。",
  },
  {
    title: "3. オンラインショップについて",
    content:
      "・商品は注文確定後、焙煎の上3営業日以内に発送いたします。\n・送料は全国一律¥370です。¥5,000以上のご注文で送料無料となります。\n・お支払いはクレジットカード（Stripe決済）のみとなります。",
  },
  {
    title: "4. 返品・交換について",
    content:
      "・商品の性質上、お客様都合による返品・交換はお受けできません。\n・配送中の破損や注文と異なる商品が届いた場合は、商品到着後7日以内にご連絡ください。代替品の発送または返金にて対応いたします。",
  },
  {
    title: "5. 知的財産権",
    content:
      "当サイトに掲載されているテキスト、画像、デザイン等のコンテンツの著作権は当店に帰属します。無断での転載・複製はご遠慮ください。",
  },
  {
    title: "6. 免責事項",
    content:
      "・当サイトの情報は正確性を心がけておりますが、その完全性を保証するものではありません。\n・焙煎体験中の事故・怪我について、当店の重大な過失がない限り責任を負いかねます。体験中は焙煎士の指示に従ってください。",
  },
  {
    title: "7. 規約の変更",
    content:
      "当店は、必要に応じて本規約を変更することがあります。変更後の規約は、当サイトに掲載した時点で効力を生じるものとします。",
  },
  {
    title: "8. お問い合わせ先",
    content: "三十日珈琲\n所在地：〒409-0115 山梨県上野原市松留939\nメール：misocacoffee@gmail.com",
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero title="TERMS" subtitle="利用規約" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <p className="text-sm text-haicha mb-12 leading-relaxed">
            三十日珈琲のサービスをご利用いただく前に、以下の利用規約をお読みください。
          </p>
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-serif text-lg text-konsumi mb-4">
                  {section.title}
                </h2>
                <p className="text-sm text-haicha leading-loose whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-usuzumi/30">
            <p className="text-xs text-haicha">制定日：2026年3月12日</p>
          </div>
        </div>
      </section>
    </>
  );
}
