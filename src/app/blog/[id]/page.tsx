import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { NotionBlock } from "@/features/journal/notion";
import { readJournalArticle, readJournalMetadata } from "@/features/journal/site-journal";
import { isJournalCoverRoute } from "@/features/journal/emdash-public";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { siteOrigin } from "@/shared/seo/site-entities";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await readJournalMetadata(id);
  if (!post) return { title: "記事が見つかりません", robots: { index: false, follow: false } };

  // Nested metadata is replaced by Next.js, so the social block is complete.
  // The shared site image keeps link previews independent of the image proxy.
  const description = post.excerpt || `${post.title} - 三十日珈琲ジャーナル`;
  const url = `${siteOrigin}/blog/${post.id}`;
  const title = `${post.title} | 三十日珈琲`;
  const images = ["/images/hero/hero-interior-atmosphere.jpg"];
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "三十日珈琲 Shared Roasting", type: "article", locale: "ja_JP", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/* ── Notion Rich Text rendering ── */
interface RichText {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
}

function renderRichText(texts: RichText[]) {
  if (!texts) return null;
  return texts.map((t, i) => {
    let el: React.ReactNode = t.plain_text;
    const a = t.annotations;
    if (a?.bold) el = <strong>{el}</strong>;
    if (a?.italic) el = <em>{el}</em>;
    if (a?.strikethrough) el = <s>{el}</s>;
    if (a?.underline) el = <u>{el}</u>;
    if (a?.code)
      el = (
        <code key={i} className="bg-tsuchikabe/50 px-1.5 py-0.5 text-sm rounded">
          {el}
        </code>
      );
    if (t.href)
      el = (
        <a
          key={i}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold underline underline-offset-2 hover:text-gold/70 transition-colors"
        >
          {el}
        </a>
      );
    return <span key={i} className="whitespace-pre-wrap">{el}</span>;
  });
}

/* ── Block Renderer ── */
function NotionBlockRenderer({ block }: { block: NotionBlock }) {
  const type = block.type;

  switch (type) {
    case "paragraph":
      if (!block.paragraph.rich_text.length) return <div className="h-6" />;
      return (
        <p className="text-haicha leading-[2] tracking-wide">
          {renderRichText(block.paragraph.rich_text)}
        </p>
      );

    case "heading_1":
      return (
        <h2 className="font-serif text-2xl md:text-3xl text-konsumi tracking-wider font-light mt-8 mb-4">
          {renderRichText(block.heading_1.rich_text)}
        </h2>
      );

    case "heading_2":
      return (
        <h3 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mt-6 mb-3">
          {renderRichText(block.heading_2.rich_text)}
        </h3>
      );

    case "heading_3":
      return (
        <h4 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mt-4 mb-2">
          {renderRichText(block.heading_3.rich_text)}
        </h4>
      );

    case "bulleted_list_item":
      return (
        <li className="text-haicha leading-[2] tracking-wide list-disc ml-5">
          {renderRichText(block.bulleted_list_item.rich_text)}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-haicha leading-[2] tracking-wide list-decimal ml-5">
          {renderRichText(block.numbered_list_item.rich_text)}
        </li>
      );

    case "journal_list": {
      const { type, items } = block.journal_list as { type: string; items: { block: NotionBlock; lists: NotionBlock[] }[] };
      const List = type === "number" ? "ol" : "ul";
      return <List className={type === "number" ? "ml-5 list-decimal" : "ml-5 list-disc"}>
        {items.map(item => <li key={item.block.id}>
          <NotionBlockRenderer block={item.block} />
          {item.lists.map(list => <NotionBlockRenderer key={list.id} block={list} />)}
        </li>)}
      </List>;
    }

    case "journal_code":
      return <pre className="overflow-x-auto rounded bg-tsuchikabe/50 p-4 text-sm"><code>{block.journal_code}</code></pre>;

    case "quote":
      return (
        <blockquote className="border-l-2 border-gold/40 pl-6 py-2 my-4">
          <p className="text-haicha leading-[2] tracking-wide italic">
            {renderRichText(block.quote.rich_text)}
          </p>
        </blockquote>
      );

    case "divider":
      return <hr className="border-t border-usuzumi/20 my-8" />;

    case "image": {
      const caption = block.image.caption?.[0]?.plain_text || "";
      // external型の永続URLはそのまま、Notion file型はプロキシ経由
      let src: string;
      if (block.image.type === "external" && block.image.external?.url) {
        src = block.image.external.url;
      } else {
        // Notion file型の一時URLは期限切れするのでプロキシ経由
        src = `/api/notion-image/${block.id}`;
      }
      const image = (
        <div className="relative aspect-[16/9] rounded-sm overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={block.image.alt || caption || "記事画像"} className="object-cover w-full h-full absolute inset-0" loading="lazy" />
        </div>
      );
      return (
        <figure className="my-8">
          {block.image.link ? <a href={block.image.link} className="block" rel="noopener noreferrer">{image}</a> : image}
          {caption && (
            <figcaption className="text-xs text-haicha/60 mt-3 text-center">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "callout":
      return (
        <div className="bg-tsuchikabe/50 rounded-sm p-6 my-4">
          <p className="text-haicha leading-[2] tracking-wide">
            {block.callout.icon?.emoji && (
              <span className="mr-2">{block.callout.icon.emoji}</span>
            )}
            {renderRichText(block.callout.rich_text)}
          </p>
        </div>
      );

    case "bookmark":
      return (
        <a
          href={block.bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-usuzumi/20 rounded-sm p-4 my-4 text-sm text-gold hover:border-gold/40 transition-colors"
        >
          {block.bookmark.url}
        </a>
      );

    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { id } = await params;
  const article = await readJournalArticle(id);
  if (!article) notFound();
  const { post, blocks } = article;

  return (
    <>
      {/* Header */}
      <section className="pt-32 md:pt-40 pb-12 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs text-haicha/60 hover:text-gold tracking-wide transition-colors mb-10"
            >
              <span className="text-base">&larr;</span> ジャーナル一覧に戻る
            </Link>
            <div className="mb-6">
              <span className="text-xs border border-karekusa/30 text-karekusa px-2 py-1">
                {post.category}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-konsumi tracking-wider font-light leading-[1.6] mb-6">
              {post.title}
            </h1>
            <p className="text-sm text-haicha/60">{formatDate(post.date)}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <section className="pb-12 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <ScrollReveal>
              <div className="relative aspect-[16/9] rounded-sm overflow-hidden">
                <Image
                  src={post.coverImage}
                  unoptimized={isJournalCoverRoute(post.coverImage)}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                  priority
                />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="pb-24 md:pb-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <article className="space-y-4">
              {blocks.map((block) => (
                <NotionBlockRenderer key={block.id} block={block} />
              ))}
            </article>
          </ScrollReveal>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-usuzumi/20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-haicha hover:text-gold tracking-wide transition-colors"
            >
              <span className="text-lg">&larr;</span> ジャーナル一覧に戻る
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
