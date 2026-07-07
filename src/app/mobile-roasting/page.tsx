import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { MobileRoastingReservation } from "./MobileRoastingReservation";
import content from "@content/pages/mobile-roasting.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

/* 基本料金（¥11,000）・追加料金（+¥4,400）は src/features/reservation/pricing.ts の
   BASE_PRICE / EXTRA_PRICE_PER_PERSON 定数と直結しているため、CMS化スコープ外とし
   直書きのまま維持する（表示だけ編集できると実際の予約金額とズレるリスクがあるため）。
   「要相談」（大人数プラン）は計算に使われないためCMS編集対象。 */
const BASE_PLAN_PRICE = "¥11,000";
const ADDITIONAL_PLAN_PRICE = "+¥4,400";

export default function MobileRoastingPage() {
  const { hero, concept, whatWeBring, suitableFor, pricing } = content;

  return (
    <>
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        description={hero.description}
        image={hero.image}
      />

      {/* Concept */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
              {concept.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
              {concept.headingLine1}
              <br />
              {concept.headingLine2}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-12" />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-haicha leading-loose max-w-2xl mx-auto">
              {concept.body}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* What We Bring */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {whatWeBring.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {whatWeBring.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
            {whatWeBring.items.map((item, i) => (
              <ScrollReveal key={item.title} direction="up" delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-sm text-center h-full">
                  <span className="text-2xl font-serif text-gold/15 font-light block mb-4">
                    0{i + 1}
                  </span>
                  <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                    {item.title}
                  </h3>
                  <p className="text-haicha leading-loose">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Suitable For */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src={suitableFor.image}
                  alt={suitableFor.imageAlt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                {suitableFor.eyebrow}
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8 leading-[1.5]">
                {suitableFor.heading}
              </h2>
              <div className="space-y-6">
                {suitableFor.items.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-2">
                      {item.title}
                    </h3>
                    <p className="text-haicha leading-loose">{item.text}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {pricing.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {pricing.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white rounded-sm p-10 md:p-14">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      {pricing.basePlan.title}
                    </h3>
                    <p className="text-sm text-haicha">{pricing.basePlan.note}</p>
                  </div>
                  <p className="text-3xl font-light text-gold">
                    {BASE_PLAN_PRICE}
                    <span className="text-sm text-haicha ml-2">{pricing.basePlan.priceNote}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      {pricing.additionalPlan.title}
                    </h3>
                    <p className="text-sm text-haicha">{pricing.additionalPlan.note}</p>
                  </div>
                  <p className="text-3xl font-light text-gold">
                    {ADDITIONAL_PLAN_PRICE}
                    <span className="text-sm text-haicha ml-2">
                      {pricing.additionalPlan.priceNote}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      {pricing.largeGroupPlan.title}
                    </h3>
                    <p className="text-sm text-haicha">{pricing.largeGroupPlan.note}</p>
                  </div>
                  <p className="text-xl font-light text-konsumi">
                    {pricing.largeGroupPlan.price}
                  </p>
                </div>
              </div>
              <p className="text-sm text-haicha mt-10 leading-loose whitespace-pre-line">
                {pricing.footnote}
              </p>
              <div className="mt-8 pt-8 border-t border-usuzumi/30">
                <h4 className="font-serif text-base text-konsumi tracking-wider font-light mb-3">
                  {pricing.areaHeading}
                </h4>
                <ul className="text-sm text-haicha leading-loose space-y-1">
                  {pricing.areas.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                  <li className="text-haicha/60">{pricing.areaFootnote}</li>
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Reservation */}
      <MobileRoastingReservation />
    </>
  );
}
