import type { Metadata } from "next";
import { PageHero } from "@/shared/ui/PageHero";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import content from "@content/pages/faq.json";

export const metadata: Metadata = {
  title: content.seo.title,
  description: content.seo.description,
};

export default function FaqPage() {
  return (
    <>
      <PageHero title="FAQ" subtitle="よくある質問" />

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-20 md:space-y-24">
          {content.categories.map((category, ci) => (
            <ScrollReveal key={category.title} delay={ci * 0.1}>
              <div>
                <h2 className="font-serif text-lg md:text-xl text-konsumi tracking-wider font-light mb-3">
                  {category.title}
                </h2>
                <div className="w-8 h-px bg-gold/40 mb-8" />
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <details
                      key={item.q}
                      className="bg-white rounded-sm group"
                    >
                      <summary className="text-sm text-sumi cursor-pointer tracking-wide px-6 py-5 leading-relaxed">
                        {item.q}
                      </summary>
                      <div className="px-6 pb-6">
                        <p className="text-sm text-haicha leading-[2] tracking-wide">
                          {item.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
