"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavChild {
  href: string;
  label: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "体験する",
    href: "/experience",
    children: [
      { href: "/experience", label: "焙煎体験予約" },
      { href: "/catering", label: "コーヒーケータリング" },
      { href: "/mobile-roasting", label: "出張焙煎体験" },
    ],
  },
  { label: "オンラインショップ", href: "/shop" },
  {
    label: "知る",
    href: "/about",
    children: [
      { href: "/about", label: "三十日珈琲について" },
      { href: "/blog", label: "ジャーナル" },
      { href: "/community", label: "コミュニティ" },
    ],
  },
  { href: "/access", label: "アクセス" },
  { href: "https://lin.ee/ihDBxM8", label: "LINE" },
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

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      {/* Gold accent line at very top */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-gold" />

      <header
        className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(213,209,201,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
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
              width={100}
              height={50}
              className="transition-opacity duration-500 h-[38px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                onMouseLeave={() => item.children && handleDropdownLeave()}
              >
                {item.children ? (
                  <button
                    className={`relative px-4 py-2 text-sm tracking-wide transition-colors duration-300 group ${
                      scrolled
                        ? "text-sumi hover:text-karekusa"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                        scrolled ? "bg-karekusa" : "bg-white"
                      }`}
                    />
                  </button>
                ) : item.href.startsWith("http") ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative px-4 py-2 text-sm tracking-wide transition-colors duration-300 group inline-block ${
                      scrolled
                        ? "text-sumi hover:text-karekusa"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                        scrolled ? "bg-karekusa" : "bg-white"
                      }`}
                    />
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={`relative px-4 py-2 text-sm tracking-wide transition-colors duration-300 group inline-block ${
                      scrolled
                        ? "text-sumi hover:text-karekusa"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                        scrolled ? "bg-karekusa" : "bg-white"
                      }`}
                    />
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 pt-3"
                      >
                        <div className="bg-white rounded-sm shadow-lg border border-usuzumi/30 py-2 min-w-[200px]">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-5 py-2.5 text-sm text-sumi hover:text-karekusa hover:bg-tsuchikabe/50 transition-colors duration-200"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Link
            href="/experience"
            className="hidden lg:inline-block px-7 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 bg-gold/90 hover:bg-gold text-white"
          >
            焙煎体験を予約する
          </Link>

          {/* Mobile Toggle - Hamburger morphing to X */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center"
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
                  className="w-10 h-10 flex items-center justify-center text-sumi"
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
                  <Link
                    href="/experience"
                    className="block w-full text-center bg-gold hover:bg-gold-dark text-white py-3.5 text-sm font-medium tracking-wide transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    焙煎体験を予約する
                  </Link>
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
                      {item.children ? (
                        <div>
                          <Link
                            href={item.href}
                            className="block py-3 text-sm font-medium text-konsumi tracking-wide border-b border-usuzumi/20"
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </Link>
                          <div className="pl-4">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block py-2.5 text-sm text-haicha hover:text-sumi transition-colors"
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-3 text-sm font-medium text-konsumi tracking-wide border-b border-usuzumi/20"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="block py-3 text-sm font-medium text-konsumi tracking-wide border-b border-usuzumi/20"
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
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
