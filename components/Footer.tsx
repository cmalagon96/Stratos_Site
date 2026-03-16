"use client";

import Image from "next/image";
import { LinkedinLogo, ArrowUpRight } from "@phosphor-icons/react";
import { navLinks } from "@/lib/constants";

const TECH_BADGES = [
  "AWS",
  "NIST 800-171",
  "HIPAA",
  "NIH dbGaP",
  "Next.js",
  "Python",
  "React",
  "PostgreSQL"
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "oklch(4% 0.005 160)",
        borderTop: "1px solid oklch(72% 0.19 160 / 0.07)"
      }}
    >
      {/* Glow line */}
      <div
        className="absolute left-0 right-0 top-0 h-[1px]"
        style={{
          background: "linear-gradient(to right, transparent, oklch(72% 0.19 160 / 0.25), transparent)"
        }}
      />

      {/* Main footer body */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:px-12">

        {/* Top section — 3 columns */}
        <div className="grid gap-12 md:grid-cols-3 lg:gap-16">

          {/* Brand column */}
          <div className="flex flex-col gap-6">
            <a href="#top" className="group inline-block" aria-label="Stratos Strategies home">
              <div className="relative h-16 w-52">
                <Image
                  src="/Stratos_Logo.png"
                  alt="Stratos Strategies"
                  fill
                  className="object-contain object-left opacity-80 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
            </a>
            <p
              className="max-w-xs text-[0.8rem] leading-[1.75] text-[oklch(32%_0.01_160)]"
            >
              Infrastructure for the Frontiers of Life and Flight. Building, implementing, and operating
              where precision is not optional.
            </p>
            {/* Social */}
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="group inline-flex items-center gap-3 transition-colors duration-200"
            >
              <div
                className="flex h-8 w-8 items-center justify-center border border-[oklch(72%_0.19_160/0.10)] bg-[oklch(72%_0.19_160/0.04)] transition-all duration-200 group-hover:border-[oklch(72%_0.19_160/0.35)] group-hover:bg-[oklch(72%_0.19_160/0.10)]"
              >
                <LinkedinLogo weight="fill" size={14} style={{ color: "oklch(45% 0.01 160)" }} className="transition-colors duration-200 group-hover:text-emerald" />
              </div>
              <span
                className="text-[0.58rem] uppercase tracking-[0.38em] text-[oklch(30%_0.01_160)] transition-colors duration-200 group-hover:text-[oklch(50%_0.01_160)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                LinkedIn
              </span>
              <ArrowUpRight weight="light" size={12} className="text-[oklch(28% 0.01 160)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[oklch(45% 0.01 160)]" />
            </a>
          </div>

          {/* Navigation */}
          <div>
            <span
              className="block text-[0.52rem] uppercase tracking-[0.45em] text-[oklch(28%_0.01_160)] mb-5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Navigation
            </span>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="group inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.2em] text-[oklch(35%_0.01_160)] transition-colors duration-200 hover:text-[oklch(65%_0.01_160)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span className="h-[1px] w-3 bg-[oklch(72%_0.19_160/0.15)] transition-all duration-300 group-hover:w-5 group-hover:bg-[oklch(72%_0.19_160/0.4)]" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack / trust */}
          <div>
            <span
              className="block text-[0.52rem] uppercase tracking-[0.45em] text-[oklch(28%_0.01_160)] mb-5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Platforms & Standards
            </span>
            <div className="flex flex-wrap gap-2">
              {TECH_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="border border-[oklch(72%_0.19_160/0.09)] bg-[oklch(72%_0.19_160/0.04)] px-3 py-1 text-[0.55rem] uppercase tracking-[0.3em] text-[oklch(36%_0.01_160)] transition-all duration-200 hover:border-[oklch(72%_0.19_160/0.22)] hover:text-[oklch(52%_0.01_160)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mt-12 h-[1px] w-full"
          style={{ background: "oklch(72% 0.19 160 / 0.05)" }}
        />

        {/* Bottom row */}
        <div className="mt-7 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <p
            className="text-[0.56rem] uppercase tracking-[0.32em] text-[oklch(24%_0.01_160)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            © {year} Stratos Strategies LLC — All rights reserved
          </p>
          <p
            className="text-[0.56rem] uppercase tracking-[0.32em] text-[oklch(22%_0.01_160)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Doral, FL — Infrastructure for the Frontiers of Life and Flight
          </p>
        </div>
      </div>
    </footer>
  );
}
