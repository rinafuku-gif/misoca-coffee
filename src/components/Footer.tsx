import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  {
    title: "体験する",
    links: [
      { href: "/experience", label: "焙煎体験予約" },
      { href: "/catering", label: "コーヒーケータリング" },
      { href: "/mobile-roasting", label: "出張焙煎体験" },
    ],
  },
  {
    title: "コーヒーを買う",
    links: [
      { href: "/shop", label: "オンラインショップ" },
      { href: "/stand", label: "コーヒースタンド" },
    ],
  },
  {
    title: "知る",
    links: [
      { href: "/about", label: "三十日珈琲について" },
      { href: "/access", label: "アクセス" },
      { href: "/faq", label: "よくある質問" },
    ],
  },
  {
    title: "つながる",
    links: [
      { href: "https://lin.ee/ihDBxM8", label: "LINE公式アカウント" },
      { href: "/community", label: "コミュニティ" },
      { href: "https://luma.com/misoca_coffee", label: "イベント情報" },
      { href: "/contact", label: "お問い合わせフォーム" },
    ],
  },
];

const legalLinks = [
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/tokushoho", label: "特定商取引法に基づく表記" },
];

export function Footer() {
  return (
    <footer className="bg-konsumi text-white">
      {/* Subtle top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/logo-circle-white.jpg"
                  alt="三十日珈琲 ロゴ"
                  width={48}
                  height={48}
                  className="scale-[1.6]"
                />
              </div>
              <div>
                <p className="font-serif text-2xl tracking-wide font-light">三十日珈琲</p>
                <p className="font-[family-name:var(--font-display)] text-[11px] tracking-[0.25em] text-ainezu uppercase mt-0.5">
                  Shared Roasting
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-ainezu leading-relaxed">
              <p>
                〒409-0115
                <br />
                山梨県上野原市松留939
              </p>
              <p>
                <a
                  href="mailto:misocacoffee@gmail.com"
                  className="hover:text-white transition-colors duration-300"
                >
                  misocacoffee@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Nav Groups */}
          {footerLinks.map((group) => (
            <div key={group.title} className="lg:col-span-2">
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-white/50 mb-4">
                {group.title}
              </p>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ainezu hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-ainezu hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Right Column - Social & Newsletter */}
          <div className="lg:col-span-1 hidden lg:block" />
        </div>

        {/* Social & Newsletter Row */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Instagram */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/misoca_coffee/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-ainezu hover:text-white transition-colors duration-300 group"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                <span className="tracking-wide">@misoca_coffee</span>
              </a>
            </div>

            {/* Newsletter placeholder */}
            <a
              href="https://my.prairie.cards/u/misocacoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ainezu/60 hover:text-ainezu tracking-wide transition-colors duration-300"
            >
              リンクまとめ（Prairie Cards）
            </a>
          </div>
        </div>

        {/* Divider pattern */}
        <div className="mt-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <div className="flex gap-1.5">
            <div className="w-1 h-1 rounded-full bg-gold/40" />
            <div className="w-1 h-1 rounded-full bg-gold/25" />
            <div className="w-1 h-1 rounded-full bg-gold/15" />
          </div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Legal & Copyright */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-ainezu/60 hover:text-ainezu transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-ainezu/50 tracking-wide">
              &copy; 2026 三十日珈琲 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
