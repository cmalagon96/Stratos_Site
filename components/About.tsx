"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { stats } from "@/lib/constants";

const APPROACH_POINTS = [
  {
    index: "A",
    heading: "We embed, not advise",
    body: "Every engagement is hands-on. We join your existing systems, identify what is broken or missing, and deliver working infrastructure — not recommendations."
  },
  {
    index: "B",
    heading: "From design to operation",
    body: "We design the architecture, write the code, pass the audit, and keep the system running. One team owns the full stack — no handoffs, no gaps."
  },
  {
    index: "C",
    heading: "Precision domains",
    body: "Biotech research, aviation operations, federal compliance. We do not generalize — we specialize in the places where failure is not an option."
  }
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden py-32 scroll-mt-20"
      style={{ background: "oklch(10% 0.010 160)" }}
    >
      {/* Dot matrix */}
      <div className="pointer-events-none absolute inset-0 dot-matrix opacity-25" />

      {/* Left bloom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 40% 60% at 0% 50%, oklch(72% 0.19 160 / 0.038) 0%, transparent 65%)"
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">

        {/* Two-column manifesto */}
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">

          {/* Left column — sticky heading */}
          <m.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label">Our Approach</span>

            <h2
              className="mt-6 text-[2.2rem] uppercase leading-[0.93] tracking-[0.015em] text-white md:text-[2.9rem]"
              style={{ fontWeight: 900 }}
            >
              We do not advise{" "}
              <br className="hidden md:block" />
              from a distance.
            </h2>

            <p
              className="mt-4 text-[1rem] text-[oklch(45%_0.01_160)]"
              style={{
                color: "oklch(72% 0.19 160)",
                fontWeight: 600,
                fontSize: "0.92rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "var(--font-mono)"
              }}
            >
              We build, implement, and operate.
            </p>

            <p className="mt-6 text-[0.92rem] leading-[1.82] text-[oklch(42%_0.01_160)]">
              Stratos Strategies exists at the intersection of infrastructure
              engineering, software development, and operational execution. We
              work with organizations that need someone who can design the
              architecture, write the code, pass the audit, and keep the system
              running — not someone who hands over a slide deck.
            </p>

            {/* Divider */}
            <div
              className="mt-8 h-[1px] w-full"
              style={{ background: "oklch(72% 0.19 160 / 0.08)" }}
            />

            <p className="mt-6 text-[0.84rem] leading-[1.75] text-[oklch(36%_0.01_160)]">
              Our clients range from biotech research companies managing
              controlled-access genomic data to aviation parts brokerages
              modernizing decades-old workflows.
            </p>
          </m.div>

          {/* Right column — approach points */}
          <div className="flex flex-col gap-0">
            {APPROACH_POINTS.map((point, i) => (
              <m.div
                key={point.index}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative border-b border-[oklch(72%_0.19_160/0.07)] py-8 transition-all duration-300 first:border-t hover:border-[oklch(72%_0.19_160/0.15)]"
              >
                {/* Number + content */}
                <div className="flex gap-5">
                  {/* Index marker */}
                  <div className="flex-shrink-0 pt-0.5">
                    <span
                      className="block h-6 w-6 text-center text-[0.55rem] leading-6 text-[oklch(28%_0.01_160)] border border-[oklch(72%_0.19_160/0.10)] transition-all duration-300 group-hover:border-[oklch(72%_0.19_160/0.3)] group-hover:text-[oklch(72%_0.19_160/0.7)]"
                      style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}
                    >
                      {point.index}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-[0.9rem] uppercase tracking-[0.06em] text-[oklch(70%_0.01_160)] transition-colors duration-300 group-hover:text-white"
                      style={{ fontWeight: 700 }}
                    >
                      {point.heading}
                    </h3>
                    <p className="mt-2 text-[0.85rem] leading-[1.78] text-[oklch(40%_0.01_160)]">
                      {point.body}
                    </p>
                  </div>
                </div>

                {/* Hover left accent */}
                <div
                  className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-emerald transition-transform duration-400 group-hover:scale-y-100"
                  style={{ opacity: 0.6 }}
                />
              </m.div>
            ))}
          </div>
        </div>

        {/* Stats bar — full-width, horizontal */}
        <m.div
          className="mt-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          {/* Divider with label */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-[oklch(72%_0.19_160/0.06)]" />
            <span
              className="text-[0.55rem] uppercase tracking-[0.45em] text-[oklch(28%_0.01_160)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              By the Numbers
            </span>
            <div className="h-[1px] flex-1 bg-[oklch(72%_0.19_160/0.06)]" />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {stats.map((stat, index) => (
              <m.div
                key={stat.id}
                className="group relative overflow-hidden border border-[oklch(72%_0.19_160/0.08)] bg-[oklch(13%_0.010_160)] p-7 transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.22)]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                {/* Top accent */}
                <div
                  className="absolute left-0 right-0 top-0 h-[1px] origin-left scale-x-0 bg-emerald transition-transform duration-500 group-hover:scale-x-100"
                />
                {/* Hover bloom */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(72% 0.19 160 / 0.05) 0%, transparent 70%)"
                  }}
                />

                <div className="relative z-10">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    hideNumber={stat.hideNumber}
                    className="text-[2.8rem] leading-none"
                    style={{
                      fontWeight: 900,
                      letterSpacing: "0.02em",
                      color: "oklch(72% 0.19 160)"
                    }}
                  />
                  <span
                    className="mt-2 block text-[0.58rem] uppercase tracking-[0.38em] text-[oklch(32%_0.01_160)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {stat.label}
                  </span>
                </div>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
