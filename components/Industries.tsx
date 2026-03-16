"use client";

import { motion } from "framer-motion";
import { industries } from "@/lib/constants";
import { Dna, AirplaneTilt, ArrowRight, type Icon as PhosphorIcon } from "@phosphor-icons/react";

type IndustryConfig = {
  Icon: PhosphorIcon;
  bgLabel: string;
  bullets: string[];
  stat: { value: string; label: string };
};

const industryConfig: Record<string, IndustryConfig> = {
  biotech: {
    Icon: Dna,
    bgLabel: "BIO",
    bullets: [
      "NIH dbGaP security frameworks",
      "NIST 800-171 compliance engineering",
      "DNA methylation analysis pipelines",
      "Controlled-access genomic environments",
      "Cancer research computing clusters"
    ],
    stat: { value: "TB+", label: "Genomic data managed" }
  },
  aviation: {
    Icon: AirplaneTilt,
    bgLabel: "AIR",
    bullets: [
      "MRO coordination platforms",
      "Repair order management systems",
      "Vendor & parts inventory automation",
      "ERP integration & data migration",
      "FAA-aligned documentation workflows"
    ],
    stat: { value: "17+", label: "AWS regions deployed" }
  }
};

export default function Industries() {
  return (
    <section
      id="industries"
      className="relative overflow-hidden scroll-mt-20"
      style={{ background: "oklch(7% 0.008 160)" }}
    >
      {/* Section header */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col gap-0"
        >
          <span className="section-label">Verticals</span>
          <h2
            className="mt-5 text-[2.5rem] uppercase leading-[0.91] tracking-[0.015em] text-white md:text-[3.4rem]"
            style={{ fontWeight: 900 }}
          >
            Deep expertise where{" "}
            <span style={{ color: "oklch(72% 0.19 160)" }}>precision matters.</span>
          </h2>
        </motion.div>
      </div>

      {/* Industry panels */}
      <div className="mt-16 flex flex-col">
        {industries.map((industry, industryIndex) => {
          const config = industryConfig[industry.id] || industryConfig.biotech;
          const { Icon, bgLabel, bullets, stat } = config;
          const isEven = industryIndex % 2 === 0;

          return (
            <motion.div
              key={industry.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border-t border-[oklch(72%_0.19_160/0.07)]"
            >
              {/* P2-04: Use flex + order/flex-row-reverse instead of direction:rtl,
                  which caused text alignment and list-marker rendering issues. */}
              <div
                className={`mx-auto flex max-w-7xl flex-col gap-0 px-6 py-16 md:px-12 lg:gap-16 lg:py-20 ${
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content side */}
                <div className="relative z-10 flex flex-1 flex-col gap-7">
                  {/* Icon + label row */}
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center border border-[oklch(72%_0.19_160/0.18)] bg-[oklch(72%_0.19_160/0.07)] transition-all duration-300 group-hover:border-[oklch(72%_0.19_160/0.35)] group-hover:bg-[oklch(72%_0.19_160/0.12)]"
                    >
                      <Icon weight="bold" size={20} style={{ color: "oklch(72% 0.19 160)" }} />
                    </div>
                    <div
                      className="h-[1px] flex-1 max-w-[48px] transition-all duration-500 group-hover:max-w-[80px]"
                      style={{ background: "oklch(72% 0.19 160 / 0.25)" }}
                    />
                    <span
                      className="text-[0.55rem] uppercase tracking-[0.4em] text-[oklch(38%_0.01_160)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {`Vertical / ${String(industryIndex + 1).padStart(2, "0")}`}
                    </span>
                  </div>

                  <h3
                    className="text-[1.8rem] uppercase leading-[0.95] tracking-[0.02em] text-white md:text-[2.2rem]"
                    style={{ fontWeight: 800 }}
                  >
                    {industry.title}
                  </h3>

                  <p className="text-[0.9rem] leading-[1.82] text-[oklch(42%_0.01_160)]">
                    {industry.description}
                  </p>

                  {/* Bullet list */}
                  <ul className="flex flex-col gap-2.5">
                    {bullets.map((bullet, bi) => (
                      <motion.li
                        key={bi}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: bi * 0.06 + 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <span
                          className="h-[1px] w-4 flex-shrink-0"
                          style={{ background: "oklch(72% 0.19 160 / 0.4)" }}
                        />
                        <span
                          className="text-[0.78rem] uppercase tracking-[0.2em] text-[oklch(48%_0.01_160)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {bullet}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA link */}
                  <a
                    href="#contact"
                    className="group/cta inline-flex items-center gap-2 transition-colors duration-200"
                  >
                    <span
                      className="text-[0.62rem] uppercase tracking-[0.38em] text-[oklch(50%_0.01_160)] transition-colors duration-200 group-hover/cta:text-emerald"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Discuss Your Project
                    </span>
                    <ArrowRight
                      weight="light"
                      size={14}
                      className="transition-all duration-300 group-hover/cta:translate-x-1"
                      style={{ color: "oklch(50% 0.01 160)" }}
                    />
                  </a>
                </div>

                {/* Visual / stat side */}
                <div className="relative flex flex-1 items-center justify-center">
                  {/* Large background text */}
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
                    aria-hidden="true"
                  >
                    <span
                      className="text-[10rem] font-black uppercase leading-none tracking-[-0.04em] text-[oklch(72%_0.19_160/0.03)] transition-all duration-700 group-hover:text-[oklch(72%_0.19_160/0.055)] md:text-[14rem]"
                      style={{ fontWeight: 900 }}
                    >
                      {bgLabel}
                    </span>
                  </div>

                  {/* Stat card */}
                  <div
                    className="relative z-10 border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(10%_0.010_160/0.9)] p-8 backdrop-blur-sm transition-all duration-400 group-hover:border-[oklch(72%_0.19_160/0.25)] group-hover:shadow-[0_0_40px_oklch(72%_0.19_160/0.08)]"
                    style={{ minWidth: 180 }}
                  >
                    {/* Stripe texture */}
                    <div className="pointer-events-none absolute inset-0 stripe-texture opacity-50" />
                    <div className="relative z-10 text-center">
                      <span
                        className="block text-[3.5rem] font-black leading-none"
                        style={{
                          color: "oklch(72% 0.19 160)",
                          fontWeight: 900,
                          textShadow: "0 0 40px oklch(72% 0.19 160 / 0.25)"
                        }}
                      >
                        {stat.value}
                      </span>
                      <span
                        className="mt-2 block text-[0.55rem] uppercase tracking-[0.38em] text-[oklch(40%_0.01_160)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom border */}
      <div
        className="h-[1px] w-full"
        style={{ background: "oklch(72% 0.19 160 / 0.06)" }}
      />
    </section>
  );
}
