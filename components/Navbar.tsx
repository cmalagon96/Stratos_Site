"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/lib/constants";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navClasses = isScrolled
    ? "bg-[#0a1628]/90 backdrop-blur-md border-b border-[rgba(232,236,241,0.08)]"
    : "bg-transparent";

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <nav className={`transition-all duration-300 ${navClasses}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="font-display text-lg font-extrabold tracking-[0.2em] text-white">
              STRATOS
            </span>
            <span className="font-display text-xs font-normal tracking-[0.35em] text-silver-dark">
              STRATEGIES
            </span>
          </a>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="group relative font-mono text-xs uppercase tracking-[0.3em] text-silver-light transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 h-[1px] w-full origin-left scale-x-0 bg-teal-bright transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span className="relative block h-[2px] w-6 bg-silver-light">
              <span
                className={`absolute left-0 top-[-8px] h-[2px] w-6 bg-silver-light transition-transform duration-300 ${
                  menuOpen ? "translate-y-[8px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[8px] h-[2px] w-6 bg-silver-light transition-transform duration-300 ${
                  menuOpen ? "translate-y-[-8px] -rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-0 h-[2px] w-6 bg-silver-light transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a1628]/95 backdrop-blur-sm md:hidden">
          <div className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="font-mono text-sm uppercase tracking-[0.35em] text-white"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
