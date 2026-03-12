import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
  return (
    <>
      <PageHero title="TERMS" subtitle="利用規約" />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 prose prose-sm text-haicha">
          <h2>利用規約</h2>
          <p>この利用規約（以下「本規約」）は、三十日珈琲（以下「当店」）が提供するウェブサイトおよびサービスの利用条件を定めるものです。</p>

          <h3>第1条（適用）</h3>
          <p>本規約は、当店のウェブサイト（misoca-coffee.vercel.app）およびオンラインショップをご利用いただくすべてのお客様に適用されます。</p>

          <h3>第2条（焙煎体験について）</h3>
          <ul>
            <li>焙煎体験は完全予約制です。</li>
            <li>キャンセルは前日までにご連絡ください。</li>
            <li>当日キャンセル・無断キャンセルの場合、キャンセル料が発生する場合があります。</li>
            <li>天候や設備の都合により、やむを得ず体験内容を変更・中止する場合があります。</li>
          </ul>

          <h3>第3条（オンラインショップについて）</h3>
          <ul>
            <li>商品は注文確定後に焙煎し、3日以内に発送いたします。</li>
            <li>商品の性質上、お客様都合による返品・交換はお受けできません。</li>
            <li>商品に不備があった場合は、到着後7日以内にご連絡ください。</li>
          </ul>

          <h3>第4条（知的財産権）</h3>
          <p>当サイトに掲載されている文章、画像、デザイン等の著作権は当店に帰属します。無断転載・複製を禁じます。</p>

          <h3>第5条（免責事項）</h3>
          <p>当店は、当サイトの情報の正確性について万全を期しておりますが、その完全性・正確性を保証するものではありません。</p>

          <h3>第6条（規約の変更）</h3>
          <p>当店は、必要に応じて本規約を変更できるものとします。変更後の規約は、当サイトに掲載した時点で効力を生じます。</p>

          <p className="text-xs text-haicha/60 mt-8">制定日: 2025年1月1日</p>
        </div>
      </section>
    </>
  );
}
