"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Product } from "@/lib/notion";

interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "misoca-coffee-cart";
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 370;

const ROAST_FILTERS = ["全て", "浅煎り", "中煎り", "中深煎り", "深煎り"] as const;

const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "エチオピア イルガチェフェ",
    origin: "エチオピア🇪🇹",
    roast: "浅煎り",
    flavor: "フローラルな香りと柑橘系の明るい酸味",
    price: 1200,
    unit: "100g",
    image: "/images/menu/ethiopia.jpg",
    inStock: true,
    process: "Washed",
    variety: "",
    region: "イルガチェフェ",
    farm: "",
    altitude: "1,800-2,200m",
    description: "",
  },
  {
    id: "2",
    name: "グアテマラ アンティグア",
    origin: "グアテマラ🇬🇹",
    roast: "中煎り",
    flavor: "チョコレートのようなコクと甘み",
    price: 1100,
    unit: "100g",
    image: "/images/menu/guatemala.jpg",
    inStock: true,
    process: "Washed",
    variety: "",
    region: "アンティグア",
    farm: "",
    altitude: "1,500-1,700m",
    description: "",
  },
  {
    id: "3",
    name: "ブラジル セラード",
    origin: "ブラジル🇧🇷",
    roast: "中深煎り",
    flavor: "ナッツの甘みとクリーンな後味",
    price: 1000,
    unit: "100g",
    image: "/images/menu/brazil.jpg",
    inStock: true,
    process: "Natural",
    variety: "",
    region: "セラード",
    farm: "",
    altitude: "1,000-1,200m",
    description: "",
  },
];

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveCartToStorage(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore storage errors
  }
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [roastFilter, setRoastFilter] = useState<string>("全て");
  const [originFilter, setOriginFilter] = useState<string | null>(null);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = loadCartFromStorage();
    if (stored.length > 0) {
      setCart(stored);
    }
  }, []);

  // Save cart to localStorage on change (skip initial empty state)
  const [cartInitialized, setCartInitialized] = useState(false);
  useEffect(() => {
    if (!cartInitialized) {
      setCartInitialized(true);
      return;
    }
    saveCartToStorage(cart);
  }, [cart, cartInitialized]);

  // Fetch products from Notion
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Notionが未設定の場合はフォールバックを使用
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });

      // Show feedback
      setAddedFeedback(product.id);
      setTimeout(() => setAddedFeedback(null), 1200);
    },
    []
  );

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  // Get unique origins for filter tags
  const origins = Array.from(new Set(products.map((p) => p.origin))).filter(
    Boolean
  );

  // Filter products (roast is multi_select joined by "・", origin may have emoji flags)
  const filteredProducts = products.filter((product) => {
    if (roastFilter !== "全て" && !product.roast.includes(roastFilter)) return false;
    if (originFilter && product.origin !== originFilter) return false;
    return true;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            unit: item.product.unit,
          })),
        }),
      });
      const data = await res.json();
      if (data.url) {
        // Clear cart on successful checkout redirect
        localStorage.removeItem(CART_STORAGE_KEY);
        window.location.href = data.url;
      } else {
        alert(data.error || "エラーが発生しました");
      }
    } catch {
      alert("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="ONLINE SHOP"
        subtitle="焙煎したてをお届け"
        description="焙煎3日以内のスペシャルティコーヒーを、ご自宅へ。"
        image="/images/experience/roasting-hands.jpg"
      />

      {/* Freshness Promise */}
      <section className="bg-konsumi py-6 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/90 text-sm md:text-base tracking-wider">
            すべてスペシャルティグレード ／ 焙煎3日以内に発送 ／ 全国一律
            ¥370（¥5,000以上で送料無料）
          </p>
        </div>
      </section>

      {/* Bean Lineup */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-gold font-medium text-center mb-4">
              COFFEE BEANS
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              コーヒー豆
            </h2>
            <p className="text-haicha text-center leading-loose mb-4">
              焙煎体験でも使用しているスペシャルティコーヒーを、ご自宅でお楽しみいただけます。
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
          </ScrollReveal>

          {/* Roast Level Filter Tabs */}
          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {ROAST_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRoastFilter(filter)}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    roastFilter === filter
                      ? "bg-konsumi text-white shadow-md"
                      : "bg-white text-haicha hover:bg-tsuchikabe hover:text-konsumi border border-usuzumi/50"
                  }`}
                >
                  {filter}
                  {roastFilter === filter && (
                    <motion.div
                      layoutId="roastFilter"
                      className="absolute inset-0 bg-konsumi rounded-full -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Origin Filter Tags */}
          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap justify-center gap-2 mb-14 md:mb-16">
              {origins.map((origin) => (
                <button
                  key={origin}
                  onClick={() =>
                    setOriginFilter(originFilter === origin ? null : origin)
                  }
                  className={`px-3 py-1 rounded text-xs transition-all duration-300 ${
                    originFilter === origin
                      ? "bg-gold/20 text-gold border border-gold/40"
                      : "bg-transparent text-haicha border border-usuzumi/30 hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  {origin}
                </button>
              ))}
              {originFilter && (
                <button
                  onClick={() => setOriginFilter(null)}
                  className="px-3 py-1 rounded text-xs text-haicha hover:text-konsumi transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="text-center text-haicha py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full mx-auto mb-4"
              />
              商品を読み込み中...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-haicha py-20">
              <p className="text-lg mb-2">該当する商品がありません</p>
              <button
                onClick={() => {
                  setRoastFilter("全て");
                  setOriginFilter(null);
                }}
                className="text-gold hover:text-gold-dark text-sm underline"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Roast Badge */}
                        <span className="absolute top-4 left-4 bg-konsumi/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
                          {product.roast}
                        </span>

                        {/* SOLD OUT Overlay */}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white/95 text-konsumi px-6 py-2.5 rounded-full text-sm font-bold tracking-wider">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        {/* Origin Tag */}
                        <span className="inline-block text-xs text-gold bg-gold/10 px-2.5 py-0.5 rounded-full mb-3">
                          {product.origin}
                        </span>

                        <h3 className="font-serif text-lg font-bold text-konsumi mb-2 leading-snug">
                          {product.name}
                        </h3>

                        {product.flavor && (
                          <p className="text-sm text-haicha mb-3 leading-relaxed line-clamp-2">
                            {product.flavor}
                          </p>
                        )}

                        {/* Detail Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {product.process && (
                            <span className="text-[11px] text-haicha bg-tsuchikabe/60 px-2 py-0.5 rounded">
                              {product.process}
                            </span>
                          )}
                          {product.variety && (
                            <span className="text-[11px] text-haicha bg-tsuchikabe/60 px-2 py-0.5 rounded">
                              {product.variety}
                            </span>
                          )}
                        </div>

                        <div className="flex items-end justify-between">
                          <p className="font-bold text-karekusa text-xl">
                            ¥{product.price.toLocaleString()}
                            <span className="text-xs font-normal text-haicha ml-1">
                              / {product.unit}
                            </span>
                          </p>

                          {product.inStock && (
                            <motion.button
                              onClick={() => addToCart(product)}
                              whileTap={{ scale: 0.95 }}
                              className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                                addedFeedback === product.id
                                  ? "bg-success text-white"
                                  : "bg-karekusa hover:bg-konsumi text-white"
                              }`}
                            >
                              <AnimatePresence mode="wait">
                                {addedFeedback === product.id ? (
                                  <motion.span
                                    key="added"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-1"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    追加しました
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
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <ScrollReveal delay={0.4}>
            <p className="text-center text-sm text-haicha mt-16">
              ※
              豆の在庫状況により、取り扱い銘柄が変更になる場合があります。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Drip Bags */}
      <section className="bg-tsuchikabe py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/stand/stand-2.jpg"
                  alt="ドリップバッグ"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal
              direction="right"
              delay={0.2}
              className="w-full md:w-1/2"
            >
              <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                DRIP BAG
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-konsumi mb-8">
                ドリップバッグ
              </h2>
              <p className="text-haicha text-lg leading-loose mb-6">
                器具がなくても手軽に楽しめるドリップバッグ。
                贈り物やオフィスのお供にもおすすめです。
              </p>
              <p className="font-bold text-karekusa text-xl mb-10">
                ¥500〜
                <span className="text-sm font-normal text-haicha ml-1">
                  / 1杯
                </span>
              </p>
              <Link
                href="/contact"
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-300"
              >
                購入のお問い合わせ →
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              配送について
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-14 md:mb-16" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-white p-10 rounded-xl shadow-sm text-center h-full hover:shadow-md transition-shadow duration-300">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  SHIPPING
                </p>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                  送料
                </h3>
                <p className="text-haicha leading-loose">
                  全国一律 ¥370（ネコポス）
                  <br />
                  ¥5,000以上で送料無料
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <div className="bg-white p-10 rounded-xl shadow-sm text-center h-full hover:shadow-md transition-shadow duration-300">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  FRESHNESS
                </p>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                  鮮度
                </h3>
                <p className="text-haicha leading-loose">
                  ご注文後に焙煎
                  <br />
                  3日以内に発送します
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <div className="bg-white p-10 rounded-xl shadow-sm text-center h-full hover:shadow-md transition-shadow duration-300">
                <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
                  DELIVERY
                </p>
                <h3 className="font-serif text-lg font-bold text-konsumi mb-4">
                  お届け
                </h3>
                <p className="text-haicha leading-loose">
                  発送後1〜3日で到着
                  <br />
                  ポスト投函で受取不要
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Experience Bridge CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/experience/roasting-couple.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-sm tracking-[0.3em] text-white/60 mb-4">
              EXPERIENCE
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">
              この豆を、自分で焙煎してみませんか？
            </h2>
            <p className="text-lg text-white/80 leading-loose mb-10">
              オンラインショップの豆は、焙煎体験でも使用しています。
              <br />
              生豆から自分で焙煎する、特別な体験をどうぞ。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/experience"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded-lg text-lg font-medium transition-colors"
            >
              焙煎体験を予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Cart Floating Button (Mobile-optimized) */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-karekusa hover:bg-konsumi text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-colors"
          >
            <span className="sr-only">カート</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <motion.span
              key={cartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-gold text-white text-xs min-w-[22px] h-[22px] rounded-full flex items-center justify-center font-bold px-1"
            >
              {cartCount}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-kominka-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-usuzumi/30">
                <h3 className="font-serif text-xl font-bold text-konsumi">
                  カート（{cartCount}点）
                </h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-haicha hover:text-konsumi p-2 rounded-full hover:bg-tsuchikabe transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Shipping Progress Bar */}
              {cart.length > 0 && (
                <div className="px-6 py-4 bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-haicha">送料無料まで</span>
                    <span className="text-xs font-medium text-gold">
                      {subtotal >= FREE_SHIPPING_THRESHOLD
                        ? "送料無料!"
                        : `あと¥${remainingForFreeShipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-usuzumi/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  {subtotal >= FREE_SHIPPING_THRESHOLD && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-gold mt-1.5 font-medium"
                    >
                      送料無料が適用されます
                    </motion.p>
                  )}
                </div>
              )}

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <svg
                      className="w-12 h-12 text-usuzumi mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                      />
                    </svg>
                    <p className="text-haicha">カートは空です</p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-4 text-sm text-gold hover:text-gold-dark underline"
                    >
                      商品を見る
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <AnimatePresence>
                      {cart.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex gap-4 pb-5 border-b border-usuzumi/20"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-sm font-bold text-konsumi mb-0.5 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-haicha mb-1.5">
                              {item.product.unit}
                            </p>
                            <p className="font-bold text-karekusa text-sm">
                              ¥
                              {(
                                item.product.price * item.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, -1)
                              }
                              className="w-8 h-8 rounded-lg border border-usuzumi/30 text-sumi hover:bg-tsuchikabe flex items-center justify-center text-sm transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-konsumi">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, 1)
                              }
                              className="w-8 h-8 rounded-lg border border-usuzumi/30 text-sumi hover:bg-tsuchikabe flex items-center justify-center text-sm transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-usuzumi/20 bg-white/80 backdrop-blur-sm">
                  <div className="space-y-2 mb-5 text-sm">
                    <div className="flex justify-between text-haicha">
                      <span>小計</span>
                      <span>¥{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-haicha">
                      <span>
                        送料
                        {subtotal >= FREE_SHIPPING_THRESHOLD && (
                          <span className="text-gold ml-1 text-xs font-medium">
                            無料
                          </span>
                        )}
                      </span>
                      <span>
                        {shipping === 0
                          ? "¥0"
                          : `¥${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-konsumi text-lg pt-3 border-t border-usuzumi/30">
                      <span>合計</span>
                      <span>¥{total.toLocaleString()}</span>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-4 rounded-lg text-lg font-medium transition-colors shadow-md"
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        処理中...
                      </span>
                    ) : (
                      "ご購入手続きへ"
                    )}
                  </motion.button>
                  <p className="text-xs text-haicha text-center mt-3">
                    Stripeの安全な決済画面に移動します
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
