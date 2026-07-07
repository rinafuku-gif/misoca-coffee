import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { StandCalendar } from "@/features/stand/components/StandCalendar";
import content from "@content/pages/stand.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

export default function StandPage() {
  const { hero, aboutStand, galleryBanner, menu, info, followUs, sceneryArchive, roastingCta } =
    content;

  return (
    <>
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        description={hero.description}
        image={hero.image}
      />

      {/* About the Stand */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-center">
            <ScrollReveal direction="left" className="w-full md:w-1/2">
              <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
                {aboutStand.eyebrow}
              </p>
              <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6 leading-[1.5]">
                {aboutStand.headingLine1}
                <br />
                {aboutStand.headingLine2}
              </h2>
              <div className="w-16 h-px bg-gold mb-10" />
              {aboutStand.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-haicha leading-loose ${
                    i < aboutStand.paragraphs.length - 1 ? "mb-6" : ""
                  }`}
                >
                  {p}
                </p>
              ))}
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2} className="w-full md:w-1/2">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <Image
                  src={aboutStand.image}
                  alt={aboutStand.imageAlt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="relative aspect-video rounded-sm overflow-hidden">
              <Image
                src={galleryBanner.image}
                alt={galleryBanner.imageAlt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Menu */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {menu.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {menu.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-0">
            {menu.items.map((item, i) => (
              <ScrollReveal key={item.name} direction="up" delay={i * 0.1}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8 border-b border-usuzumi/30">
                  <div>
                    <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-haicha">{item.note}</p>
                  </div>
                  <p className="text-2xl font-light text-gold whitespace-nowrap">
                    {item.price}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="mt-12 space-y-2">
              {menu.footnotes.map((line) => (
                <p key={line} className="text-sm text-haicha leading-relaxed">
                  {line}
                </p>
              ))}
              <p className="text-xs text-haicha/60 mt-4">
                {menu.note2}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 営業情報 + カレンダー */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {info.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {info.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="text-center mb-16">
              <p className="font-serif text-xl text-konsumi tracking-wider font-light mb-4">
                {info.days}
              </p>
              <p className="text-haicha leading-loose mb-6">
                {info.hours}
              </p>
              <p className="text-sm text-haicha leading-relaxed">
                {info.location}
              </p>
              <p className="text-xs text-haicha/60 leading-relaxed">
                {info.address}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <StandCalendar />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA - 最新情報 */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {followUs.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
              {followUs.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
            <p className="text-haicha leading-loose mb-12">
              {followUs.bodyLine1}
              <br />
              {followUs.bodyLine2}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={followUs.igHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                {followUs.igLabel}
              </a>
              <Link
                href={followUs.shopHref}
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                {followUs.shopLabel}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Scenery Archive - 朝の景色アーカイブ */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {sceneryArchive.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {sceneryArchive.heading}
            </h2>
            <p className="text-center text-sm text-haicha mb-4">
              {sceneryArchive.subheading}
            </p>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {sceneryArchive.photos.map((photo, i) => (
              <ScrollReveal key={photo.month} direction="up" delay={i * 0.1}>
                <div className="relative">
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={`${photo.month}の朝の景色`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <p className="text-xs text-haicha/60 tracking-wide mt-3 text-center">
                    {photo.month}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 三十日珈琲への導線 */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {roastingCta.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
              {roastingCta.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-10" />
            <p className="text-haicha leading-loose mb-12">
              {roastingCta.bodyLine1}
              <br />
              {roastingCta.bodyLine2}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href={roastingCta.ctaHref}
              className="inline-block bg-gold/90 hover:bg-gold text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
            >
              {roastingCta.ctaLabel}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
