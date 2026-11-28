import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { InstagramIcon, instagramAccounts } from "@/shared/ui/social-accounts";
import homeContent from "@content/pages/home.json";

/** The home page's Instagram part, inside the contact section: the home page's own words
 * (content/pages/home.json) and both accounts — 三十日珈琲 and the coffee stand. */
export function InstagramAccounts() {
  return (
    <ScrollReveal delay={0.1}>
      <div className="mt-16 md:mt-20">
        <div aria-hidden="true" className="flex items-center justify-center gap-6 mb-12">
          <span className="w-12 h-px bg-gold/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
          <span className="w-12 h-px bg-gold/40" />
        </div>
        <p className="text-[11px] tracking-[0.5em] text-gold/70 font-light mb-6 uppercase">Instagram</p>
        <p className="font-serif text-konsumi text-base md:text-lg tracking-wider leading-[2.4] font-light mb-10">
          {homeContent.instagram.bodyLine1}
          <br />
          {homeContent.instagram.bodyLine2}
        </p>
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
          {instagramAccounts.map((account) => (
            <li key={account.key} className="flex flex-col items-center">
              <p className="text-xs text-haicha tracking-[0.15em] mb-3">{account.label}</p>
              <a
                href={account.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${account.label}のInstagram ${account.handle}（新しいタブで開きます）`}
                className="inline-flex min-h-11 items-center gap-3 border border-karekusa/30 text-karekusa text-xs tracking-[0.15em] px-7 py-3.5 hover:bg-karekusa hover:text-white transition-all duration-500"
              >
                <InstagramIcon className="w-4 h-4" />
                {account.handle}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
}
