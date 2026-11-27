import Link from "next/link";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import contactContent from "@content/pages/contact.json";

const { line } = contactContent;
const LINE_ICON_PATH = "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314";

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
  // of the brand statement, its body text and the outline button of the Instagram block).
  home: {
    section: "bg-tsuchikabe py-24 md:py-32",
    container: "max-w-4xl mx-auto px-6 md:px-8 text-center",
    body: "text-sm md:text-[15px] text-haicha leading-[2.2] tracking-wide mb-12",
    button: "inline-flex items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500",
    icon: "w-4 h-4",
  },
} as const;

/** The contact page's LINE block — its words come only from content/pages/contact.json,
 * shown on the contact page and, after the Instagram block, on the home page. */
export function LineRecommendation({ variant }: { variant: keyof typeof look }) {
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
            <svg className={style.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={LINE_ICON_PATH} />
            </svg>
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
      </div>
    </section>
  );
}
