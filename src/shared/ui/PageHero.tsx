"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
  image?: string;
}

export function PageHero({ title, subtitle, description, image }: PageHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={sectionRef} className="relative py-36 md:py-48 overflow-hidden">
      {image ? (
        <>
          <motion.div className="absolute inset-0" style={{ y: imageY }}>
            <Image
              src={image}
              alt={subtitle}
              fill
              className="object-cover scale-110"
              sizes="100vw"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-konsumi" />
      )}

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center"
        style={{ y: contentY, opacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-[family-name:var(--font-display)] text-xs md:text-sm tracking-[0.35em] uppercase text-white/50 mb-6"
        >
          {title}
        </motion.p>

        {/* Gold accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-12 h-px bg-gold mx-auto mb-8"
        />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-2xl md:text-4xl lg:text-5xl font-light text-white tracking-wider mb-8 leading-[1.5]"
        >
          {subtitle}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/65 leading-loose max-w-2xl mx-auto text-base md:text-lg tracking-wide"
          >
            {description}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}
