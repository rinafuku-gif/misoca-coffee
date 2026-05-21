"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";

// --- 製法ステップ ---
const processSteps = [
  "上野原のゆずを、皮や果肉ごと液状にします",
  "その液に、コーヒーの生豆をじっくり漬け込みます",
  "香りが移った豆を、再び乾燥させます",
  "焙煎所で、ていねいに焙煎します",
  "ハンドドリップでも、ドリップバッグでも楽しめる仕上がりに",
];

// --- 商品ラインナップ ---
const products = [
  {
    id: "drip-1",
    name: "ドリップバッグ 1袋",
    sub: "1杯分（10g）",
    price: "250円（税込）",
    note: "お試しに。日常に。気軽な一杯を。",
    available: true,
  },
  {
    id: "drip-3",
    name: "ドリップバッグ 3個セット",
    sub: "",
    price: "準備中",
    note: "プチギフトに。",
    available: false,
  },
  {
    id: "bean-100",
    name: "焙煎豆 100g",
    sub: "",
    price: "1,000円（税込）",
    note: "ハンドドリップやエアロプレスで、お好みの抽出方法で。",
    available: true,
  },
  {
    id: "gift-box",
    name: "ギフト箱",
    sub: "",
    price: "準備中",
    note: "ドリップバッグまとめ買い・ギフト向け。",
    available: false,
  },
];

// --- FAQ ---
const faqs = [
  {
    q: "インフューズドコーヒーは、香料が入っていますか？",
    a: "入っていません。生豆を実際のゆずに漬け込んで、自然に香りを移しています。",
  },
  {
    q: "ゆずの量はどれくらい入っていますか？",
    a: "仕入れロットによって調整しますが、上野原の規格外ゆずを贅沢に使用しています。",
  },
  {
    q: "ホットでもアイスでも楽しめますか？",
    a: "はい。ホットで香りを楽しむのもおすすめですし、アイスでも爽やかな後味になります。",
  },
  {
    q: "ミルクや砂糖は合いますか？",
    a: "シロップ系を使っていないので、ミルクや砂糖を加えても香りは消えません。お好みでどうぞ。",
  },
  {
    q: "焙煎日はいつですか？",
    a: "パッケージ裏面に焙煎日を記載しています。焙煎から約30日が一番おいしくお召し上がりいただける期間です。",
  },
  {
    q: "ゆず以外のフレーバーはありますか？",
    a: "現在は上野原ゆずのみですが、今後ブルーベリーなど他の地域素材でのインフューズドコーヒーも準備中です。",
  },
];

// --- 矢印アイコン ---
function ArrowRight({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function UenoharaYuzuPage() {
  return (
    <>
      {/* ========================================================
          [1] ヒーローセクション
      ======================================================== */}
      <PageHero
        title="Uenohara Yuzu"
        subtitle="地域に「すでにある良さ」に、もう一度光をあてる。"
        description="山梨県上野原市の規格外ゆずから生まれた、もう一つのコーヒー。"
        // TODO: 上野原ゆず専用画像に差し替え（農家さんのゆず写真 or 古民家焙煎所）
        image="/images/about/scenery-1.jpg"
      />

      {/* ヒーロー下 CTA */}
      <section className="bg-konsumi py-10 md:py-12 overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
          <p className="text-white/65 text-sm md:text-[15px] leading-[2.2] tracking-wide mb-8">
            袋を開いた瞬間、ふわりと立ちのぼるゆずの香り。
            <br className="hidden md:inline" />
            紅茶のような気持ちで、いつもより少しゆっくり。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 bg-gold/90 hover:bg-gold text-white text-xs tracking-[0.15em] px-8 py-4 transition-all duration-300 min-h-[44px]"
            >
              ECで購入する
              <ArrowRight />
            </Link>
            {/* ふるさと納税（準備中）— disabled */}
            <span
              aria-disabled="true"
              className="inline-flex items-center justify-center gap-3 border border-white/20 text-white/40 text-xs tracking-[0.15em] px-8 py-4 cursor-not-allowed min-h-[44px]"
            >
              ふるさと納税で応援する（準備中）
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          [2] 一杯の味わい
      ======================================================== */}
      <section className="bg-kominka-white py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-14 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* TODO: 上野原ゆず専用画像に差し替え（コーヒーを淹れるスローモーション・湯気） */}
                <Image
                  src="/images/experience/coffee-meter.jpg"
                  alt="袋から立ちのぼる湯気のイメージ"
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                Taste
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8 leading-[1.6]">
                ふわりと立ちのぼる、ゆずの気配。
              </h2>
              <div className="w-8 h-px bg-gold/40 mb-8" />
              <div className="text-sumi text-sm md:text-[15px] leading-[2.2] tracking-wide space-y-5">
                <p>
                  袋を開けた瞬間、ふわっと届くゆずの香り。
                  口にふくむと、コーヒー本来のコクのあとに、
                  穏やかな酸味と香りがやさしく続きます。
                </p>
                <p>
                  苦さで目を覚ますコーヒーではなく、
                  紅茶のように、ゆっくりと味わうコーヒー。
                </p>
                <p>
                  朝の光のなかでも、夜のひと息にも、
                  すっと馴染んでくれる一杯です。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          [3] インフューズドコーヒーとは
      ======================================================== */}
      <section className="bg-tsuchikabe py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                Infused Coffee
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                インフューズドコーヒー、ってなんだろう。
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="max-w-2xl mx-auto space-y-6 text-sumi text-sm md:text-[15px] leading-[2.2] tracking-wide">
              <p>
                コーヒーの生豆を、フルーツやハーブ、お酒などに漬け込み、
                その風味を直接、豆に染み込ませてから焙煎する手法のことです。
              </p>
              <p>
                シロップや香料を後から加えるのではなく、
                コーヒー豆そのものに、ゆずの香りが寄り添っている。
                だから、自然で、すこやかで、
                何度でも飲みたくなる味になります。
              </p>
              <p className="text-haicha">
                「フレーバーコーヒー」とも、「ブレンド」とも違う、
                これは、もう一つの新しいコーヒーのかたち。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          [4] 上野原のゆずの物語
      ======================================================== */}
      <section className="bg-kominka-white py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-14 md:gap-20 items-center">
            <ScrollReveal direction="right" className="w-full md:w-1/2">
              <div className="relative aspect-[3/2] overflow-hidden">
                {/* TODO: 上野原ゆず専用画像に差し替え（農家さん・規格外ゆずのアップ・上野原の風景） */}
                <Image
                  src="/images/about/river-landscape.jpg"
                  alt="上野原の風景と規格外ゆずのイメージ"
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                Story
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8 leading-[1.6]">
                上野原のゆず。
              </h2>
              <div className="w-8 h-px bg-gold/40 mb-8" />
              <div className="text-sumi text-sm md:text-[15px] leading-[2.2] tracking-wide space-y-5">
                <p>
                  焙煎所のある山梨県上野原市は、ゆずがたくさん育つ土地です。
                  けれど、傷があったり、見た目が出荷の基準に
                  ちょっと届かなかったり——
                  味は何ひとつ変わらないのに、市場には出ていけない
                  ゆずがたくさんあります。
                </p>
                <p>
                  中には、収穫されないまま落ち、
                  誰にも食べられないものもあります。
                </p>
                <p>
                  「もったいない」を、おいしく解決できないか。
                  そう思って、農家さんから譲っていただいたゆずで、
                  コーヒーをつくることにしました。
                </p>
                <p className="text-haicha">
                  形のいびつなゆずも、少し色が変わったゆずも、
                  コーヒーになれば、見た目はもう関係ない。
                  ただ、その豊かな香りだけが、
                  一杯のなかにしっかりと残ってくれます。
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          [5] 製法の話
      ======================================================== */}
      <section className="bg-tsuchikabe py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                Process
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-3">
                コーヒーは、世界からやってくる。
              </h2>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                ゆずは、足元から。
              </h2>
            </div>
          </ScrollReveal>

          <div className="flex flex-col md:flex-row gap-14 md:gap-16 items-start">
            <ScrollReveal direction="left" delay={0.1} className="w-full md:w-1/2">
              <div className="text-sumi text-sm md:text-[15px] leading-[2.2] tracking-wide space-y-5">
                <p>
                  コーヒー豆は、海外から届きます。
                  だからこそ、地域の中で「ここにしかない味」を作るのは、
                  本当は簡単ではありません。
                </p>
                <p>
                  ケニア産のコーヒー豆を、上野原のゆずに漬ける。
                  それは、世界と地域が、
                  ひとつのカップで出会う瞬間でもあります。
                </p>
                <p className="text-haicha text-sm">
                  シロップを使っていないので、ミルクや砂糖を加えても
                  ゆずの香りが消えない、不思議な仕上がりです。
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="space-y-0">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      duration: 1.0,
                      delay: i * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex gap-5 py-5 border-b border-usuzumi/30 last:border-b-0"
                  >
                    <span className="text-[11px] tracking-[0.2em] text-gold font-[family-name:var(--font-display)] w-6 flex-shrink-0 pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sumi text-sm md:text-[15px] leading-[2] tracking-wide">
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* 製法画像エリア */}
          <ScrollReveal delay={0.3}>
            <div className="mt-16 md:mt-20 grid grid-cols-3 gap-3 md:gap-5">
              {/* TODO: 上野原ゆず専用画像に差し替え（生豆漬け込み・乾燥工程・焙煎機） */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/experience/bean-selection.jpg"
                  alt="コーヒー生豆を選別するイメージ"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/experience/bean-sorting.jpg"
                  alt="生豆をゆずに漬け込む工程のイメージ"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/experience/roaster-machine.jpg"
                  alt="Aillio Bullet R1 V2 焙煎機"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          [6] こんな時間に
      ======================================================== */}
      <section className="relative py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="absolute inset-0">
          {/* TODO: 上野原ゆず専用画像に差し替え（朝の光・本とカップ・友人と話す穏やかなシーン） */}
          <Image
            src="/images/experience/gallery-2.jpg"
            alt="穏やかな時間とコーヒーのイメージ"
            fill
            className="object-cover scale-110"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/40 to-black/20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/80 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
              Moments
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-white tracking-wider font-light mb-8 leading-[1.6]">
              特別な日のためのコーヒーではなく、
              <br className="hidden md:inline" />
              いつもの日を、少しだけ特別にしてくれる一杯。
            </h2>
            <div className="w-8 h-px bg-gold/50 mb-10" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                label: "Morning",
                text: "朝、窓を開けて深呼吸する瞬間に。",
              },
              {
                label: "Afternoon",
                text: "昼下がり、本を読み始めるときに。",
              },
              {
                label: "Evening",
                text: "夜、家族や友人と、ゆっくり話し込むときに。",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.label} direction="up" delay={i * 0.1}>
                <div className="border border-white/20 px-6 py-7">
                  <p className="text-[10px] tracking-[0.35em] text-gold/80 uppercase mb-4 font-[family-name:var(--font-display)]">
                    {item.label}
                  </p>
                  <p className="text-white/85 text-sm leading-[2.2] tracking-wide">
                    {item.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-white/65 text-sm md:text-[15px] leading-[2.2] tracking-wide mt-10">
              紅茶のように、ふわっと香りを楽しむ。
              <br />
              そんな飲み方が、このコーヒーには似合います。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          [7] 三十日珈琲について
      ======================================================== */}
      <section className="bg-kominka-white py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-14 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* TODO: 上野原ゆず専用画像に差し替え（古民家・長屋門の外観） */}
                <Image
                  src="/images/about/kominka.jpg"
                  alt="築300年の古民家・長屋門"
                  fill
                  className="object-cover hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                About
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8 leading-[1.6]">
                古くて新しい、みんなの焙煎所。
              </h2>
              <div className="w-8 h-px bg-gold/40 mb-8" />
              <div className="text-sumi text-sm md:text-[15px] leading-[2.2] tracking-wide space-y-5">
                <p>
                  築300年の古民家、長屋門の一室で焙煎をしています。
                  2023年11月11日、温泉でひらめいた
                  「焙煎から約30日が一番おいしい」という気づきから、
                  三十日珈琲は始まりました。
                </p>
                <p>
                  最新のテクノロジーと、古い建物の温かみ。
                  焙煎機をシェアして、誰もが珈琲とつながれる場所。
                </p>
                <p className="text-haicha">
                  地域の人と、訪れてくれる人。
                  そのあいだを、一杯のコーヒーがつなぐ。
                  そんな焙煎所を、これからも続けていきます。
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500 min-h-[44px]"
                >
                  三十日珈琲を詳しく見る
                  <ArrowRight />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================
          [8] 商品ラインナップ＆購入導線
      ======================================================== */}
      <section className="bg-tsuchikabe py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                Lineup
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                ラインナップ
              </h2>
            </div>
          </ScrollReveal>

          {/* 商品カード */}
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 mb-16 md:mb-20">
            {products.map((product, i) => (
              <ScrollReveal key={product.id} direction="up" delay={i * 0.1}>
                <div
                  className={`border px-7 py-8 ${
                    product.available
                      ? "border-karekusa/20 bg-kominka-white"
                      : "border-usuzumi/30 bg-kominka-white/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light leading-snug">
                      {product.name}
                    </h3>
                    {!product.available && (
                      <span className="text-[10px] tracking-[0.2em] text-haicha/60 border border-usuzumi/30 px-2 py-1 flex-shrink-0 whitespace-nowrap">
                        準備中
                      </span>
                    )}
                  </div>
                  {product.sub && (
                    <p className="text-[11px] tracking-[0.1em] text-haicha mb-2">
                      {product.sub}
                    </p>
                  )}
                  <p className="text-karekusa text-base tracking-wider font-light mb-3">
                    {product.price}
                  </p>
                  <p className="text-haicha text-sm leading-[1.9] tracking-wide">
                    {product.note}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* 購入導線 */}
          <ScrollReveal delay={0.2}>
            <div className="border-t border-usuzumi/30 pt-12 md:pt-14 space-y-4">
              {/* 自社EC */}
              <Link
                href="/shop"
                className="flex items-center justify-between gap-4 w-full border border-karekusa/30 text-karekusa bg-kominka-white px-7 py-4 hover:bg-karekusa hover:text-white transition-all duration-500 min-h-[56px] group"
              >
                <span className="text-sm tracking-[0.1em]">
                  自社オンラインストアで購入する
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              {/* ふるさと納税（準備中）*/}
              <div
                aria-disabled="true"
                className="flex items-center justify-between gap-4 w-full border border-usuzumi/30 text-haicha/50 bg-kominka-white/60 px-7 py-4 cursor-not-allowed min-h-[56px]"
              >
                <span className="text-sm tracking-[0.1em]">
                  ふるさと納税で応援する
                </span>
                <span className="text-[10px] tracking-[0.2em] border border-usuzumi/30 px-2 py-1">
                  準備中
                </span>
              </div>

              {/* 取扱店舗（準備中）*/}
              <div
                aria-disabled="true"
                className="flex items-center justify-between gap-4 w-full border border-usuzumi/30 text-haicha/50 bg-kominka-white/60 px-7 py-4 cursor-not-allowed min-h-[56px]"
              >
                <span className="text-sm tracking-[0.1em]">
                  取扱店舗を見る
                </span>
                <span className="text-[10px] tracking-[0.2em] border border-usuzumi/30 px-2 py-1">
                  準備中
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================
          [9] よくある質問
      ======================================================== */}
      <section className="bg-kominka-white py-20 md:py-36 lg:py-52 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-14 md:mb-20">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
                FAQ
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                よくある質問
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="border-b border-usuzumi/30 py-8">
                  <p className="text-sumi text-sm md:text-[15px] font-medium tracking-wide mb-4 leading-[1.8]">
                    <span className="text-gold mr-3 font-[family-name:var(--font-display)] text-[11px] tracking-[0.2em]">
                      Q
                    </span>
                    {faq.q}
                  </p>
                  <p className="text-haicha text-sm md:text-[15px] leading-[2.2] tracking-wide pl-6">
                    {faq.a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          エンディング CTA（フッター手前）
      ======================================================== */}
      <section className="bg-konsumi py-20 md:py-28 overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase font-[family-name:var(--font-display)]">
              Uenohara Yuzu Coffee
            </p>
            <div className="w-8 h-px bg-gold/40 mx-auto mb-8" />
            <p className="text-white/80 text-sm md:text-[15px] leading-[2.4] tracking-wide mb-10">
              上野原のゆずと、世界のコーヒー豆が出会う一杯。
              <br className="hidden md:inline" />
              一度、手に取ってみてください。
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-3 bg-gold/90 hover:bg-gold text-white text-xs tracking-[0.15em] px-10 py-4 transition-all duration-300 min-h-[44px]"
            >
              オンラインストアで購入する
              <ArrowRight />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
