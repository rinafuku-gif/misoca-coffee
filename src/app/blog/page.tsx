import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

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
        image="/images/hero/hero-4.jpg"
      />

      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Categories */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-2 mb-12 justify-center">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    i === 0
                      ? "bg-konsumi text-white"
                      : "bg-white text-haicha hover:bg-tsuchikabe"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Posts */}
          <div className="grid md:grid-cols-3 gap-10">
            {posts.map((post, i) => (
              <ScrollReveal key={post.title} direction="up" delay={i * 0.1}>
                <article className="group bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer">
                  <div className="aspect-[16/9] bg-tsuchikabe relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div className="p-8">
                    <span className="text-xs border border-karekusa/30 text-karekusa px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <h3 className="font-serif font-bold text-konsumi mt-3 mb-2 leading-snug group-hover:text-gold transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-haicha">{post.date}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
