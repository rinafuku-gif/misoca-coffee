"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  src: string;
  alt: string;
}

const slides: Slide[] = [
  { src: "/images/hero/hero-1.jpg", alt: "築300年の古民家外観" },
  { src: "/images/hero/hero-2.jpg", alt: "焙煎風景" },
  { src: "/images/hero/hero-3.jpg", alt: "コーヒーを淹れる手元" },
  { src: "/images/hero/hero-4.jpg", alt: "上野原の里山風景" },
];

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Slideshow Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].src}
            alt={slides[current].alt}
            fill
            className="object-cover"
            priority={current === 0}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            コーヒーから始まる。
            <br />
            もうひとつの日常。
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed"
          >
            一杯の先に、体験がある。場所がある。人がいる。
            <br className="hidden md:block" />
            築300年の古民家から届ける、焙煎体験とスペシャルティコーヒー。
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/experience"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              焙煎体験を予約する
            </Link>
            <Link
              href="/menu"
              className="inline-block border-2 border-white text-white hover:bg-white hover:text-konsumi px-10 py-4 rounded text-lg font-medium transition-colors"
            >
              コーヒー豆を購入する
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i === current ? "bg-white w-8" : "bg-white/50"
            }`}
            aria-label={`スライド ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 right-8 z-10 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/60 text-sm flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest [writing-mode:vertical-rl]">
            SCROLL
          </span>
          <div className="w-px h-8 bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
