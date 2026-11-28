import Link from "next/link";
import type { ReactNode } from "react";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { LineIcon } from "@/shared/ui/social-accounts";
import contactContent from "@content/pages/contact.json";

const { line } = contactContent;

const look = {
  // The contact page, exactly as before (LINE green button, Instagram DM note).
  contact: {
    section: "bg-tsuchikabe py-16 md:py-20 overflow-hidden",
    container: "max-w-4xl mx-auto px-4 md:px-8 text-center",
    body: "text-haicha leading-loose mb-10",
    button: "inline-flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white px-10 py-4 text-xs tracking-[0.2em] transition-all duration-500",
    icon: "w-5 h-5",
  },
  // The home page: the same words with the home page's section rules (the 土壁 band
  // of the brand statement, its body text and the outline button of the home page).
  home: {
    section: "bg-tsuchikabe py-24 md:py-32",
    container: "max-w-4xl mx-auto px-6 md:px-8 text-center",
    body: "text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-12",
    button: "inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500",
    icon: "w-4 h-4",
  },
} as const;

/** The contact page's LINE block — its words come only from content/pages/contact.json.
 * On the home page it is the last section and also holds the Instagram accounts (`children`). */
export function LineRecommendation({ variant, children }: { variant: keyof typeof look; children?: ReactNode }) {
  const style = look[variant];
  return (
    <section className={style.section}>
      <div className={style.container}>
        <ScrollReveal>
          <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">
            {line.eyebrow}
          </p>
          <h2 className="font-serif text-xl md:text-2xl text-konsumi tracking-wider font-light mb-6">
            {line.heading}
          </h2>
          <p className={style.body}>
            {line.bodyLine1}
            <br />
            {line.bodyLine2}
          </p>
          <a
            href={line.href}
            data-journey-surface="contact"
            target="_blank"
            rel="noopener noreferrer"
            className={style.button}
          >
            <LineIcon className={style.icon} />
            {line.buttonLabel}
          </a>
          {variant === "home" ? (
            <p className="mt-8">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center text-xs tracking-[0.15em] text-karekusa underline decoration-karekusa/30 underline-offset-4 hover:decoration-karekusa transition-colors duration-300"
              >
                {line.formLinkLabel}
              </Link>
            </p>
          ) : (
            <p className="text-xs text-haicha/60 mt-6">{line.instagramNote}</p>
          )}
        </ScrollReveal>
        {children}
      </div>
    </section>
  );
}
