import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { siteOrigin, structuredDataJson } from "@/shared/seo/site-entities";
import { PickupGuideText } from "@/features/shop/components/PickupGuideText";
import { shopItemHref } from "@/features/shop/shop-item-link";
import {
  aboutCopy, enjoyCopy, faqItems, heroCopy, processCopy, tasteCopy, yuzuPagePhotos, yuzuProducts,
} from "./yuzu-lp-content";
import { YuzuCatalogProvider, YuzuPrice } from "./yuzu-catalog";

// 売るのは、ゆずインフューズドコーヒーのドリップバッグと焙煎豆300gの2つ。
// 最初の画面 → 味 → 作り方 → 飲み方 → もう一度買う → よくある質問 → 最後に小さく三十日珈琲について。

const pageUrl = `${siteOrigin}/shop/uenohara-yuzu`;

// 金の地に墨の文字（購入画面の主ボタンと同じ組み合わせ。白文字はコントラストが足りない）。
const buyButton =
  "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 sm:gap-3 border border-gold bg-gold px-5 sm:px-7 py-3 text-base font-medium tracking-wide text-sumi transition-colors duration-300 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
// 英字の節ラベルはサイト共通の飾り（読む文ではない）。読み上げからは外す。
const label = "font-[family-name:var(--font-display)] text-[11px] tracking-[0.5em] uppercase font-light";
const h2 = "font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light leading-[1.7] text-balance";
const body = "text-base text-sumi leading-[2] tracking-wide";

function ArrowRight() {
  return (
    <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** 2つの商品（ドリップバッグ・焙煎豆300g）から選んで買う枠。最初の画面ともう一度買う所で同じものを出す。
 * 値段はショップと同じ商品一覧から読む（YuzuPrice）。ボタンはショップのその商品の欄へ直接送る。 */
function BuyBox() {
  return (
    <div className="border border-white/25 px-5 py-5 md:px-7 md:py-6">
      <ul aria-label="選べる商品" className="-mt-4 divide-y divide-white/20">
        {yuzuProducts.map(product => (
          <li key={product.key} className="py-5">
            <p className="font-serif text-lg md:text-xl text-white tracking-wider font-light">
              {product.title[0]}<span className="inline-block">{product.title[1]}</span>
            </p>
            <p className="mt-1 text-base text-white/80 leading-[1.8] tracking-wide">
              {product.detail}{product.note ? <span className="block">{product.note}</span> : null}
            </p>
            {/* 値段とボタンは横に並べる。スマホのボタンは「買う」だけ見せる（読み上げは「〜を買う」） */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="flex flex-wrap items-baseline gap-x-2 text-white">
                <YuzuPrice product={product.ref} fallbackPrice={product.fallbackPrice} tax={heroCopy.tax} />
              </p>
              <Link href={shopItemHref(product.ref)} aria-label={product.buy} className={buyButton}>
                <span aria-hidden="true" className="sm:hidden">買う</span>
                <span aria-hidden="true" className="hidden sm:inline">{product.buy}</span>
                <ArrowRight />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-base text-white/80 leading-[1.9] tracking-wide">{heroCopy.where}</p>
      <p className="mt-1 text-base text-white/80 leading-[1.9] tracking-wide">{heroCopy.shipping}</p>
    </div>
  );
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    // 値段は書いてある値（fallbackPrice）。画面の値段はショップの商品一覧から読む
    ...yuzuProducts.map(product => ({
      "@type": "Product",
      name: product.shopName,
      description: `${product.title.join("")}。${product.detail}。${tasteCopy.body[1]}`,
      ...(product.key === "drip" ? { image: `${siteOrigin}${yuzuPagePhotos.cardFront.src}` } : {}),
      brand: { "@id": `${siteOrigin}/#organization` },
      offers: { "@type": "Offer", price: String(product.fallbackPrice), priceCurrency: "JPY", url: `${siteOrigin}${shopItemHref(product.ref)}` },
      url: pageUrl,
    })),
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};

export default function UenoharaYuzuPage() {
  return (
    // 日本語を文節で折り返す（対応しないブラウザでは今までどおりの折り返し）
    <YuzuCatalogProvider>
    <div className="[word-break:auto-phrase]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson(structuredData) }} />

      {/* [1] 最初の画面：何が・いくらで・どう買えるか */}
      <section aria-labelledby="yuzu-title" className="bg-konsumi pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-8 grid gap-12 md:grid-cols-2 md:gap-16 md:items-center">
          <div>
            <p aria-hidden="true" className={`${label} text-gold mb-5`}>Uenohara Yuzu Infused</p>
            <div aria-hidden="true" className="w-10 h-px bg-gold mb-6" />
            <h1 id="yuzu-title" className="font-serif text-2xl md:text-4xl text-white tracking-wider font-light leading-[1.5] mb-5">
              {heroCopy.title}
            </h1>
            <p className="text-base text-white/85 leading-[2] tracking-wide mb-8">{heroCopy.lead}</p>
            <BuyBox />
          </div>
          {/* ドリップバッグに付いているカードの表と裏（実際に印刷したもの） */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[{ card: yuzuPagePhotos.cardFront, caption: "ドリップバッグのカード（表）" }, { card: yuzuPagePhotos.cardBack, caption: "ドリップバッグのカード（裏）" }].map(({ card, caption }) => (
              <figure key={card.src}>
                <Image src={card.src} alt={card.alt} width={card.width} height={card.height} priority
                  className="w-full h-auto" sizes="(max-width: 768px) 45vw, (max-width: 1152px) 25vw, 270px" />
                <figcaption className="mt-3 text-base text-white/75 tracking-wide text-center">{caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* [2] どんな味・何がうれしいか */}
      <section aria-labelledby="yuzu-taste" className="bg-kominka-white py-24 md:py-36 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <p aria-hidden="true" className={`${label} text-gold/80 mb-6`}>Taste</p>
            <h2 id="yuzu-taste" className={`${h2} mb-8`}>{tasteCopy.heading}</h2>
            <div className={`${body} space-y-5`}>
              {tasteCopy.body.map(text => <p key={text}>{text}</p>)}
            </div>
          </ScrollReveal>
          <ul className="mt-14 border-t border-usuzumi">
            {tasteCopy.points.map((point, i) => (
              <li key={point.title} className="border-b border-usuzumi">
                <ScrollReveal delay={i * 0.08} className="flex gap-5 py-7">
                  <span aria-hidden="true" className="mt-[0.9em] h-px w-6 shrink-0 bg-gold" />
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-2">{point.title}</h3>
                    <p className={body}>{point.body}</p>
                  </div>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* [3] どう作っているか（事実だけ） */}
      <section aria-labelledby="yuzu-process" className="bg-tsuchikabe py-24 md:py-36 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <ScrollReveal className="max-w-3xl">
            <p aria-hidden="true" className={`${label} text-karekusa mb-6`}>How It&apos;s Made</p>
            <h2 id="yuzu-process" className={`${h2} mb-8`}>{processCopy.heading}</h2>
            <p className={body}>{processCopy.intro}</p>
          </ScrollReveal>
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16 md:items-start">
            <ScrollReveal>
              <ol className="border-t border-usuzumi">
                {processCopy.steps.map((step, i) => (
                  <li key={step} className="flex gap-5 py-5 border-b border-usuzumi">
                    <span aria-hidden="true" className="font-[family-name:var(--font-display)] text-base text-karekusa w-7 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={body}>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 border-l-2 border-gold pl-5 text-base text-karekusa leading-[2] tracking-wide">{processCopy.definition}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={yuzuPagePhotos.beans.src} alt={yuzuPagePhotos.beans.alt} fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* [4] 飲み方 */}
      <section aria-labelledby="yuzu-enjoy" className="bg-kominka-white py-24 md:py-36 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <p aria-hidden="true" className={`${label} text-gold/80 mb-6`}>How to Enjoy</p>
            <h2 id="yuzu-enjoy" className={`${h2} mb-10`}>{enjoyCopy.heading}</h2>
          </ScrollReveal>
          {/* 淹れ方（カードの裏面の言葉どおり）と、お湯を注ぐ写真 */}
          <div className="mb-14 grid gap-8 sm:grid-cols-2 sm:items-center">
            <ScrollReveal>
              <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">{enjoyCopy.brew.title}</h3>
              <dl className="border-t border-usuzumi">
                {enjoyCopy.brew.steps.map(step => (
                  <div key={step.term} className="flex items-baseline justify-between gap-4 border-b border-usuzumi py-3">
                    <dt className={body}>{step.term}</dt>
                    <dd className="font-serif text-xl text-konsumi tracking-wider">{step.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-base text-karekusa tracking-wide">{enjoyCopy.brew.note}</p>
              <p className="mt-3 text-base text-karekusa tracking-wide">{enjoyCopy.beans}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={yuzuPagePhotos.pour.src} alt={yuzuPagePhotos.pour.alt} fill
                  className="object-cover object-[70%_50%]" sizes="(max-width: 640px) 100vw, 384px" />
              </div>
            </ScrollReveal>
          </div>
          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {enjoyCopy.items.map((item, i) => (
              <ScrollReveal key={item.label} delay={(i % 2) * 0.1}>
                <dt className="font-serif text-lg text-konsumi tracking-wider font-light mb-3 pb-3 border-b border-gold/40">{item.label}</dt>
                <dd className={body}>{item.body}</dd>
              </ScrollReveal>
            ))}
          </dl>
        </div>
      </section>

      {/* [5] もう一度、買うボタン */}
      <section aria-labelledby="yuzu-buy-again" className="bg-konsumi py-20 md:py-28 overflow-hidden">
        <div className="max-w-xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <h2 id="yuzu-buy-again" className="font-serif text-xl md:text-2xl text-white tracking-wider font-light leading-[1.7] mb-8 text-center text-balance">
              {heroCopy.choose}
            </h2>
            <BuyBox />
          </ScrollReveal>
        </div>
      </section>

      {/* [6] よくある質問（サイトのほかの所に書いてある事実だけ） */}
      <section aria-labelledby="yuzu-faq" className="bg-kominka-white py-24 md:py-36 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <p aria-hidden="true" className={`${label} text-gold/80 mb-6`}>FAQ</p>
          <h2 id="yuzu-faq" className={`${h2} mb-10`}>よくある質問</h2>
          <div className="border-t border-usuzumi">
            {faqItems.map(item => (
              <details key={item.q} className="group border-b border-usuzumi">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base text-sumi tracking-wide [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span aria-hidden="true" className="text-xl text-karekusa transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                {/* 店頭受け取りの答えの「Instagram」は、購入画面・特商法の表記と同じくリンクにする */}
                <p className={`${body} pb-6`}><PickupGuideText text={item.a} /></p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* [7] 最後に小さく、三十日珈琲について */}
      <section aria-labelledby="yuzu-about" className="bg-tsuchikabe py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <h2 id="yuzu-about" className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">三十日珈琲 Shared Roasting</h2>
          <p className={body}>{aboutCopy.body}</p>
          <Link href={aboutCopy.href} className="mt-3 inline-flex min-h-12 items-center gap-2 text-base text-karekusa underline decoration-usuzumi underline-offset-4 hover:decoration-karekusa">
            {aboutCopy.link}
            <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
    </YuzuCatalogProvider>
  );
}
