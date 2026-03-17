"use client";

import Image from "next/image";
import Link from "next/link";
import { LinkedinLogo, ArrowUpRight } from "@phosphor-icons/react";

const TECH_BADGES = [
  "AWS",
  "NIST 800-171",
  "HIPAA",
  "NIH dbGaP",
  "Next.js",
  "Python",
  "React",
  "PostgreSQL",
];

const PRODUCT_LINKS = [
  { href: "/products/billflow",  label: "BillFlow" },
  { href: "/products/rosabio",   label: "RosaBio" },
  { href: "/products/genthrust", label: "GenThrust" },
  { href: "/products",           label: "All Products" },
];

const COMPANY_LINKS = [
  { href: "/about",    label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/pricing",  label: "Pricing" },
  { href: "/docs",     label: "Documentation" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms",   label: "Terms of Service" },
];

function FooterLinkList({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <span
        className="block text-[0.52rem] uppercase tracking-[0.45em] text-[oklch(28%_0.01_160)] mb-5"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {heading}
      </span>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.18em] text-[oklch(35%_0.01_160)] transition-colors duration-200 hover:text-[oklch(62%_0.01_160)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span
                className="h-[1px] w-3 bg-[oklch(72%_0.19_160/0.15)] transition-all duration-300 group-hover:w-5 group-hover:bg-[oklch(72%_0.19_160/0.4)]"
                aria-hidden="true"
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "oklch(4% 0.005 160)",
        borderTop: "1px solid oklch(72% 0.19 160 / 0.07)",
      }}
    >
      {/* Glow line */}
      <div
        className="absolute left-0 right-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(to right, transparent, oklch(72% 0.19 160 / 0.25), transparent)",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:px-12">
        {/* Top section */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr] lg:gap-10 xl:gap-16">

          {/* Brand column */}
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
            <a href="#top" className="group inline-block" aria-label="Stratos Strategies home">
              <div className="relative h-14 w-44">
                <Image
                  src="/Stratos_Logo.png"
                  alt="Stratos Strategies"
                  fill
                  className="object-contain object-left opacity-80 transition-opacity duration-200 group-hover:opacity-100"
                />
              </div>
            </a>
            <p className="max-w-xs text-[0.78rem] leading-[1.78] text-[oklch(30%_0.01_160)]">
              Infrastructure for the Frontiers of Life and Flight. Building,
              implementing, and operating where precision is not optional.
            </p>
            <a
              href="https://www.linkedin.com/company/stratos-strategies"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Stratos Strategies on LinkedIn"
              className="group inline-flex items-center gap-3 transition-colors duration-200"
            >
              <div
                className="flex h-8 w-8 items-center justify-center border border-[oklch(72%_0.19_160/0.10)] bg-[oklch(72%_0.19_160/0.04)] transition-all duration-200 group-hover:border-[oklch(72%_0.19_160/0.35)] group-hover:bg-[oklch(72%_0.19_160/0.10)]"
              >
                <LinkedinLogo
                  weight="fill"
                  size={14}
                  className="text-[oklch(45%_0.01_160)] transition-colors duration-200 group-hover:text-emerald"
                />
              </div>
              <span
                className="text-[0.58rem] uppercase tracking-[0.38em] text-[oklch(30%_0.01_160)] transition-colors duration-200 group-hover:text-[oklch(50%_0.01_160)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                LinkedIn
              </span>
              <ArrowUpRight
                weight="light"
                size={12}
                className="text-[oklch(28%_0.01_160)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[oklch(45%_0.01_160)]"
              />
            </a>
          </div>

          <FooterLinkList heading="Products" links={PRODUCT_LINKS} />
          <FooterLinkList heading="Company" links={COMPANY_LINKS} />

          {/* Platforms & Standards */}
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
                  className="border border-[oklch(72%_0.19_160/0.09)] bg-[oklch(72%_0.19_160/0.04)] px-3 py-1 text-[0.52rem] uppercase tracking-[0.28em] text-[oklch(34%_0.01_160)] transition-all duration-200 hover:border-[oklch(72%_0.19_160/0.22)] hover:text-[oklch(50%_0.01_160)]"
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
        <div className="mt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p
            className="text-[0.55rem] uppercase tracking-[0.32em] text-[oklch(24%_0.01_160)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            &copy; {year} Stratos Strategies LLC — All rights reserved
          </p>

          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.52rem] uppercase tracking-[0.3em] text-[oklch(22%_0.01_160)] transition-colors duration-200 hover:text-[oklch(40%_0.01_160)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p
            className="text-[0.52rem] uppercase tracking-[0.32em] text-[oklch(20%_0.01_160)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Doral, FL
          </p>
        </div>
      </div>
    </footer>
  );
}
