import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
};

const items = [
  ["販売業者", "三十日珈琲"],
  ["運営責任者", "請求があった場合に遅滞なく開示いたします"],
  ["所在地", "〒409-0115 山梨県上野原市松留939"],
  ["電話番号", "請求があった場合に遅滞なく開示いたします"],
  ["メールアドレス", "misocacoffee@gmail.com"],
  ["販売価格", "各商品ページに記載（税込表示）"],
  ["商品代金以外の必要料金", "送料 全国一律 ¥370（¥5,000以上で送料無料）"],
  ["お支払い方法", "クレジットカード（Stripe決済）"],
  ["お支払い時期", "ご注文時にカード決済"],
  ["商品の引き渡し時期", "注文確定後、焙煎の上3営業日以内に発送"],
  ["返品・交換について", "商品の性質上、お客様都合の返品は不可。配送中の破損・誤配送は商品到着後7日以内にご連絡ください"],
  ["キャンセルについて", "焙煎体験は体験日の3日前までにご連絡ください。当日キャンセルは体験料金の100%を申し受ける場合があります"],
];

export default function TokushohoPage() {
  return (
    <>
      <PageHero title="LEGAL" subtitle="特定商取引法に基づく表記" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="bg-white p-8 md:p-10 rounded-sm shadow-sm">
            <dl className="space-y-0">
              {items.map(([dt, dd], i) => (
                <div
                  key={dt}
                  className={`flex flex-col sm:flex-row py-5 ${
                    i < items.length - 1 ? "border-b border-usuzumi/30" : ""
                  }`}
                >
                  <dt className="w-full sm:w-48 text-sm text-haicha flex-shrink-0 mb-1 sm:mb-0 font-medium">
                    {dt}
                  </dt>
                  <dd className="text-sm text-sumi leading-relaxed">{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
