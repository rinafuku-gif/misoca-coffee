import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "ご注文ありがとうございます",
  description: "三十日珈琲オンラインショップ - ご注文完了",
};

export default function SuccessPage() {
  return (
    <section className="py-32 md:py-44 overflow-hidden">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <ScrollReveal>
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-10">
            <svg
              className="w-10 h-10 text-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-konsumi mb-6">
            ご注文ありがとうございます
          </h1>
          <p className="text-haicha text-lg leading-loose mb-4">
            ご注文を承りました。焙煎後3日以内に発送いたします。
          </p>
          <p className="text-haicha leading-loose mb-12">
            ご注文の確認メールをお送りしました。
            <br />
            届かない場合はお手数ですがお問い合わせください。
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-10 py-4 rounded font-medium transition-all duration-300"
            >
              ショップに戻る
            </Link>
            <Link
              href="/"
              className="inline-block border-2 border-usuzumi text-haicha hover:bg-tsuchikabe px-10 py-4 rounded font-medium transition-all duration-300"
            >
              トップへ
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
