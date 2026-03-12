"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
}

const slides: Slide[] = [
  { src: "/images/hero/hero-beans-pour.jpg", alt: "生豆を焙煎機に注ぐ" },
  { src: "/images/hero/hero-experience-group.jpg", alt: "焙煎体験の様子" },
  { src: "/images/hero/hero-interior-atmosphere.jpg", alt: "古民家の情緒ある空間" },
  { src: "/images/hero/hero-roasting-output.jpg", alt: "焙煎豆の出来上がり" },
];

const SLIDE_DURATION = 6000;

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrent(index);
    setProgress(0);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrent((c) => (c + 1) % slides.length);
          return 0;
        }
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [current]);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Slideshow Background with Ken Burns */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].src}
              alt={slides[current].alt}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="100vw"
              quality={90}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay - elegant multi-layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.4] mb-10"
            >
              <span className="block">コーヒーと暮らす。</span>
              <span className="block mt-2 md:mt-3">古くて新しい、みんなの焙煎所。</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-14"
            >
              <p className="text-base md:text-lg text-white/80 leading-relaxed tracking-wide">
                築300年の古民家で、自分だけのコーヒーを焙煎する。
              </p>
              <p className="text-base md:text-lg text-white/60 leading-relaxed tracking-wide mt-1">
                山梨県上野原市から届ける、体験とスペシャルティコーヒー。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSddXQX_VthNqn6GmfG_Nf_tidQgW_9q_oJtIeBMvPAGoTwCvQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 text-sm font-medium tracking-wide transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg"
              >
                焙煎体験を予約する
              </a>
              <Link
                href="/shop"
                className="inline-block border border-white/40 text-white hover:bg-white hover:text-konsumi px-10 py-4 text-sm font-medium tracking-wide transition-all duration-300"
              >
                コーヒー豆を購入する
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm tracking-wide transition-colors duration-300 py-4 group"
              >
                三十日珈琲について
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 pb-10">
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className="flex-1 group relative"
                aria-label={`スライド ${i + 1}`}
              >
                <div className="h-[2px] bg-white/20 overflow-hidden">
                  <motion.div
                    className="h-full bg-white/80"
                    initial={{ width: "0%" }}
                    animate={{
                      width:
                        i === current
                          ? `${progress}%`
                          : i < current
                            ? "100%"
                            : "0%",
                    }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
