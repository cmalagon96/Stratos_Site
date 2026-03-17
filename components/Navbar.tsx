"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { navLinks, pageNavLinks } from "@/lib/constants";
import { AuthButtons, MobileAuthButtons } from "@/components/AuthButtons";

// On the home page we highlight sections via IntersectionObserver.
// On any other page we highlight the active route via usePathname.

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isScrolled, setIsScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [activeSection, setActiveSection] = useState(navLinks[0]?.id ?? "");

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef      = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Home-page: IntersectionObserver for hash-section highlighting
  useEffect(() => {
    if (!isHome) return;
    const ids     = navLinks.map((l) => l.id);
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  // Close menu + return focus
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    requestAnimationFrame(() => hamburgerRef.current?.focus());
  }, []);

  // Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  // Focus trap inside mobile menu
  useEffect(() => {
    if (!menuOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const sel  = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(menu.querySelectorAll<HTMLElement>(sel));

    getFocusable()[0]?.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (els.length === 0) return;
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    menu.addEventListener("keydown", trapFocus);
    return () => menu.removeEventListener("keydown", trapFocus);
  }, [menuOpen]);

  // Helpers: is a given page nav link active?
  // pathname can be null when rendered outside the Next.js App Router context
  // (e.g. in test environments or during static pre-rendering).
  const isPageLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navBg = isScrolled
    ? "bg-[oklch(7%_0.008_160/0.92)] backdrop-blur-2xl border-b border-[oklch(72%_0.19_160/0.08)]"
    : "bg-transparent";

  // On home page render hash-link items; on other pages render page links
  const desktopLinks = isHome ? null : (
    pageNavLinks.map((link) => {
      const active = isPageLinkActive(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          aria-current={active ? "page" : undefined}
          className="group relative px-4 py-2"
        >
          <span
            className={`text-[0.6rem] font-mono uppercase tracking-[0.38em] transition-colors duration-200 ${
              active
                ? "text-emerald"
                : "text-[oklch(40%_0.01_160)] group-hover:text-[oklch(72%_0.01_160)]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {link.label}
          </span>
          {active && (
            <m.span
              layoutId="nav-active"
              className="absolute bottom-0 left-4 right-4 h-[1px] bg-emerald"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      );
    })
  );

  const homeDesktopLinks = isHome ? (
    navLinks.map((link) => {
      const isActive = activeSection === link.id;
      return (
        <a
          key={link.id}
          href={`#${link.id}`}
          aria-current={isActive ? "page" : undefined}
          className="group relative px-4 py-2"
        >
          <span
            className={`text-[0.6rem] font-mono uppercase tracking-[0.38em] transition-colors duration-200 ${
              isActive
                ? "text-emerald"
                : "text-[oklch(40%_0.01_160)] group-hover:text-[oklch(72%_0.01_160)]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {link.label}
          </span>
          {isActive && (
            <m.span
              layoutId="nav-active"
              className="absolute bottom-0 left-4 right-4 h-[1px] bg-emerald"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </a>
      );
    })
  ) : null;

  // Mobile menu items — on home use hash links, elsewhere use page links
  const mobileMenuItems = isHome ? navLinks.map((link) => ({
    key: link.id,
    href: `#${link.id}`,
    label: link.label,
    isPage: false,
  })) : pageNavLinks.map((link) => ({
    key: link.href,
    href: link.href,
    label: link.label,
    isPage: true,
  }));

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <nav
        className={`transition-all duration-500 ${navBg}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-12">

          {/* Logo — always links to home */}
          <Link href="/" className="group shrink-0" aria-label="Stratos Strategies home">
            <div className="relative h-16 w-64 md:h-20 md:w-80">
              {/* P0-06: sizes prop — 80% smaller image on mobile */}
              <Image
                src="/Stratos_Logo.png"
                alt="Stratos Strategies"
                fill
                sizes="(max-width: 768px) 256px, 320px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {homeDesktopLinks}
            {desktopLinks}

            {/* Auth buttons -- login/signup or user dropdown */}
            <div className="ml-2 flex items-center gap-2" aria-label="Account actions">
              <AuthButtons />
            </div>

            {/* CTA -- only on home page */}
            {isHome && (
              <a
                href="#contact"
                className="ml-4 inline-flex items-center gap-2 rounded-none border border-[oklch(72%_0.19_160/0.35)] bg-[oklch(72%_0.19_160/0.06)] px-5 py-2 transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.80)] hover:bg-[oklch(72%_0.19_160/0.12)] hover:shadow-[0_0_20px_oklch(72%_0.19_160/0.18)]"
              >
                <span
                  className="text-[0.58rem] uppercase tracking-[0.38em] text-emerald"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Contact
                </span>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <div className="flex flex-col gap-[5px]" aria-hidden="true">
              <span
                className={`block h-[1px] w-5 bg-[oklch(65%_0.01_160)] origin-center transition-all duration-300 ${
                  menuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1px] w-5 bg-[oklch(65%_0.01_160)] transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-x-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[1px] w-5 bg-[oklch(65%_0.01_160)] origin-center transition-all duration-300 ${
                  menuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {menuOpen && (
          <m.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center md:hidden"
            style={{ background: "oklch(5% 0.006 160 / 0.97)" }}
          >
            <div className="pointer-events-none absolute inset-0 grid-texture opacity-30" />

            <div className="relative z-10 flex flex-col items-center gap-8">
              {mobileMenuItems.map((item, i) =>
                item.isPage ? (
                  <m.div key={item.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 + 0.05 }}>
                    <Link
                      href={item.href}
                      className="text-2xl font-black uppercase tracking-[0.3em] text-[oklch(55%_0.01_160)] transition-colors duration-200 hover:text-emerald"
                      style={{ fontWeight: 900 }}
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  </m.div>
                ) : (
                  <m.a
                    key={item.key}
                    href={item.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 + 0.05 }}
                    className="text-2xl font-black uppercase tracking-[0.3em] text-[oklch(55%_0.01_160)] transition-colors duration-200 hover:text-emerald"
                    style={{ fontWeight: 900 }}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </m.a>
                )
              )}

              {/* Auth buttons in mobile menu */}
              <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (isHome ? navLinks.length : pageNavLinks.length) * 0.07 + 0.1 }}
                className="mt-4"
              >
                <MobileAuthButtons onClose={closeMenu} />
              </m.div>

              {isHome && (
                <m.a
                  href="#contact"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.07 + 0.2 }}
                  className="mt-4 inline-flex items-center border border-[oklch(72%_0.19_160/0.45)] px-8 py-3 text-xs uppercase tracking-[0.38em] text-emerald"
                  onClick={closeMenu}
                >
                  Start a Project
                </m.a>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[oklch(72%_0.19_160/0.35)] to-transparent" />
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
