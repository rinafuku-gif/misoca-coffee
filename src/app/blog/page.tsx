"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import type { JournalPost } from "@/features/journal/notion";

const categories = ["すべて", "上野原の暮らし", "コーヒーの知識", "産地レポート", "お知らせ"];

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/journal", { cache: "no-store" })
      .then((res) => { if (!res.ok) throw new Error("JOURNAL_UNAVAILABLE"); return res.json(); })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("JOURNAL_UNAVAILABLE");
        if (!cancelled) { setPosts(data); setLoadState("ready"); }
      })
      .catch(() => { if (!cancelled) { setPosts([]); setLoadState("error"); } });
    return () => { cancelled = true; };
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

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Categories */}
          <ScrollReveal>
            <div className="flex flex-wrap gap-2 mb-16 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs tracking-[0.1em] transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-konsumi text-white"
                      : "border border-usuzumi/30 text-haicha hover:border-karekusa hover:text-karekusa"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Posts */}
          {loadState !== "ready" || filtered.length === 0 ? (
            <p role="status" className="text-center text-haicha py-20">
              {loadState === "loading" ? "記事を読み込んでいます。" : loadState === "error" ? "記事を取得できませんでした。時間をおいてページを開き直してください。" : "このカテゴリの公開記事はまだありません。"}
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              {filtered.map((post, i) => (
                <ScrollReveal key={post.id} direction="up" delay={i * 0.1}>
                  <Link href={`/blog/${post.id}`}>
                  <article className="group overflow-hidden cursor-pointer">
                    <div className="aspect-[16/9] bg-tsuchikabe relative overflow-hidden rounded-sm">
                      {post.coverImage && !failedImages.has(post.id) ? (
                        <Image
                          src={post.coverImage}
                          unoptimized={post.coverImage.startsWith("/api/notion-image/")}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          onError={() => setFailedImages((prev) => new Set(prev).add(post.id))}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl text-karekusa/20 font-serif">JOURNAL</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    <div className="pt-6">
                      <span className="text-xs border border-karekusa/30 text-karekusa px-2 py-1">
                        {post.category}
                      </span>
                      <h3 className="font-serif text-base text-konsumi tracking-wider font-light mt-3 mb-2 leading-snug group-hover:text-gold/80 transition-colors duration-300">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-haicha mb-2 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-haicha/60">{formatDate(post.date)}</p>
                    </div>
                  </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
