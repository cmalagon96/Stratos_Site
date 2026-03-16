"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudArrowUp,
  ShieldCheckered,
  Code,
  Lightning,
  AirplaneTilt,
  ArrowRight,
  type Icon as PhosphorIcon
} from "@phosphor-icons/react";
import { services } from "@/lib/constants";

const iconMap: Record<string, PhosphorIcon> = {
  cloud:      CloudArrowUp,
  compliance: ShieldCheckered,
  fullstack:  Code,
  automation: Lightning,
  aviation:   AirplaneTilt
};

export default function Services() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      id="services-list"
      className="relative overflow-hidden py-32 scroll-mt-20"
      style={{ background: "oklch(10% 0.010 160)" }}
    >
      {/* Ambient bloom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 35% at 50% 0%, oklch(72% 0.19 160 / 0.035) 0%, transparent 65%)"
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">

        {/* Header */}
        <motion.div
          className="mb-16 grid gap-8 lg:grid-cols-[1fr_auto]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <span className="section-label">What We Do</span>
            <h2
              className="mt-5 text-[2.5rem] uppercase leading-[0.91] tracking-[0.015em] text-white md:text-[3.4rem]"
              style={{ fontWeight: 900 }}
            >
              End-to-end technical strategy,{" "}
              <span style={{ color: "oklch(72% 0.19 160)" }}>
                from infra to application.
              </span>
            </h2>
          </div>
          <div className="hidden flex-col justify-end lg:flex">
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 border border-[oklch(72%_0.19_160/0.25)] bg-[oklch(72%_0.19_160/0.05)] px-6 py-3 transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.65)] hover:bg-[oklch(72%_0.19_160/0.10)]"
            >
              <span
                className="text-[0.58rem] uppercase tracking-[0.38em] text-emerald"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Start a Project
              </span>
              <ArrowRight weight="light" size={14} className="text-emerald transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>

        {/* Service list — accordion-style */}
        <div
          className="flex flex-col"
          style={{ borderTop: "1px solid oklch(72% 0.19 160 / 0.07)" }}
        >
          {services.map((service, index) => {
            const Icon = iconMap[service.id] || CloudArrowUp;
            const isActive = activeId === service.id;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="group relative"
                style={{ borderBottom: "1px solid oklch(72% 0.19 160 / 0.07)" }}
              >
                {/* Hover left bar */}
                <div
                  className="absolute left-0 top-0 h-full w-[2px] origin-top transition-all duration-400"
                  style={{
                    background: "oklch(72% 0.19 160 / 0.6)",
                    transform: isActive ? "scaleY(1)" : "scaleY(0)",
                    transformOrigin: "top"
                  }}
                />

                {/* P1-06: aria-controls links the button to its panel region */}
                <button
                  type="button"
                  id={`service-btn-${service.id}`}
                  className="flex w-full items-center gap-5 px-0 py-6 text-left transition-all duration-200 lg:pl-2"
                  onClick={() => setActiveId(isActive ? null : service.id)}
                  aria-expanded={isActive}
                  aria-controls={`service-panel-${service.id}`}
                >
                  {/* Index */}
                  <span
                    className="w-8 flex-shrink-0 text-[0.52rem] uppercase tracking-[0.32em] text-[oklch(28%_0.01_160)] transition-colors duration-300 group-hover:text-[oklch(45%_0.01_160)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Icon */}
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center border transition-all duration-300"
                    style={{
                      background: isActive ? "oklch(72% 0.19 160 / 0.12)" : "oklch(72% 0.19 160 / 0.05)",
                      borderColor: isActive ? "oklch(72% 0.19 160 / 0.35)" : "oklch(72% 0.19 160 / 0.12)"
                    }}
                  >
                    <Icon
                      weight="bold"
                      size={15}
                      style={{ color: isActive ? "oklch(72% 0.19 160)" : "oklch(50% 0.19 160 / 0.7)" }}
                    />
                  </div>

                  {/* Title */}
                  <span
                    className="flex-1 text-[1rem] uppercase tracking-[0.04em] transition-colors duration-200"
                    style={{
                      fontWeight: 700,
                      color: isActive ? "oklch(92% 0.01 160)" : "oklch(62% 0.01 160)"
                    }}
                  >
                    {service.title}
                  </span>

                  {/* Expand indicator */}
                  <span
                    className="flex-shrink-0 h-5 w-5 flex items-center justify-center border border-[oklch(72%_0.19_160/0.12)] text-[0.65rem] text-[oklch(38%_0.01_160)] transition-all duration-300"
                    style={{
                      transform: isActive ? "rotate(45deg)" : "rotate(0deg)"
                    }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {/* P1-06: Panel region associated with its heading button */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      id={`service-panel-${service.id}`}
                      role="region"
                      aria-labelledby={`service-btn-${service.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-7 pl-16 pr-6 lg:pl-[4.5rem]">
                        <p className="max-w-2xl text-[0.88rem] leading-[1.82] text-[oklch(45%_0.01_160)]">
                          {service.description}
                        </p>
                        <a
                          href="#contact"
                          className="mt-5 inline-flex items-center gap-2 group/link"
                        >
                          <span
                            className="text-[0.58rem] uppercase tracking-[0.38em] text-[oklch(45%_0.01_160)] transition-colors duration-200 group-hover/link:text-emerald"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            Enquire about this service
                          </span>
                          <ArrowRight
                            weight="light"
                            size={13}
                            className="transition-all duration-300 group-hover/link:translate-x-1"
                            style={{ color: "oklch(45% 0.01 160)" }}
                          />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
