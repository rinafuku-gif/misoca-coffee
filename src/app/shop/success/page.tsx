"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";

const CART_STORAGE_KEY = "misoca-coffee-cart";

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, ease: "easeInOut" as const, delay: 0.3 },
      opacity: { duration: 0.2, delay: 0.3 },
    },
  },
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
      delay: 0.1,
    },
  },
};

const particlePositions = [
  { x: -60, y: -80, rotate: -15, delay: 0.5 },
  { x: 70, y: -70, rotate: 25, delay: 0.6 },
  { x: -80, y: 20, rotate: -30, delay: 0.7 },
  { x: 90, y: 10, rotate: 40, delay: 0.55 },
  { x: -40, y: -100, rotate: 10, delay: 0.65 },
  { x: 50, y: -90, rotate: -20, delay: 0.75 },
  { x: -90, y: -30, rotate: 35, delay: 0.8 },
  { x: 80, y: -50, rotate: -45, delay: 0.45 },
];

const particleColors = [
  "bg-gold",
  "bg-gold/70",
  "bg-karekusa/50",
  "bg-konsumi/30",
  "bg-gold/50",
  "bg-karekusa/30",
  "bg-gold/60",
  "bg-konsumi/20",
];

export default function SuccessPage() {
  // Only clear cart if redirected from Stripe (session_id present in URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center py-32 md:py-44 overflow-hidden bg-kominka-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Animated Checkmark with Confetti */}
        <div className="relative mb-12">
          {/* Confetti Particles */}
          {particlePositions.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 0],
                x: pos.x,
                y: pos.y,
                opacity: [0, 1, 0],
                rotate: pos.rotate,
              }}
              transition={{
                duration: 1.2,
                delay: pos.delay,
                ease: "easeOut",
              }}
              className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${particleColors[i]}`}
              style={{ marginLeft: -4, marginTop: -4 }}
            />
          ))}

          {/* Circle Background */}
          <motion.div
            variants={circleVariants}
            initial="hidden"
            animate="visible"
            className="w-24 h-24 md:w-28 md:h-28 bg-gold/10 rounded-full flex items-center justify-center mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2,
              }}
              className="w-20 h-20 md:w-24 md:h-24 bg-gold/20 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-12 h-12 md:w-14 md:h-14"
                fill="none"
                viewBox="0 0 24 24"
              >
                <motion.path
                  variants={checkmarkVariants}
                  initial="hidden"
                  animate="visible"
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gold"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-sm tracking-[0.3em] text-gold font-medium mb-4">
            ORDER COMPLETE
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-konsumi mb-6">
            ご注文ありがとうございます
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <p className="text-haicha text-lg leading-loose mb-4">
            焙煎したてのコーヒー豆を心を込めてお届けいたします。
          </p>
          <p className="text-haicha leading-loose mb-4">
            ご注文の確認メールをお送りしました。
            <br />
            届かない場合はお手数ですがお問い合わせください。
          </p>
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-12 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gold mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-haicha leading-relaxed text-left">
                ご注文後に焙煎し、3日以内に発送いたします。
                発送完了時に追跡番号をメールでお知らせします。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-3.5 text-xs tracking-[0.15em] transition-all duration-500"
            >
              トップページへ
            </Link>
            <Link
              href="/experience"
              className="inline-flex items-center justify-center gap-2 bg-gold/90 hover:bg-gold text-white px-8 py-3.5 text-xs tracking-[0.15em] transition-all duration-500"
            >
              焙煎体験を予約する
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-3.5 text-xs tracking-[0.15em] transition-all duration-500"
            >
              オンラインショップに戻る
            </Link>
          </div>
        </ScrollReveal>

        {/* Social Sharing Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="border-t border-usuzumi/30 pt-8">
            <p className="text-sm text-haicha mb-4">
              三十日珈琲のコーヒーをSNSでシェアしてみませんか？
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://twitter.com/intent/tweet?text=%E4%B8%89%E5%8D%81%E6%97%A5%E7%8F%88%E7%90%B2%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC%E8%B1%86%E3%82%92%E6%B3%A8%E6%96%87%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F%E2%98%95%20%E7%84%99%E7%85%8E%E3%81%97%E3%81%9F%E3%81%A6%E3%81%8C%E5%B1%8A%E3%81%8F%E3%81%AE%E3%81%8C%E6%A5%BD%E3%81%97%E3%81%BF%EF%BC%81"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-tsuchikabe hover:bg-karekusa hover:text-white text-haicha flex items-center justify-center transition-all duration-300"
                aria-label="Xでシェア"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-tsuchikabe hover:bg-karekusa hover:text-white text-haicha flex items-center justify-center transition-all duration-300"
                aria-label="Instagramでシェア"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://line.me/R/msg/text/?%E4%B8%89%E5%8D%81%E6%97%A5%E7%8F%88%E7%90%B2%E3%81%A7%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC%E8%B1%86%E3%82%92%E6%B3%A8%E6%96%87%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F%E2%98%95"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-tsuchikabe hover:bg-karekusa hover:text-white text-haicha flex items-center justify-center transition-all duration-300"
                aria-label="LINEでシェア"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
