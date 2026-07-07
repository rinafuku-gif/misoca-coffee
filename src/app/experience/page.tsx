import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { ExperienceClientSections } from "./ExperienceClientSections";
import content from "@content/pages/experience.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

/* プラン価格（¥8,800 / ¥4,400）は src/features/reservation/pricing.ts の
   BASE_PRICE 定数と直結しているため、CMS化スコープ外とし直書きのまま維持する。
   （表示だけ編集できてしまうと実際の予約金額とズレるリスクがあるため） */
const PERSONAL_PLAN_PRICE = "¥8,800";
const GROUP_PLAN_PRICE = "¥4,400";

export default function ExperiencePage() {
  const { hero, directBookingBanner, pricing, flow, gallery, access } = content;

  return (
    <>
      {/* ─── 1. Page Hero ─── */}
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        description={hero.description}
        image={hero.image}
      />

      {/* ─── 2. Direct Booking Banner ─── */}
      <section className="bg-konsumi py-5 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/80 text-xs md:text-sm tracking-[0.15em] font-light">
            {directBookingBanner.text}
          </p>
        </div>
      </section>

      {/* ─── 3. Plans & Pricing ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {pricing.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {pricing.heading}
            </h2>
            <p className="text-center text-sm text-haicha tracking-wide mb-16 md:mb-20">
              {pricing.subheading}
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-14 max-w-4xl mx-auto">
            {/* Personal Plan */}
            <ScrollReveal direction="left">
              <div className="bg-white rounded-sm p-10 md:p-12 text-center shadow-sm h-full ring-1 ring-gold/40 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
                  {pricing.personalPlan.badge}
                </span>
                <p className="text-[10px] tracking-[0.5em] text-gold font-medium mb-3 mt-2 uppercase">
                  {pricing.personalPlan.eyebrow}
                </p>
                <h3 className="font-serif text-xl text-konsumi mb-6">
                  {pricing.personalPlan.title}
                </h3>
                <p className="text-4xl md:text-5xl font-light text-gold mb-1">
                  {PERSONAL_PLAN_PRICE}
                </p>
                <p className="text-xs text-haicha mb-10">{pricing.personalPlan.priceNote}</p>
                <ul className="text-sm text-haicha space-y-5 text-left mb-12">
                  {pricing.personalPlan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4">
                      <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#reservation"
                  className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500 w-full"
                >
                  {pricing.personalPlan.ctaLabel}
                </a>
              </div>
            </ScrollReveal>

            {/* Group Plan */}
            <ScrollReveal direction="right">
              <div className="bg-white rounded-sm p-10 md:p-12 text-center shadow-sm h-full">
                <p className="text-[10px] tracking-[0.5em] text-gold font-medium mb-3 mt-5 uppercase">
                  {pricing.groupPlan.eyebrow}
                </p>
                <h3 className="font-serif text-xl text-konsumi mb-6">
                  {pricing.groupPlan.title}
                </h3>
                <p className="text-4xl md:text-5xl font-light text-gold mb-1">
                  {GROUP_PLAN_PRICE}
                </p>
                <p className="text-xs text-haicha mb-10">{pricing.groupPlan.priceNote}</p>
                <ul className="text-sm text-haicha space-y-5 text-left mb-12">
                  {pricing.groupPlan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-4">
                      <span className="w-5 h-px bg-gold/50 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500 w-full"
                >
                  {pricing.groupPlan.ctaLabel}
                </Link>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <div className="max-w-3xl mx-auto mt-14 space-y-3">
              <p className="text-center text-xs text-haicha leading-relaxed">
                {pricing.footnote1Line1}
                <br className="md:hidden" />
                {pricing.footnote1Line2}
              </p>
              <p className="text-center text-xs text-haicha/60 leading-relaxed whitespace-pre-line">
                {pricing.footnote2}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── 4. Experience Flow ─── */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {flow.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {flow.heading}
            </h2>
            <p className="text-center text-haicha text-sm mb-2">
              {flow.subheading}
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-28 md:space-y-36">
            {flow.steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } gap-10 md:gap-20 items-center`}
              >
                <ScrollReveal
                  direction={i % 2 === 0 ? "left" : "right"}
                  className="w-full md:w-3/5"
                >
                  <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  </div>
                </ScrollReveal>
                <ScrollReveal
                  direction={i % 2 === 0 ? "right" : "left"}
                  delay={0.2}
                  className="w-full md:w-2/5"
                >
                  <span className="text-5xl md:text-6xl text-gold/15 font-light block mb-4 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-haicha leading-loose">
                    {step.text}
                  </p>
                </ScrollReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Photo Gallery ─── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {gallery.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {gallery.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {gallery.images.map((src, i) => (
              <ScrollReveal key={src} direction="up" delay={i * 0.1}>
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-lg group">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. Access Info ─── */}
      <section className="py-24 md:py-32 bg-tsuchikabe overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {access.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {access.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 max-w-4xl mx-auto">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 md:p-12 rounded-sm shadow-sm h-full">
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  {access.trainCard.title}
                </h3>
                <ul className="text-haicha space-y-5 text-sm">
                  {access.trainCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="bg-white p-10 md:p-12 rounded-sm shadow-sm h-full">
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  {access.carCard.title}
                </h3>
                <ul className="text-haicha space-y-5 text-sm">
                  {access.carCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <span className="w-5 h-px bg-gold/50 flex-shrink-0 mt-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── 7. Reservation CTA ─── */}
      <ExperienceClientSections />
    </>
  );
}
