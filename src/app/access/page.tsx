import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "アクセス",
  description:
    "三十日珈琲へのアクセス。山梨県上野原市、東京から約1時間。JR中央本線「上野原」駅からのご案内。",
};

export default function AccessPage() {
  return (
    <>
      <PageHero
        title="ACCESS"
        subtitle="アクセス"
        description="東京から約1時間。上野原の里山にある焙煎所です。"
      />

      {/* Map */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="aspect-video bg-tsuchikabe rounded-lg flex items-center justify-center text-haicha text-sm mb-12">
            Google Maps 埋め込み（準備中）
          </div>

          {/* Access Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                🚃 電車でお越しの方
              </h3>
              <ul className="text-sm text-haicha space-y-2">
                <li>JR中央本線「上野原」駅 下車</li>
                <li>新宿から特急で約50分</li>
                <li>高尾から普通電車で約15分</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                🚗 お車でお越しの方
              </h3>
              <ul className="text-sm text-haicha space-y-2">
                <li>中央自動車道「上野原IC」から約10分</li>
                <li>駐車場あり</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Info */}
      <section className="bg-tsuchikabe py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl text-center text-konsumi mb-8">
            ── 施設情報 ──
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <dl className="space-y-4 text-sm">
              <div className="flex">
                <dt className="w-24 text-haicha flex-shrink-0">施設名</dt>
                <dd className="text-sumi">三十日珈琲</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-haicha flex-shrink-0">住所</dt>
                <dd className="text-sumi">〒409-0112 山梨県上野原市上野原</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-haicha flex-shrink-0">営業日</dt>
                <dd className="text-sumi">完全予約制（焙煎体験・見学）</dd>
              </div>
              <div className="flex">
                <dt className="w-24 text-haicha flex-shrink-0">メール</dt>
                <dd className="text-sumi">info@misoca-coffee.jp</dd>
              </div>
            </dl>
            <div className="mt-6 text-center">
              <p className="text-sm text-haicha mb-4">
                ※お越しの際は事前にご予約をお願いします。
              </p>
              <Link
                href="/experience"
                className="inline-block bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded font-medium transition-colors text-sm"
              >
                焙煎体験を予約する →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
