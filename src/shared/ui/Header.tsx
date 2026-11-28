"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/#about", label: "私たちについて" },
  { href: "/#services", label: "サービス" },
  { href: "/#news", label: "ニュース・コラム" },
  { href: "/access", label: "アクセス" },
  { href: "/#contact", label: "お問い合わせ" },
];

const sidebarVariants = {
  closed: {
    x: "100%",
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
  open: {
    x: 0,
    transition: { type: "spring" as const, damping: 30, stiffness: 300 },
  },
};

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const mobileItemVariants = {
  closed: { opacity: 0, x: 30 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

/** ヘッダーの2つのボタン。焙煎体験（金の塗り）は今までと同じ見た目・位置のまま、
 * その手前に同じ大きさ・同じ文字組みのオンラインショップ（枯草色の塗り）を置いて同じ格にする。
 * 金は「最も価値のある情報だけ」（DESIGN.md）なので2つ目には使わない。 */
export const headerCtaCopy = { shop: "オンラインショップ", experience: "焙煎体験を予約する" } as const;
const ctaLook = {
  bar: {
    shop: "inline-flex min-h-11 items-center whitespace-nowrap px-3 xl:px-5 text-[13px] xl:text-sm font-medium tracking-wide transition-all duration-300 bg-karekusa/90 hover:bg-karekusa text-white",
    experience: "inline-flex min-h-11 items-center whitespace-nowrap px-3 xl:px-5 text-[13px] xl:text-sm font-medium tracking-wide transition-all duration-300 bg-gold/90 hover:bg-gold text-white",
  },
  drawer: {
    shop: "block w-full text-center bg-karekusa hover:bg-karekusa-dark text-white py-3.5 text-sm font-medium tracking-wide transition-colors",
    experience: "block w-full text-center bg-gold hover:bg-gold-dark text-white py-3.5 text-sm font-medium tracking-wide transition-colors",
  },
} as const;
export function HeaderCtas({ pathname, variant, onNavigate }: { pathname: string | null; variant: "bar" | "drawer"; onNavigate?: () => void }) {
  const look = ctaLook[variant];
  const experience = pathname === "/experience"
    ? <a href="#reservation" className={look.experience} onClick={onNavigate}>{headerCtaCopy.experience}</a>
    : <Link href="/experience#reservation" className={look.experience} onClick={onNavigate}>{headerCtaCopy.experience}</Link>;
  const shop = <Link href="/shop" className={look.shop} onClick={onNavigate}>{headerCtaCopy.shop}</Link>;
  return variant === "bar"
    ? <div className="hidden shrink-0 items-center gap-2 xl:gap-3 lg:flex">{shop}{experience}</div>
    : <div className="space-y-3">{experience}{shop}</div>;
}

// Pages without dark hero images need the header to always show dark text
const LIGHT_BG_PAGES = ["/shop", "/shop/gift-ticket", "/shop/hario-switch", "/shop/success"];

export function Header() {
  const pathname = usePathname();
  const forceScrolled = LIGHT_BG_PAGES.includes(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(forceScrolled);

  const handleScroll = useCallback(() => {
    setScrolled(forceScrolled || window.scrollY > 20);
  }, [forceScrolled]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // The first reading of the scroll position waits for the next frame (no setState inside the effect body).
    const frame = requestAnimationFrame(handleScroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", handleScroll); };
  }, [handleScroll]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 pt-[2px] -mb-[82px] transition-colors duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(213,209,201,0.5)]"
            : "bg-transparent"
        }`}
      >
        {/* Keep the accent and navigation in one sticky surface on iPad WebKit.
            The negative margin preserves the existing hero overlay without fixed-position drift. */}
        <div aria-hidden="true" className="absolute top-0 inset-x-0 h-[2px] bg-gold" />
        <div className="max-w-7xl mx-auto px-6 xl:px-8 h-20 flex items-center justify-between gap-3 xl:gap-5">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 xl:gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/images/logo-circle-green.jpg"
                alt="三十日珈琲 ロゴ"
                width={44}
                height={44}
                className={`scale-[1.35] transition-opacity duration-500 ${
                  scrolled ? "opacity-100" : "opacity-0"
                }`}
              />
              <Image
                src="/images/logo-circle-white.jpg"
                alt="三十日珈琲 ロゴ"
                width={44}
                height={44}
                className={`scale-[1.6] absolute top-0 left-0 transition-opacity duration-500 ${
                  scrolled ? "opacity-0" : "opacity-100"
                }`}
              />
            </div>
            <Image
              src={scrolled ? "/images/logo-text-dark.png" : "/images/logo-text-white.png"}
              alt="三十日珈琲 Shared Roasting"
              width={130}
              height={48}
              className="transition-opacity duration-500 h-10 xl:h-11 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex shrink-0 items-center gap-1.5 xl:gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`relative inline-flex min-h-11 items-center whitespace-nowrap px-2 xl:px-3 text-[13px] xl:text-sm tracking-wide transition-colors duration-300 group ${
                  scrolled
                    ? "text-sumi hover:text-karekusa"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                    scrolled ? "bg-karekusa" : "bg-white"
                  }`}
                />
              </a>
            ))}
          </nav>

          {/* Desktop CTA: オンラインショップ + 焙煎体験 */}
          <HeaderCtas pathname={pathname} variant="bar" />

          {/* Mobile Toggle - Hamburger morphing to X */}
          <button
            className="lg:hidden relative w-11 h-11 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <div className="relative w-6 h-5">
              <motion.span
                animate={
                  mobileOpen
                    ? { rotate: 45, y: 8, backgroundColor: scrolled ? "#2A2A2A" : "#ffffff" }
                    : { rotate: 0, y: 0, backgroundColor: scrolled ? "#2A2A2A" : "#ffffff" }
                }
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 w-full h-[1.5px] block origin-center"
              />
              <motion.span
                animate={
                  mobileOpen
                    ? { opacity: 0, scaleX: 0 }
                    : { opacity: 1, scaleX: 1 }
                }
                transition={{ duration: 0.2 }}
                style={{ backgroundColor: scrolled ? "#2A2A2A" : "#ffffff" }}
                className="absolute top-[8px] left-0 w-full h-[1.5px] block origin-center"
              />
              <motion.span
                animate={
                  mobileOpen
                    ? { rotate: -45, y: -8, backgroundColor: scrolled ? "#2A2A2A" : "#ffffff" }
                    : { rotate: 0, y: 0, backgroundColor: scrolled ? "#2A2A2A" : "#ffffff" }
                }
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 w-full h-[1.5px] block origin-center"
              />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile Menu - Slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[380px] bg-kominka-white lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 h-20 border-b border-usuzumi/30">
                <div className="flex flex-col">
                  <Image
                    src="/images/logo-text-dark.png"
                    alt="三十日珈琲 Shared Roasting"
                    width={100}
                    height={50}
                    className="h-[38px] w-auto"
                  />
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="メニューを閉じる"
                  className="w-11 h-11 flex items-center justify-center text-sumi"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4L16 16M16 4L4 16" />
                  </svg>
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto py-8 px-6">
                {/* CTA */}
                <motion.div
                  custom={0}
                  variants={mobileItemVariants}
                  initial="closed"
                  animate="open"
                >
                  <HeaderCtas pathname={pathname} variant="drawer" onNavigate={() => setMobileOpen(false)} />
                </motion.div>

                {/* Nav Items */}
                <div className="mt-8 space-y-1">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i + 1}
                      variants={mobileItemVariants}
                      initial="closed"
                      animate="open"
                    >
                      <a
                        href={item.href}
                        className="block py-3 text-sm font-medium text-konsumi tracking-wide border-b border-usuzumi/20"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-6 border-t border-usuzumi/20">
                <p className="text-xs text-haicha leading-relaxed">
                  〒409-0115 山梨県上野原市松留939
                </p>
                <p className="text-xs text-haicha mt-1">misocacoffee@gmail.com</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
