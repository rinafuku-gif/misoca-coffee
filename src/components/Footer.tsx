import Link from "next/link";

const footerLinks = [
  {
    title: "体験する",
    links: [
      { href: "/experience", label: "焙煎体験・見学予約" },
      { href: "/catering", label: "ケータリング依頼" },
    ],
  },
  {
    title: "知る",
    links: [
      { href: "/about", label: "ブランドストーリー" },
      { href: "/blog", label: "ブログ" },
      { href: "/access", label: "アクセス" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "コーヒーを買う",
    links: [
      { href: "/menu", label: "メニュー" },
      { href: "/subscription", label: "定期便" },
    ],
  },
  {
    title: "つながる",
    links: [
      { href: "/community", label: "コミュニティ" },
      { href: "/contact", label: "お問い合わせ" },
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="font-serif text-xl font-bold mb-3">三十日珈琲</p>
            <p className="text-sm text-ainezu leading-relaxed">
              〒409-0112
              <br />
              山梨県上野原市上野原
            </p>
            <p className="text-sm text-ainezu mt-2">info@misoca-coffee.jp</p>
          </div>

          {/* Nav Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="font-medium text-sm mb-3">{group.title}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ainezu hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal & Copyright */}
        <div className="mt-10 pt-6 border-t border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-ainezu hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-ainezu">
              © 2026 三十日珈琲 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
