"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
  image?: string;
}

export function PageHero({ title, subtitle, description, image }: PageHeroProps) {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      {image ? (
        <>
          <Image
            src={image}
            alt={subtitle}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      ) : (
        <div className="absolute inset-0 bg-konsumi" />
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm tracking-[0.3em] text-white/60 mb-4"
        >
          {title}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-3xl md:text-5xl font-bold text-white mb-4"
        >
          {subtitle}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/70 leading-relaxed max-w-2xl mx-auto text-lg"
          >
            {description}
          </motion.p>
        )}
      </div>
    </section>
  );
}
