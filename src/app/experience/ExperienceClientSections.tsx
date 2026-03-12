"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function ExperienceClientSections() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <>
      {/* ─── 7. Reservation CTA ─── */}
      <section ref={ctaRef} className="relative py-28 md:py-40 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: imageY }}>
          <Image
            src="/images/hero/hero-interior-atmosphere.jpg"
            alt=""
            fill
            className="object-cover scale-110"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-xs tracking-[0.4em] text-white/50 mb-6 uppercase">
              Reservation
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-8">
              ご予約
            </h2>
            <p className="text-white/70 leading-loose mb-12 max-w-xl mx-auto">
              完全予約制・貸切の焙煎体験です。
              <br />
              ご希望の日程をお選びいただければ、折り返しご連絡いたします。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSddXQX_VthNqn6GmfG_Nf_tidQgW_9q_oJtIeBMvPAGoTwCvQ/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gold hover:bg-gold-dark text-white px-12 py-4 rounded-sm text-sm tracking-widest font-medium transition-colors duration-300"
            >
              焙煎体験を予約する
            </a>
            <p className="text-xs text-white/40 mt-8 tracking-wide">
              Instagram DM・お電話でもご予約いただけます
            </p>
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
              <h2 className="font-serif text-3xl md:text-4xl text-konsumi mb-8 leading-snug">
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
