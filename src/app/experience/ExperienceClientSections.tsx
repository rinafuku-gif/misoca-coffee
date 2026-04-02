"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ReservationFlow } from "@/components/reservation/ReservationFlow";

export function ExperienceClientSections() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <>
      {/* ─── 7. Reservation ─── */}
      <section
        id="reservation"
        ref={ctaRef}
        className="relative py-28 md:py-40 overflow-hidden"
      >
        <motion.div className="absolute inset-0" style={{ y: imageY }}>
          <Image
            src="/images/hero/hero-interior-atmosphere.jpg"
            alt=""
            fill
            className="object-cover scale-110"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.4em] text-white/50 mb-6 uppercase">
                Reservation
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-white tracking-wider font-light mb-6">
                ご予約
              </h2>
              <p className="text-white/65 leading-loose max-w-md mx-auto text-sm">
                カレンダーから日程・時間枠を選び、
                <br />
                フォームにご記入ください。
              </p>
              <div className="w-12 h-px bg-gold/60 mx-auto mt-6" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <ReservationFlow />
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mt-12 text-center">
              <p className="text-xs text-white/40 tracking-wide mb-4">
                LINEやInstagram DMでもお問い合わせいただけます
              </p>
              <a
                href="https://lin.ee/ihDBxM8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/60 hover:text-white hover:border-white/40 px-6 py-3 text-xs tracking-[0.2em] transition-all duration-500"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                LINEでお問い合わせ
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 8. EC Bridge ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl group">
                <Image
                  src="/images/experience/roasting-hands.jpg"
                  alt="焙煎豆"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-xs tracking-[0.4em] text-gold font-medium mb-6 uppercase">
                Online Shop
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8 leading-[1.5]">
                体験で出会った豆を、
                <br />
                ご自宅でも。
              </h2>
              <p className="text-haicha leading-loose mb-12">
                焙煎体験で気に入った豆を、オンラインショップから
                ご注文いただけます。焙煎3日以内の新鮮な豆を
                ご自宅へお届けします。
              </p>
              <Link
                href="/shop"
                className="group/link inline-flex items-center gap-3 text-karekusa font-medium text-sm tracking-wide hover:gap-5 transition-all duration-300"
              >
                <span>オンラインショップへ</span>
                <span className="w-8 h-px bg-karekusa group-hover/link:w-12 transition-all duration-300" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
