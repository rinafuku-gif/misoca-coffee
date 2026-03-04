"use client";

import Link from "next/link";
import { useState } from "react";

const navGroups = [
  {
    label: "体験する",
    items: [
      { href: "/experience", label: "焙煎体験・見学予約" },
      { href: "/catering", label: "ケータリング" },
    ],
  },
  {
    label: "知る",
    items: [
      { href: "/about", label: "ブランドストーリー" },
      { href: "/blog", label: "ブログ" },
      { href: "/access", label: "アクセス" },
    ],
  },
  {
    label: "コーヒーを買う",
    items: [
      { href: "/menu", label: "メニュー" },
      { href: "/subscription", label: "定期便" },
    ],
  },
  {
    label: "つながる",
    items: [
      { href: "/community", label: "コミュニティ" },
      { href: "/contact", label: "お問い合わせ" },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-usuzumi">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-konsumi">
          三十日珈琲
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navGroups.map((group) => (
            <div key={group.label} className="relative group">
              <button className="text-sm text-sumi hover:text-karekusa transition-colors py-2">
                {group.label}
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="bg-white rounded shadow-lg border border-usuzumi py-2 min-w-[180px]">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-sumi hover:bg-tsuchikabe transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-sumi"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="メニューを開く"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="lg:hidden bg-white border-t border-usuzumi">
          <div className="px-4 py-3">
            <Link
              href="/experience"
              className="block w-full text-center bg-gold text-white py-3 rounded mb-4 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              焙煎体験を予約する
            </Link>
          </div>
          {navGroups.map((group) => (
            <div key={group.label}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-3 text-sm text-sumi border-t border-usuzumi/50 hover:bg-tsuchikabe"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
