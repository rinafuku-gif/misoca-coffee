"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { JournalPost } from "@/lib/notion";

const categories = ["すべて", "上野原の暮らし", "コーヒーの知識", "産地レポート", "お知らせ"];

const fallbackPosts: JournalPost[] = [
  {
    id: "1",
    category: "上野原の暮らし",
    title: "古民家の冬支度──薪ストーブとコーヒーの日々",
    date: "2026-02-15",
    excerpt: "",
    coverImage: "",
    status: "公開",
  },
  {
    id: "2",
    category: "産地レポート",
    title: "エチオピアのコーヒー農園を訪ねて",
    date: "2026-02-01",
    excerpt: "",
    coverImage: "",
    status: "公開",
  },
  {
    id: "3",
    category: "お知らせ",
    title: "焙煎体験 春の予約受付開始のお知らせ",
    date: "2026-01-20",
    excerpt: "",
    coverImage: "",
    status: "公開",
  },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<JournalPost[]>(fallbackPosts);
  const [activeCategory, setActiveCategory] = useState("すべて");

  useEffect(() => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = activeCategory === "すべて"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

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
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeCategory === cat
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
          {filtered.length === 0 ? (
            <p className="text-center text-haicha py-20">
              このカテゴリの記事はまだありません。
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              {filtered.map((post, i) => (
                <ScrollReveal key={post.id} direction="up" delay={i * 0.1}>
                  <article className="group bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-[16/9] bg-tsuchikabe relative overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl text-karekusa/20 font-serif">JOURNAL</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    <div className="p-8">
                      <span className="text-xs border border-karekusa/30 text-karekusa px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <h3 className="font-serif font-bold text-konsumi mt-3 mb-2 leading-snug group-hover:text-gold transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-haicha mb-2 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-haicha">{formatDate(post.date)}</p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
