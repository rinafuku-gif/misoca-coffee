"use client";

import Image from "next/image";
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

const giftProduct = {
  id: "gift-roasting-experience",
  name: "焙煎体験ギフトチケット",
  origin: "",
  roast: "",
  flavor: "",
  price: 8800,
  unit: "1枚",
  image: "/images/experience/gallery-1.jpg",
  inStock: true,
  process: "",
  variety: "",
  region: "",
  farm: "",
  altitude: "",
  description: "",
};

export default function GiftTicketPage() {
  const [added, setAdded] = useState(false);

  const addToCart = useCallback(() => {
    let cart: CartItem[] = [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) cart = JSON.parse(stored);
    } catch { /* ignore */ }

    const existing = cart.find((item) => item.product.id === giftProduct.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ product: giftProduct, quantity: 1 });
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, []);

  // Reset scroll position
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
            {/* Image */}
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src="/images/experience/gallery-1.jpg"
                  alt="焙煎体験ギフトチケット"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </ScrollReveal>

            {/* Product Info */}
            <ScrollReveal direction="right" delay={0.15} className="w-full md:w-1/2">
              <p className="text-[10px] tracking-[0.5em] text-gold/70 font-light uppercase mb-3">
                Gift Ticket
              </p>
              <h1 className="font-serif text-2xl md:text-3xl text-konsumi tracking-wider font-light mb-4 leading-[1.5]">
                古民家で憧れの焙煎体験
              </h1>
              <p className="text-xs text-haicha/60 mb-6">電子チケット</p>

              <p className="text-4xl font-light text-gold mb-2">
                ¥8,800
                <span className="text-sm text-haicha ml-2">（税込）</span>
              </p>
              <p className="text-xs text-haicha/60 mb-8">
                ※別途発券手数料2%がかかります
              </p>

              <p className="text-sm text-haicha leading-[2] tracking-wide mb-8">
                三十日珈琲でのコーヒー焙煎体験のギフトチケットです。
                <br />
                父の日・記念日・誕生日・敬老の日・クリスマス、
                お祝いごとなどに日頃の感謝の気持ちを込めて贈っていただけると嬉しいです。
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

      {/* How to Gift */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              How to Gift
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              贈り方
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14" />
          </ScrollReveal>

          {/* For the Giver */}
          <ScrollReveal delay={0.15}>
            <div className="bg-white rounded-sm p-8 md:p-10 mb-8">
              <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                贈る方へ
              </h3>
              <p className="text-sm text-haicha leading-[2] tracking-wide mb-6">
                電子チケット購入後、下記の流れでお渡しする方へ送ってください。
              </p>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  <p className="text-sm text-haicha leading-[2] tracking-wide pt-0.5">
                    購入完了後、確認メールが届きます
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  <p className="text-sm text-haicha leading-[2] tracking-wide pt-0.5">
                    メールに記載のチケット情報を、LINEやメールで贈る方にお送りください
                  </p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  <p className="text-sm text-haicha leading-[2] tracking-wide pt-0.5">
                    贈られた方が三十日珈琲へ直接ご予約いただきます
                  </p>
                </li>
              </ol>
              <p className="text-xs text-haicha/60 mt-6">
                ※ 有効期限：ご購入日から6ヶ月後まで
              </p>
            </div>
          </ScrollReveal>

          {/* For the Receiver */}
          <ScrollReveal delay={0.25}>
            <div className="bg-white rounded-sm p-8 md:p-10">
              <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                贈られた方へ
              </h3>
              <p className="text-sm text-haicha leading-[2] tracking-wide mb-6">
                チケットを受け取ったら、LINE公式アカウントまたはInstagram DMからお問い合わせいただき、体験日時をご予約ください。
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://lin.ee/ihDBxM8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white px-5 py-3 text-xs tracking-[0.15em] transition-all duration-500"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  LINEで予約する
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Experience Content */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Experience
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              体験の流れ
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14" />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="space-y-6">
              {[
                { step: 1, title: "生豆の選定", desc: "好みや興味に合わせて、焙煎する生豆を一緒に選びます。" },
                { step: 2, title: "焙煎についてのレクチャー", desc: "コーヒー焙煎の基礎を、知識レベルに合わせてお伝えします。" },
                { step: 3, title: "焙煎 1回目（レクチャー付き）", desc: "焙煎機の操作方法を説明しながら、一緒に焙煎します。" },
                { step: 4, title: "焙煎 2回目（サポートあり）", desc: "2回目はご自身で焙煎。サポートしながら見守ります。" },
                { step: 5, title: "焙煎豆の試飲", desc: "焙煎したての豆をドリップして、味わいを確かめます。" },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full border border-gold/30 text-gold text-sm flex items-center justify-center font-light">
                    {item.step}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-haicha leading-[2] tracking-wide">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-haicha mt-8 leading-[2] tracking-wide">
              （1）〜（5）まで 約90分
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Included
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              含まれるもの
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14" />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "レッスン", desc: "焙煎機の使い方を含むレクチャー" },
                { title: "用具一式貸出", desc: "焙煎に必要な器具はすべてご用意" },
                { title: "生豆 約400g", desc: "焙煎した豆はすべてお持ち帰り（250g×2回焙煎）" },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-sm p-6 text-center">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-haicha leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="mt-10 bg-white rounded-sm p-8">
              <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-4">
                同伴について
              </h3>
              <ul className="space-y-3 text-sm text-haicha leading-[2] tracking-wide">
                <li className="flex items-start gap-3">
                  <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                  同伴者1名までは追加料金なし。贈り主の方もご一緒に体験いただけます。
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                  3名以上の場合は、1名追加につき +¥4,400 を頂戴いたします。
                </li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              Location
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              体験場所
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14" />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="bg-white rounded-sm p-8 md:p-10">
              <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                三十日珈琲
              </h3>
              <p className="text-sm text-haicha leading-[2] tracking-wide mb-6">
                山梨県上野原市松留939
              </p>
              <ul className="space-y-3 text-sm text-haicha leading-[2] tracking-wide mb-8">
                <li className="flex items-start gap-3">
                  <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                  東京から約1時間、JR中央線 上野原駅より徒歩30分
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                  駅までの無料送迎あり
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                  無料駐車場あり
                </li>
              </ul>
              <a
                href="https://maps.app.goo.gl/6vi6JLqVkv5AF26R6?g_st=ic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/70 tracking-wide transition-colors"
              >
                Google Mapで見る
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-konsumi py-20 md:py-24 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-xl md:text-2xl text-white tracking-wider font-light mb-6">
              大切な方に、焙煎体験を贈る
            </h2>
            <p className="text-white/60 text-sm leading-[2] tracking-wide mb-10">
              電子チケットだから、すぐに届けられます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                カートに入れる（¥8,800）
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
