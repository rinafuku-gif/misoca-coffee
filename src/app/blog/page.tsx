import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "ブログ",
  description:
    "三十日珈琲のブログ。上野原の暮らし、コーヒーの知識、産地レポートなど。",
};

const categories = ["すべて", "上野原の暮らし", "コーヒーの知識", "産地レポート", "お知らせ"];

const posts = [
  {
    category: "上野原の暮らし",
    title: "古民家の冬支度──薪ストーブとコーヒーの日々",
    date: "2026.02.15",
  },
  {
    category: "産地レポート",
    title: "エチオピアのコーヒー農園を訪ねて",
    date: "2026.02.01",
  },
  {
    category: "お知らせ",
    title: "焙煎体験 春の予約受付開始のお知らせ",
    date: "2026.01.20",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="BLOG"
        subtitle="コラム・お知らせ"
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  i === 0
                    ? "bg-karekusa text-white"
                    : "bg-white text-haicha hover:bg-tsuchikabe"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.title}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="aspect-[16/9] bg-tsuchikabe flex items-center justify-center text-haicha text-sm">
                  サムネイル
                </div>
                <div className="p-6">
                  <span className="text-xs bg-karekusa/10 text-karekusa px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <h3 className="font-serif font-bold text-konsumi mt-3 mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-haicha">{post.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
