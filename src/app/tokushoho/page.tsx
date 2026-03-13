import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
};

export default function TokushohoPage() {
  return (
    <>
      <PageHero title="LEGAL" subtitle="特定商取引法に基づく表記" />
      <section className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white p-8 rounded-sm">
            <dl className="space-y-4 text-sm">
              {[
                ["販売業者", "三十日珈琲"],
                ["所在地", "〒409-0115 山梨県上野原市松留939"],
                ["メールアドレス", "misocacoffee@gmail.com"],
                ["販売価格", "各商品ページに記載"],
                ["送料", "全国一律 ¥370（¥5,000以上で送料無料）"],
                ["お支払い方法", "クレジットカード（Stripe）"],
                ["商品の引き渡し時期", "注文確定後、焙煎の上3日以内に発送"],
                ["返品・交換", "商品到着後7日以内にご連絡ください"],
              ].map(([dt, dd]) => (
                <div key={dt} className="flex border-b border-usuzumi/30 pb-4">
                  <dt className="w-40 text-haicha flex-shrink-0">{dt}</dt>
                  <dd className="text-sumi">{dd}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
