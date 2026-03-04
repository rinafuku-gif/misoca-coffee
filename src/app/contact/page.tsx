import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "三十日珈琲へのお問い合わせ。焙煎体験、ケータリング、商品に関するご質問など。",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="CONTACT"
        subtitle="お問い合わせ"
        description="ご質問・ご相談はお気軽にどうぞ。2営業日以内にご返信いたします。"
      />

      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-sumi mb-2">
                お問い合わせ種別 <span className="text-error">*</span>
              </label>
              <select className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-karekusa focus:outline-none">
                <option>選択してください</option>
                <option>焙煎体験・見学について</option>
                <option>ケータリングについて</option>
                <option>商品について</option>
                <option>定期便について</option>
                <option>その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sumi mb-2">
                お名前 <span className="text-error">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-karekusa focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sumi mb-2">
                メールアドレス <span className="text-error">*</span>
              </label>
              <input
                type="email"
                className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-karekusa focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sumi mb-2">
                電話番号
              </label>
              <input
                type="tel"
                className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-karekusa focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-sumi mb-2">
                お問い合わせ内容 <span className="text-error">*</span>
              </label>
              <textarea
                rows={6}
                className="w-full border border-usuzumi rounded px-4 py-3 text-sm focus:border-karekusa focus:outline-none resize-y"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-karekusa hover:bg-karekusa-dark text-white py-4 rounded font-medium transition-colors"
            >
              送信する
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
