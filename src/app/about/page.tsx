import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { BoldText } from "@/shared/ui/BoldText";
import content from "@content/pages/about.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

export default function AboutPage() {
  const { hero, brandStory, thePlace, thePeople, sceneryUenohara, cta } = content;

  return (
    <>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      {/* Brand Story */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <div className="text-center md:text-left">
                <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                  {brandStory.eyebrow}
                </p>
                <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
                  {brandStory.headingLine1}
                  <br />
                  {brandStory.headingLine2}
                </h2>
                <div className="w-16 h-px bg-gold mb-10 mx-auto md:mx-0" />
                {brandStory.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`text-haicha leading-loose ${
                      i < brandStory.paragraphs.length - 1 ? "mb-6" : ""
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src={brandStory.image}
                  alt={brandStory.imageAlt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* The Place */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {thePlace.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {thePlace.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl mx-auto text-center mb-16">
              {thePlace.intro.map((p, i) => (
                <p
                  key={i}
                  className={`text-haicha leading-loose ${
                    i < thePlace.intro.length - 1 ? "mb-6" : ""
                  }`}
                >
                  {p}
                </p>
              ))}
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {thePlace.images.map((img, i) => (
              <ScrollReveal
                key={img.src}
                direction={i === 0 ? "left" : "right"}
                delay={i === 0 ? 0 : 0.15}
              >
                <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="font-serif text-lg text-konsumi tracking-wider font-light leading-loose text-center mt-14">
              {thePlace.closingLine1}
              <br />
              {thePlace.closingLine2}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The People */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-10 md:gap-20 items-center">
            <ScrollReveal direction="right" className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src={thePeople.image}
                  alt={thePeople.imageAlt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2} className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                {thePeople.eyebrow}
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
                {thePeople.heading}
              </h2>
              <p className="text-haicha leading-loose mb-6">
                <BoldText text={thePeople.paragraph1} />
              </p>
              <p className="text-haicha leading-loose mb-6">
                {thePeople.paragraph2}
              </p>
              <p className="text-haicha leading-loose">
                {thePeople.paragraph3}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Scenery */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {sceneryUenohara.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {sceneryUenohara.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {sceneryUenohara.images.map((img, i) => (
              <ScrollReveal
                key={img.src}
                direction={i === 0 ? "left" : "right"}
                delay={i === 0 ? 0 : 0.15}
              >
                <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-center text-haicha leading-loose max-w-2xl mx-auto mt-14">
              {sceneryUenohara.bodyLine1}
              <br />
              {sceneryUenohara.bodyLine2}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-8">
              {cta.heading}
            </h2>
            <p className="text-haicha leading-loose mb-12">
              {cta.bodyLine1}
              <br />
              {cta.bodyLine2}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={cta.experienceHref}
                className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                {cta.experienceLabel}
              </Link>
              <Link
                href={cta.shopHref}
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                {cta.shopLabel}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
