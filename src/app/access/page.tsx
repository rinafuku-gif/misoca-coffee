import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import content from "@content/pages/access.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

export default function AccessPage() {
  const { hero, addressBlock, transportation, scenery } = content;

  return (
    <>
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        description={hero.description}
        image={hero.image}
      />

      {/* Address & Map */}
      <section className="py-36 md:py-52 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-20 md:mb-28">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                {addressBlock.eyebrow}
              </p>
              <p className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-4">
                {addressBlock.name}
              </p>
              <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                {addressBlock.postalAddress}
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-konsumi font-medium tracking-wide">
                  {addressBlock.reservationNote}
                </p>
                <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                  TEL:{" "}
                  <a
                    href={addressBlock.telHref}
                    className="underline underline-offset-4 decoration-gold/30 hover:text-konsumi transition-colors"
                  >
                    {addressBlock.tel}
                  </a>
                </p>
                <p className="text-sm text-haicha leading-[2.2] tracking-wide">
                  MAIL:{" "}
                  <a
                    href={addressBlock.emailHref}
                    className="underline underline-offset-4 decoration-gold/30 hover:text-konsumi transition-colors"
                  >
                    {addressBlock.email}
                  </a>
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="overflow-hidden mb-16">
              <iframe
                src={addressBlock.mapEmbedUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="三十日珈琲の地図"
                className="w-full"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Transportation */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-20">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                {transportation.eyebrow}
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light">
                {transportation.heading}
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <ScrollReveal direction="left">
              <div className="bg-white p-10 md:p-12 h-full">
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  {transportation.trainCard.title}
                </h3>
                <div className="w-8 h-px bg-gold/30 mb-8" />
                <ul className="text-sm text-haicha space-y-5 leading-[2.2] tracking-wide">
                  {transportation.trainCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="bg-white p-10 md:p-12 h-full">
                <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-6">
                  {transportation.carCard.title}
                </h3>
                <div className="w-8 h-px bg-gold/30 mb-8" />
                <ul className="text-sm text-haicha space-y-5 leading-[2.2] tracking-wide">
                  {transportation.carCard.items.map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <span className="w-5 h-px bg-gold/40 flex-shrink-0 mt-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scenery */}
      <section className="py-28 md:py-40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="relative aspect-[21/9] overflow-hidden">
              <Image
                src={scenery.image}
                alt={scenery.imageAlt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-center text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mt-10 max-w-2xl mx-auto">
              {scenery.bodyLine1}
              <br />
              {scenery.bodyLine2}
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
