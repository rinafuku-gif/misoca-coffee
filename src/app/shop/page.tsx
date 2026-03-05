"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Product } from "@/lib/notion";

interface CartItem {
  product: Product;
  quantity: number;
}

const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "エチオピア イルガチェフェ",
    origin: "エチオピア",
    roast: "浅煎り",
    flavor: "フローラルな香りと柑橘系の明るい酸味",
    price: 1200,
    unit: "100g",
    image: "/images/menu/ethiopia.jpg",
    inStock: true,
  },
  {
    id: "2",
    name: "グアテマラ アンティグア",
    origin: "グアテマラ",
    roast: "中煎り",
    flavor: "チョコレートのようなコクと甘み",
    price: 1100,
    unit: "100g",
    image: "/images/menu/guatemala.jpg",
    inStock: true,
  },
  {
    id: "3",
    name: "ブラジル セラード",
    origin: "ブラジル",
    roast: "中深煎り",
    flavor: "ナッツの甘みとクリーンな後味",
    price: 1000,
    unit: "100g",
    image: "/images/menu/brazil.jpg",
    inStock: true,
  },
  {
    id: "4",
    name: "コロンビア ウィラ",
    origin: "コロンビア",
    roast: "中煎り",
    flavor: "キャラメルのような甘みとバランスの良い酸味",
    price: 1100,
    unit: "100g",
    image: "/images/menu/guatemala.jpg",
    inStock: true,
  },
  {
    id: "5",
    name: "ケニア AA",
    origin: "ケニア",
    roast: "中煎り",
    flavor: "ベリーのような果実感と力強いボディ",
    price: 1400,
    unit: "100g",
    image: "/images/menu/ethiopia.jpg",
    inStock: true,
  },
  {
    id: "6",
    name: "インドネシア マンデリン",
    origin: "インドネシア",
    roast: "深煎り",
    flavor: "どっしりとしたボディとスパイシーな余韻",
    price: 1200,
    unit: "100g",
    image: "/images/menu/brazil.jpg",
    inStock: true,
  },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const addToCart = (product: Product) => {
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
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 5000 ? 0 : 370;
  const total = subtotal + shipping;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        image="/images/menu/ethiopia.jpg"
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
      <section className="py-32 md:py-44 overflow-hidden">
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
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          {loading ? (
            <div className="text-center text-haicha py-20">
              商品を読み込み中...
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              {products.map((product, i) => (
                <ScrollReveal key={product.id} direction="up" delay={i * 0.1}>
                  <div className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg mb-8">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                      <span className="absolute top-4 left-4 bg-konsumi/80 text-white text-xs px-3 py-1 rounded">
                        {product.roast}
                      </span>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white/90 text-konsumi px-4 py-2 rounded text-sm font-medium">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-konsumi mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-haicha mb-3">
                      {product.origin} ／ {product.roast}
                    </p>
                    <p className="text-sm text-haicha mb-4 leading-relaxed">
                      {product.flavor}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-karekusa text-lg">
                        ¥{product.price.toLocaleString()}
                        <span className="text-sm font-normal text-haicha ml-1">
                          / {product.unit}
                        </span>
                      </p>
                      {product.inStock && (
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-karekusa hover:bg-konsumi text-white px-5 py-2 rounded text-sm font-medium transition-colors"
                        >
                          カートに入れる
                        </button>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
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
      <section className="bg-tsuchikabe py-32 md:py-44 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/hero/hero-3.jpg"
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
                className="inline-block border-2 border-karekusa text-karekusa hover:bg-karekusa hover:text-white px-8 py-3 rounded font-medium transition-all duration-300"
              >
                購入のお問い合わせ →
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="py-32 md:py-44 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl text-center text-konsumi mb-6">
              配送について
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-20 md:mb-24" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
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
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
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
              <div className="bg-white p-10 rounded-lg shadow-sm text-center h-full">
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

      {/* Experience Bridge (replaced subscription teaser) */}
      <section className="relative py-36 md:py-48 overflow-hidden">
        <Image
          src="/images/experience/roasting.jpg"
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
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              焙煎体験を予約する
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Cart Floating Button */}
      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-karekusa hover:bg-konsumi text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl transition-colors"
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
          <span className="absolute -top-1 -right-1 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-usuzumi">
              <h3 className="font-serif text-xl font-bold text-konsumi">
                カート（{cartCount}点）
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                className="text-haicha hover:text-konsumi p-1"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <p className="text-haicha text-center py-10">
                  カートは空です
                </p>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 pb-6 border-b border-usuzumi/50"
                    >
                      <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif text-sm font-bold text-konsumi mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-haicha mb-2">
                          {item.product.unit}
                        </p>
                        <p className="font-bold text-karekusa text-sm">
                          ¥{item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, -1)
                          }
                          className="w-8 h-8 rounded border border-usuzumi text-sumi hover:bg-tsuchikabe flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm text-konsumi">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, 1)
                          }
                          className="w-8 h-8 rounded border border-usuzumi text-sumi hover:bg-tsuchikabe flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-usuzumi bg-tsuchikabe/30">
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between text-haicha">
                    <span>小計</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-haicha">
                    <span>
                      送料
                      {subtotal >= 5000 && (
                        <span className="text-gold ml-1 text-xs">無料</span>
                      )}
                    </span>
                    <span>
                      {shipping === 0
                        ? "¥0"
                        : `¥${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  {subtotal < 5000 && (
                    <p className="text-xs text-gold">
                      あと¥{(5000 - subtotal).toLocaleString()}で送料無料
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-konsumi text-lg pt-2 border-t border-usuzumi/50">
                    <span>合計</span>
                    <span>¥{total.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-white py-4 rounded text-lg font-medium transition-colors"
                >
                  {checkoutLoading ? "処理中..." : "ご購入手続きへ"}
                </button>
                <p className="text-xs text-haicha text-center mt-3">
                  Stripeの安全な決済画面に移動します
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
