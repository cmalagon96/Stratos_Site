"use client";

import { m } from "framer-motion";
import {
  CloudArrowUp,
  ShieldCheckered,
  AirplaneTilt,
  Dna,
  Code,
  Lightning,
  ArrowRight,
  Certificate,
  MapPin,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import AnimatedCounter from "@/components/AnimatedCounter";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "NIST SP 800-171 · 110 CONTROLS IMPLEMENTED",
  "NIH dbGaP · CONTROLLED ACCESS FRAMEWORK",
  "AWS · 17+ REGIONS SECURED",
  "HIPAA · COMPLIANT ARCHITECTURE",
  "ITAR · EXPORT CONTROL AWARE",
  "TB-SCALE · GENOMIC DATA PIPELINES",
  "ZERO INCIDENTS · PRODUCTION UPTIME",
];

const CREDENTIALS = [
  { label: "AWS Solutions Architect", status: "ACTIVE" },
  { label: "NIST SP 800-171 / CMMC", status: "EXPERT" },
  { label: "NIH dbGaP Compliance", status: "CERTIFIED" },
  { label: "HIPAA Security Rule", status: "IMPLEMENTED" },
  { label: "React / Next.js", status: "PRODUCTION" },
  { label: "Python / Bioinformatics", status: "PRODUCTION" },
];

const SERVICES = [
  {
    id: "cloud",
    icon: CloudArrowUp,
    label: "01 / CLOUD INFRA",
    title: "AWS Architecture",
    desc: "Enterprise-grade infrastructure across EC2, Batch, S3, VPC, and IAM. Multi-region, compliance-ready, zero single points of failure.",
  },
  {
    id: "compliance",
    icon: ShieldCheckered,
    label: "02 / COMPLIANCE",
    title: "NIST & Federal Frameworks",
    desc: "NIST SP 800-171, NIH dbGaP, HIPAA, and CMMC implementation. We build audit documentation alongside every control — not after.",
  },
  {
    id: "bio",
    icon: Dna,
    label: "03 / BIOINFORMATICS",
    title: "Genomic Pipelines",
    desc: "ROSA, SPLASH, P2G, and methylation analysis pipelines on AWS Batch. TB-scale throughput with automatic stage chaining.",
  },
  {
    id: "aviation",
    icon: AirplaneTilt,
    label: "04 / AVIATION OPS",
    title: "MRO Technology",
    desc: "Repair order systems, vendor management, parts inventory, and ERP integrations purpose-built for aviation brokerage operations.",
  },
  {
    id: "fullstack",
    icon: Code,
    label: "05 / FULL-STACK",
    title: "Web Applications",
    desc: "React and Next.js applications that replace manual workflows. Custom dashboards, billing systems, and internal tooling.",
  },
  {
    id: "automation",
    icon: Lightning,
    label: "06 / AUTOMATION",
    title: "Microsoft 365",
    desc: "Power Automate flows, SharePoint systems, and Graph API integrations that eliminate repetitive operational work.",
  },
];

// ─── Shared animation block ───────────────────────────────────────────────────

function RevealBlock({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </m.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-[0.52rem] uppercase tracking-[0.45em] text-emerald"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}

// ─── Page client component ────────────────────────────────────────────────────

export default function AboutClient() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-0 pt-8 md:pt-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% -5%, oklch(72% 0.19 160 / 0.07) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          {/* Classification-style eyebrow */}
          <RevealBlock>
            <div className="mb-10 flex items-center gap-4">
              <div
                className="h-[1px] w-12 flex-shrink-0"
                style={{ background: "oklch(72% 0.19 160 / 0.4)" }}
              />
              <SectionLabel>Stratos Strategies LLC — Company Profile</SectionLabel>
              <div
                className="h-[1px] flex-1"
                style={{ background: "oklch(72% 0.19 160 / 0.07)" }}
              />
              <span
                className="hidden flex-shrink-0 text-[0.45rem] uppercase tracking-[0.55em] text-[oklch(25%_0.01_160)] md:inline"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Doral, FL · Est. 2023
              </span>
            </div>
          </RevealBlock>

          {/* Main headline */}
          <RevealBlock delay={0.05}>
            <h1
              className="mb-8 max-w-5xl text-[clamp(2.8rem,7vw,6rem)] uppercase leading-[0.88] tracking-[-0.01em] text-text-hi"
              style={{ fontWeight: 900 }}
            >
              Infrastructure for the{" "}
              <span style={{ color: "oklch(72% 0.19 160)" }}>Frontiers</span>
              {" "}of Life and Flight.
            </h1>
          </RevealBlock>

          <RevealBlock delay={0.1}>
            <p className="mb-12 max-w-xl text-[0.9rem] leading-[1.85] text-text-mid">
              We design, build, and operate the technical systems that power
              genomic research, aviation operations, and enterprise cloud
              environments — where precision is not optional and failure is not
              an acceptable outcome.
            </p>
          </RevealBlock>

          {/* Stat row */}
          <RevealBlock delay={0.15}>
            <div
              className="grid grid-cols-3 border-l border-t"
              style={{ borderColor: "oklch(72% 0.19 160 / 0.09)" }}
            >
              {[
                { value: 17, suffix: "+", label: "AWS Regions Secured" },
                { value: 110, suffix: "", label: "NIST Controls Implemented" },
                { value: 3, suffix: "", prefix: "", label: "Products in Production" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="border-b border-r px-4 py-6 md:px-6 md:py-7"
                  style={{ borderColor: "oklch(72% 0.19 160 / 0.09)" }}
                >
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    className="mb-1 text-[2rem] font-black leading-none text-text-hi md:text-[2.4rem]"
                    style={{ letterSpacing: "-0.02em" }}
                  />
                  <div
                    className="text-[0.48rem] uppercase tracking-[0.35em] text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </RevealBlock>
        </div>

        {/* Data ticker */}
        <div
          className="relative mt-16 overflow-hidden border-y py-3"
          style={{
            borderColor: "oklch(72% 0.19 160 / 0.09)",
            background: "oklch(72% 0.19 160 / 0.03)",
          }}
          aria-hidden="true"
        >
          <div
            className="flex gap-12 whitespace-nowrap"
            style={{
              animation: "ticker-scroll 30s linear infinite",
              width: "max-content",
            }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                className="text-[0.5rem] uppercase tracking-[0.42em] text-[oklch(32%_0.01_160)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <span style={{ color: "oklch(72% 0.19 160 / 0.4)" }}>///</span>{" "}
                {item}
              </span>
            ))}
          </div>
          <style>{`
            @keyframes ticker-scroll {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </section>

      {/* ── Founder Profile ───────────────────────────────────────────────── */}
      <section
        className="relative py-28"
        style={{ background: "oklch(10% 0.010 160)" }}
      >
        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(72% 0.19 160) 1px, transparent 1px), linear-gradient(90deg, oklch(72% 0.19 160) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.6fr] lg:gap-24">

            {/* Left — Dossier card */}
            <RevealBlock>
              <div
                className="relative"
                style={{ border: "1px solid oklch(72% 0.19 160 / 0.12)" }}
              >
                {/* Corner accents */}
                <div
                  className="absolute -left-[1px] -top-[1px] h-6 w-6"
                  style={{
                    borderTop: "2px solid oklch(72% 0.19 160 / 0.7)",
                    borderLeft: "2px solid oklch(72% 0.19 160 / 0.7)",
                  }}
                />
                <div
                  className="absolute -bottom-[1px] -right-[1px] h-6 w-6"
                  style={{
                    borderBottom: "2px solid oklch(72% 0.19 160 / 0.7)",
                    borderRight: "2px solid oklch(72% 0.19 160 / 0.7)",
                  }}
                />

                {/* Header band */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    borderBottom: "1px solid oklch(72% 0.19 160 / 0.09)",
                    background: "oklch(72% 0.19 160 / 0.04)",
                  }}
                >
                  <SectionLabel>Personnel File</SectionLabel>
                  <span
                    className="text-[0.42rem] uppercase tracking-[0.5em] text-[oklch(28%_0.01_160)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    CLEARED
                  </span>
                </div>

                {/* Monogram */}
                <div
                  className="flex items-center justify-center py-12"
                  style={{
                    background:
                      "radial-gradient(circle at center, oklch(72% 0.19 160 / 0.06) 0%, transparent 70%)",
                  }}
                >
                  <div
                    className="flex h-24 w-24 items-center justify-center"
                    style={{
                      border: "1px solid oklch(72% 0.19 160 / 0.25)",
                      background: "oklch(72% 0.19 160 / 0.06)",
                    }}
                  >
                    <span
                      className="text-3xl font-black text-emerald"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      CS
                    </span>
                  </div>
                </div>

                {/* Data rows */}
                <div style={{ borderTop: "1px solid oklch(72% 0.19 160 / 0.09)" }}>
                  {[
                    { key: "Name",          val: "Calvin S." },
                    { key: "Title",         val: "Principal Engineer" },
                    { key: "Location",      val: "Doral, FL" },
                    { key: "Specialisation",val: "Cloud · Bio · Aviation" },
                    { key: "Clearance",     val: "NIST / dbGaP Compliant" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-3"
                      style={{
                        borderBottom: i < 4 ? "1px solid oklch(72% 0.19 160 / 0.06)" : undefined,
                      }}
                    >
                      <span
                        className="text-[0.5rem] uppercase tracking-[0.38em] text-text-lo"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {row.key}
                      </span>
                      <span
                        className="text-[0.62rem] uppercase tracking-[0.22em] text-text-mid"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealBlock>

            {/* Right — Narrative */}
            <div className="flex flex-col justify-center gap-8">
              <RevealBlock delay={0.05}>
                <SectionLabel>Founder / Principal Engineer</SectionLabel>
              </RevealBlock>

              <RevealBlock delay={0.1}>
                <h2
                  className="text-[clamp(2rem,4.5vw,3.2rem)] uppercase leading-[0.91] tracking-[0.01em] text-text-hi"
                  style={{ fontWeight: 900 }}
                >
                  Built at the{" "}
                  <span style={{ color: "oklch(72% 0.19 160)" }}>intersection</span>{" "}
                  of precision and complexity.
                </h2>
              </RevealBlock>

              <RevealBlock delay={0.15}>
                <p className="text-[0.88rem] leading-[1.9] text-text-mid">
                  Stratos Strategies was founded to solve problems that generalist
                  consultancies cannot — deeply technical challenges where the
                  solution requires holding aviation operations knowledge, federal
                  compliance frameworks, and cloud architecture simultaneously.
                </p>
              </RevealBlock>

              <RevealBlock delay={0.2}>
                <p className="text-[0.88rem] leading-[1.9] text-text-mid">
                  Our work spans cancer genomics research on AWS Batch, NIST
                  800-171 compliance implementations for NIH-funded institutions,
                  MRO coordination systems for aviation parts brokers, and
                  enterprise automation built on Microsoft 365 — not because we
                  diluted our focus, but because these domains share the same
                  unforgiving standard: the systems must work, every time.
                </p>
              </RevealBlock>

              {/* Credentials grid */}
              <RevealBlock delay={0.25}>
                <div
                  className="grid gap-2 pt-2"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
                >
                  {CREDENTIALS.map((cred) => (
                    <div
                      key={cred.label}
                      className="flex items-center gap-3 px-3 py-2"
                      style={{
                        border: "1px solid oklch(72% 0.19 160 / 0.09)",
                        background: "oklch(72% 0.19 160 / 0.03)",
                      }}
                    >
                      <Certificate
                        weight="fill"
                        size={12}
                        style={{ color: "oklch(72% 0.19 160 / 0.65)", flexShrink: 0 }}
                      />
                      <div>
                        <div
                          className="text-[0.55rem] uppercase leading-tight tracking-[0.22em] text-text-mid"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {cred.label}
                        </div>
                        <div
                          className="text-[0.42rem] uppercase tracking-[0.42em] text-emerald"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {cred.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RevealBlock>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 50%, oklch(72% 0.19 160 / 0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <RevealBlock>
              <SectionLabel>Mission Statement</SectionLabel>
            </RevealBlock>

            <div className="space-y-8">
              {[
                {
                  heading: "Precision over volume.",
                  body: "We take on a small number of engagements at a time. Every client gets direct access to senior engineering capacity, not a hand-off to junior staff after the sale.",
                },
                {
                  heading: "Implementation, not advisory.",
                  body: "We do not produce slide decks and leave. Every recommendation we make, we can build. Every compliance control we document, we have personally implemented.",
                },
                {
                  heading: "Domain depth, not surface coverage.",
                  body: "Aviation MRO operations, federal genomics compliance, and enterprise cloud architecture are not three different services — they are three expressions of the same discipline: making complex systems reliable.",
                },
              ].map((item, i) => (
                <RevealBlock key={i} delay={i * 0.08}>
                  <div
                    className="flex gap-6"
                    style={{
                      borderLeft: "2px solid oklch(72% 0.19 160 / 0.2)",
                      paddingLeft: "1.5rem",
                    }}
                  >
                    <div>
                      <h3
                        className="mb-2 text-[0.88rem] font-bold uppercase tracking-[0.06em] text-text-hi"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.heading}
                      </h3>
                      <p className="text-[0.85rem] leading-[1.88] text-text-mid">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </RevealBlock>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      <section
        className="relative py-28"
        style={{ background: "oklch(10% 0.010 160)" }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <RevealBlock className="mb-16">
            <div className="flex items-end justify-between gap-8">
              <div>
                <SectionLabel>Capabilities</SectionLabel>
                <h2
                  className="mt-4 text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.91] tracking-[0.01em] text-text-hi"
                  style={{ fontWeight: 900 }}
                >
                  Full-Spectrum Technical Execution
                </h2>
              </div>
              <div
                className="hidden text-right lg:block"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <div className="text-[0.45rem] uppercase tracking-[0.45em] text-text-lo">
                  Capabilities
                </div>
                <div className="text-2xl font-black text-emerald">06</div>
              </div>
            </div>
          </RevealBlock>

          <div
            className="grid border-l border-t"
            style={{
              borderColor: "oklch(72% 0.19 160 / 0.08)",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            }}
          >
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <RevealBlock
                  key={svc.id}
                  delay={i * 0.05}
                >
                  <div
                    className="group relative overflow-hidden border-b border-r p-7 transition-all duration-300"
                    style={{ borderColor: "oklch(72% 0.19 160 / 0.08)" }}
                  >
                    {/* Hover fill */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "oklch(72% 0.19 160 / 0.035)" }}
                    />

                    <div className="relative z-10">
                      <div className="mb-5 flex items-center justify-between">
                        <span
                          className="text-[0.45rem] uppercase tracking-[0.45em] text-[oklch(28%_0.01_160)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {svc.label}
                        </span>
                        <div
                          className="flex h-7 w-7 items-center justify-center border transition-all duration-300 group-hover:bg-[oklch(72%_0.19_160/0.1)]"
                          style={{
                            border: "1px solid oklch(72% 0.19 160 / 0.12)",
                            background: "oklch(72% 0.19 160 / 0.04)",
                          }}
                        >
                          <Icon
                            weight="bold"
                            size={13}
                            className="text-[oklch(56%_0.16_160)] transition-colors duration-300 group-hover:text-emerald"
                          />
                        </div>
                      </div>

                      <h3 className="mb-3 text-[0.95rem] font-bold uppercase tracking-[0.04em] text-text-mid transition-colors duration-300 group-hover:text-text-hi">
                        {svc.title}
                      </h3>

                      <p className="text-[0.78rem] leading-[1.82] text-text-lo transition-colors duration-300 group-hover:text-text-mid">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                </RevealBlock>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse at bottom, oklch(72% 0.19 160 / 0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          <RevealBlock>
            <div
              className="relative overflow-hidden px-8 py-12 md:px-16 md:py-20"
              style={{
                border: "1px solid oklch(72% 0.19 160 / 0.14)",
                background: "oklch(72% 0.19 160 / 0.03)",
              }}
            >
              {/* Corner marks */}
              <div
                className="absolute -left-[1px] -top-[1px] h-6 w-6"
                style={{ borderTop: "2px solid oklch(72% 0.19 160 / 0.55)", borderLeft: "2px solid oklch(72% 0.19 160 / 0.55)" }}
              />
              <div
                className="absolute -right-[1px] -top-[1px] h-6 w-6"
                style={{ borderTop: "2px solid oklch(72% 0.19 160 / 0.55)", borderRight: "2px solid oklch(72% 0.19 160 / 0.55)" }}
              />
              <div
                className="absolute -bottom-[1px] -left-[1px] h-6 w-6"
                style={{ borderBottom: "2px solid oklch(72% 0.19 160 / 0.55)", borderLeft: "2px solid oklch(72% 0.19 160 / 0.55)" }}
              />
              <div
                className="absolute -bottom-[1px] -right-[1px] h-6 w-6"
                style={{ borderBottom: "2px solid oklch(72% 0.19 160 / 0.55)", borderRight: "2px solid oklch(72% 0.19 160 / 0.55)" }}
              />

              <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <SectionLabel>Engage</SectionLabel>
                  <h2
                    className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] uppercase leading-[0.91] tracking-[0.01em] text-text-hi"
                    style={{ fontWeight: 900 }}
                  >
                    Ready to Build Something{" "}
                    <span style={{ color: "oklch(72% 0.19 160)" }}>
                      That Lasts?
                    </span>
                  </h2>
                  <p className="mt-5 max-w-xl text-[0.88rem] leading-[1.85] text-text-mid">
                    Whether you need cloud infrastructure built to federal standards,
                    genomic pipelines that run reliably at scale, or aviation operations
                    technology that your team will actually use — let&apos;s talk.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-5">
                    <a
                      href="mailto:contact@stratosstrat.com"
                      className="group inline-flex items-center gap-3"
                    >
                      <EnvelopeSimple
                        weight="regular"
                        size={14}
                        style={{ color: "oklch(72% 0.19 160 / 0.65)" }}
                      />
                      <span
                        className="text-[0.6rem] uppercase tracking-[0.35em] text-text-mid transition-colors duration-200 group-hover:text-emerald"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        contact@stratosstrat.com
                      </span>
                    </a>
                    <span className="hidden text-[oklch(22%_0.01_160)] md:inline" aria-hidden="true">·</span>
                    <div className="inline-flex items-center gap-2">
                      <MapPin
                        weight="regular"
                        size={14}
                        style={{ color: "oklch(72% 0.19 160 / 0.65)" }}
                      />
                      <span
                        className="text-[0.6rem] uppercase tracking-[0.35em] text-text-mid"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Doral, FL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/#contact"
                    className="group inline-flex items-center gap-3 px-8 py-4 transition-all duration-300 hover:bg-[oklch(72%_0.19_160/0.1)]"
                    style={{
                      border: "1px solid oklch(72% 0.19 160 / 0.35)",
                      background: "oklch(72% 0.19 160 / 0.06)",
                    }}
                  >
                    <span
                      className="text-[0.58rem] uppercase tracking-[0.38em] text-emerald"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Start a Project
                    </span>
                    <ArrowRight
                      weight="light"
                      size={14}
                      className="text-emerald transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-3 px-8 py-3 transition-all duration-200"
                  >
                    <span
                      className="text-[0.55rem] uppercase tracking-[0.38em] text-text-lo transition-colors duration-200 group-hover:text-text-mid"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      View Products
                    </span>
                    <ArrowRight
                      weight="light"
                      size={12}
                      className="text-text-lo transition-all duration-300 group-hover:translate-x-1 group-hover:text-text-mid"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>
    </>
  );
}
