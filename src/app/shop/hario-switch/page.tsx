"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

const CART_STORAGE_KEY = "misoca-coffee-cart";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
    [key: string]: unknown;
  };
  quantity: number;
}

const harioProduct = {
  id: "hario-switch-360",
  name: "HARIO 浸漬式ドリッパー スイッチ360",
  origin: "",
  roast: "",
  flavor: "",
  price: 4400,
  unit: "1個",
  image: "",
  inStock: true,
  process: "",
  variety: "",
  region: "",
  farm: "",
  altitude: "",
  description: "",
};

export default function HarioSwitchPage() {
  const [added, setAdded] = useState(false);

  const addToCart = useCallback(() => {
    let cart: CartItem[] = [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) cart = JSON.parse(stored);
    } catch { /* ignore */ }

    const existing = cart.find((item) => item.product.id === harioProduct.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ product: harioProduct, quantity: 1 });
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs text-haicha/60 hover:text-gold tracking-wide transition-colors mb-10"
            >
              <span className="text-base">&larr;</span> ショップに戻る
            </Link>
          </ScrollReveal>

          <div className="flex flex-col md:flex-row gap-10 md:gap-14">
            {/* Product Visual */}
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="aspect-square bg-tsuchikabe rounded-sm flex items-center justify-center">
                <div className="text-center">
                  <p className="text-7xl text-karekusa/20 font-serif mb-3">HARIO</p>
                  <p className="text-lg text-haicha/40 tracking-widest">Switch 360</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Product Info */}
            <ScrollReveal direction="right" delay={0.15} className="w-full md:w-1/2">
              <p className="text-[10px] tracking-[0.5em] text-gold/70 font-light uppercase mb-3">
                Equipment
              </p>
              <h1 className="font-serif text-2xl md:text-3xl text-konsumi tracking-wider font-light mb-2 leading-[1.5]">
                HARIO 浸漬式ドリッパー
                <br />
                スイッチ360
              </h1>
              <p className="text-xs text-haicha/60 mb-6">SSD-360-B / 焙煎士おすすめ</p>

              <p className="text-4xl font-light text-gold mb-8">
                ¥4,400
                <span className="text-sm text-haicha ml-2">（税込）</span>
              </p>

              <p className="text-sm text-haicha leading-[2] tracking-wide mb-8">
                お湯を注いでスイッチを押すだけ。浸漬式だから、
                テクニックに関係なく誰でも均一でおいしいコーヒーが淹れられます。
                三十日珈琲オリジナルの抽出レシピカード付き。
              </p>

              {/* Add to Cart */}
              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-4 text-sm tracking-[0.15em] transition-all duration-500 mb-4 ${
                  added
                    ? "bg-konsumi text-white"
                    : "bg-gold/90 hover:bg-gold text-white"
                }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                      カートに追加しました
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      カートに入れる
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link
                href="/shop"
                className="block text-center text-xs text-haicha/60 hover:text-gold tracking-wide transition-colors"
              >
                お買い物を続ける
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Why We Recommend */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Why We Recommend
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              焙煎士がおすすめする理由
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14" />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="space-y-8">
              {[
                {
                  title: "誰でも安定した味が出せる",
                  desc: "浸漬式（しんしき）は、お湯にコーヒー粉を浸して抽出する方式。注ぎ方のテクニックが不要で、毎回同じ味を再現できます。",
                },
                {
                  title: "スイッチひとつの簡単操作",
                  desc: "お湯を注いだら待つだけ。スイッチを押せばドリップが始まります。忙しい朝でも、手軽においしい一杯を。",
                },
                {
                  title: "焙煎したての豆の味がストレートに出る",
                  desc: "浸漬式は豆の個性がダイレクトに出るので、スペシャルティコーヒーの風味を余すことなく楽しめます。三十日珈琲の豆との相性は抜群です。",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-sm p-8">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-haicha leading-[2] tracking-wide">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Specs */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Specifications
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              商品スペック
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14" />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white rounded-sm overflow-hidden">
              {[
                { label: "商品名", value: "HARIO 浸漬式ドリッパー スイッチ360" },
                { label: "型番", value: "SSD-360-B" },
                { label: "カラー", value: "ブラック" },
                { label: "出来上がり量", value: "360ml（1〜2杯分）" },
                { label: "素材", value: "耐熱ガラス（日本製）" },
                { label: "付属品", value: "ペーパーフィルター40枚" },
                { label: "特典", value: "三十日珈琲オリジナル抽出レシピカード" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col sm:flex-row gap-2 px-8 py-4 ${
                    i % 2 === 0 ? "bg-white" : "bg-tsuchikabe/30"
                  }`}
                >
                  <span className="text-sm text-haicha/60 tracking-wide sm:w-40 flex-shrink-0">
                    {item.label}
                  </span>
                  <span className="text-sm text-konsumi tracking-wide">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Original Recipe */}
      <section className="bg-konsumi py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              Bonus
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-white tracking-wider font-light mb-6">
              オリジナルレシピ付き
            </h2>
            <p className="text-white/60 text-sm leading-[2] tracking-wide mb-10 max-w-xl mx-auto">
              三十日珈琲の焙煎士が試行錯誤して辿り着いた、
              スイッチ360専用の抽出レシピをお付けします。
              お湯の温度、粉の量、浸漬時間──
              このレシピ通りに淹れれば、お店の味をご自宅で再現できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                カートに入れる（¥4,400）
              </motion.button>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white/80 hover:text-white hover:border-white/50 px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                ショップに戻る
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
