import type { Metadata } from "next";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import content from "@content/pages/catering.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

const largePlans = content.largePlans.items;

export default function CateringPage() {
  const { hero, concept, features, plans, planFootnotes, orderFlow, serviceArea, faq, cta } =
    content;

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

      {/* Features */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {features.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {features.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {features.items.map((feature, i) => (
              <ScrollReveal key={feature.title} direction="up" delay={i * 0.15}>
                <div className="bg-white p-8 md:p-10 rounded-sm text-center h-full">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-6">
                    {feature.title}
                  </h3>
                  <div className="w-8 h-px bg-gold/30 mx-auto mb-6" />
                  <p className="text-sm text-haicha leading-loose">
                    {feature.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {plans.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {plans.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {plans.items.map((plan, i) => (
              <ScrollReveal key={plan.label} direction="up" delay={i * 0.15}>
                <div
                  className={`bg-white rounded-sm p-10 text-center h-full flex flex-col relative ${
                    plan.featured ? "ring-1 ring-gold/40" : ""
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full uppercase">
                      おすすめ
                    </span>
                  )}
                  <p className="text-[10px] tracking-[0.5em] text-gold font-light mb-3 mt-2 uppercase">
                    {plan.label}
                  </p>
                  <h3 className="font-serif text-lg text-konsumi tracking-wider font-light mb-4">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-light text-gold mb-1">
                    {plan.price}
                  </p>
                  <p className="text-xs text-haicha mb-2">（税込）</p>
                  {plan.campaign && (
                    <p className="text-xs text-gold font-medium mb-4 tracking-wide">
                      {plan.campaign}
                    </p>
                  )}
                  {plan.note && (
                    <p className="text-xs text-karekusa mb-4 tracking-wide">
                      {plan.note}
                    </p>
                  )}
                  <p className="text-sm text-haicha mb-8 leading-relaxed">
                    {plan.description}
                  </p>
                  <ul className="text-sm text-haicha space-y-3 text-left mb-10">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="w-4 h-px bg-gold/50 flex-shrink-0 mt-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <a
                      href={plans.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block w-full py-4 text-xs tracking-[0.2em] transition-all duration-500 ${
                        plan.featured
                          ? "bg-gold/90 hover:bg-gold text-white"
                          : "border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white"
                      }`}
                    >
                      {plans.ctaLabel}
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Large Plans */}
          <ScrollReveal delay={0.3}>
            <div className="mt-12 bg-white rounded-sm p-8 md:p-10 max-w-2xl mx-auto">
              <h3 className="font-serif text-base text-konsumi tracking-wider font-light text-center mb-6">
                {content.largePlans.heading}
              </h3>
              <div className="space-y-4">
                {largePlans.map((plan) => (
                  <div
                    key={plan.name}
                    className="flex items-center justify-between border-b border-usuzumi/20 pb-4"
                  >
                    <div>
                      <p className="text-sm text-konsumi font-light tracking-wide">
                        {plan.name}
                      </p>
                      <p className="text-xs text-haicha">{plan.capacity}</p>
                    </div>
                    <p className="text-lg font-light text-gold">
                      {plan.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mt-10 text-center space-y-2">
              {planFootnotes.map((line) => (
                <p key={line} className="text-xs text-haicha leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Order Flow */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {orderFlow.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {orderFlow.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {orderFlow.steps.map((step, i) => (
              <ScrollReveal key={step.num} direction="up" delay={i * 0.1}>
                <div className="text-center">
                  <span className="text-4xl text-gold/20 font-light block mb-4 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-haicha leading-loose">
                    {step.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {serviceArea.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {serviceArea.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-white p-10 md:p-14 rounded-sm text-center">
              <ul className="space-y-4 mb-8">
                {serviceArea.areas.map((area) => (
                  <li
                    key={area}
                    className="text-konsumi flex items-center justify-center gap-3"
                  >
                    <span className="w-6 h-px bg-gold/40" />
                    {area}
                    <span className="w-6 h-px bg-gold/40" />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-haicha leading-relaxed">
                {serviceArea.footnote}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-tsuchikabe py-24 md:py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light text-center mb-6 uppercase">
              {faq.eyebrow}
            </p>
            <h2 className="font-serif text-xl md:text-2xl text-center text-konsumi tracking-wider font-light mb-6">
              {faq.heading}
            </h2>
            <div className="w-16 h-px bg-gold mx-auto mb-16 md:mb-20" />
          </ScrollReveal>

          <div className="space-y-6">
            {faq.items.map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="bg-white p-8 md:p-10 rounded-sm">
                  <h3 className="font-serif text-base text-konsumi tracking-wider font-light mb-4">
                    Q. {item.q}
                  </h3>
                  <p className="text-sm text-haicha leading-loose">
                    {item.a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href={cta.lineHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                {cta.lineLabel}
              </a>
              <a
                href={cta.telHref}
                className="inline-block border border-karekusa/30 text-karekusa hover:bg-karekusa hover:text-white px-8 py-4 text-xs tracking-[0.2em] transition-all duration-500"
              >
                {cta.telLabel}
              </a>
            </div>
            <p className="text-xs text-haicha/60 leading-relaxed">
              {cta.footnote}
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
