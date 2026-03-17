"use client";

import React, { useRef, useState } from "react";
import { m } from "framer-motion";
import {
  AirplaneTilt,
  Dna,
  CloudArrowUp,
  ShieldCheckered,
  ArrowUpRight
} from "@phosphor-icons/react";

const capabilities = [
  {
    id: "aviation",
    title: "Aviation Systems",
    tagline: "MRO & Operations",
    description:
      "MRO coordination platforms, repair order tracking, vendor management, and ERP integrations for aviation parts brokerage and maintenance operations.",
    icon: AirplaneTilt,
    span: "lg:col-span-2 lg:row-span-1",
    weight: "bold" as const,
    index: "01"
  },
  {
    id: "genomics",
    title: "Genomic Sequencing",
    tagline: "Research Computing",
    description:
      "High-throughput DNA analysis pipelines, NIH dbGaP compliant environments, and cancer research infrastructure at terabyte scale.",
    icon: Dna,
    span: "lg:col-span-1 lg:row-span-2",
    weight: "bold" as const,
    index: "02"
  },
  {
    id: "cloud",
    title: "Cloud Infrastructure",
    tagline: "AWS Multi-Region",
    description:
      "Enterprise-grade AWS architecture across 17+ regions. Federal compliance, terabyte-scale workloads, and zero-downtime deployments.",
    icon: CloudArrowUp,
    span: "lg:col-span-1 lg:row-span-1",
    weight: "bold" as const,
    index: "03"
  },
  {
    id: "compliance",
    title: "Security & Compliance",
    tagline: "NIST / HIPAA / dbGaP",
    description:
      "NIST SP 800-171 engineering, HIPAA-compliant encrypted vaults, and comprehensive audit remediation. 110+ controls implemented.",
    icon: ShieldCheckered,
    span: "lg:col-span-2 lg:row-span-1",
    weight: "bold" as const,
    index: "04"
  }
];

function CapabilityCard({
  cap,
  delay
}: {
  cap: (typeof capabilities)[0];
  delay: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);
  const Icon = cap.icon;

  // P1-02: Throttle mousemove updates to one per animation frame.
  // clientX/clientY are captured synchronously before the rAF callback
  // because React's synthetic events are pooled and may be nullified by
  // the time the callback fires.
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    // Capture coordinates before rAF (synthetic event may be reused)
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current !== null) return; // already a frame queued — skip

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMouse({
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height
      });
    });
  };

  // Cancel any pending rAF on unmount to avoid state updates on dead components
  React.useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <m.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden ${cap.span}`}
      style={{
        background: "oklch(10% 0.010 160)",
        border: `1px solid ${hovered ? "oklch(72% 0.19 160 / 0.28)" : "oklch(72% 0.19 160 / 0.07)"}`,
        transition: "border-color 0.35s ease"
      }}
      aria-label={cap.title}
    >
      {/* Mouse-tracked spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-400"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(
            380px circle at ${mouse.x * 100}% ${mouse.y * 100}%,
            oklch(72% 0.19 160 / 0.055) 0%,
            transparent 70%
          )`
        }}
      />

      {/* Left accent bar — reveals on hover */}
      <div
        className="absolute left-0 top-0 w-[2px] origin-top transition-all duration-500"
        style={{
          height: "100%",
          background: "oklch(72% 0.19 160)",
          transform: hovered ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "top",
          opacity: 0.7
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex h-full min-h-[220px] flex-col justify-between p-7 lg:p-8">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Index */}
            <span
              className="text-[0.52rem] uppercase tracking-[0.35em] text-[oklch(28%_0.01_160)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {cap.index}
            </span>
            <div className="h-[1px] w-5 bg-[oklch(72%_0.19_160/0.15)]" />
            {/* Icon */}
            <div
              className="flex h-9 w-9 items-center justify-center border transition-all duration-300"
              style={{
                background: hovered ? "oklch(72% 0.19 160 / 0.12)" : "oklch(72% 0.19 160 / 0.06)",
                borderColor: hovered ? "oklch(72% 0.19 160 / 0.35)" : "oklch(72% 0.19 160 / 0.14)"
              }}
            >
              <Icon
                weight={cap.weight}
                size={18}
                style={{ color: "oklch(72% 0.19 160)" }}
              />
            </div>
          </div>

          <ArrowUpRight
            weight="light"
            size={16}
            className="transition-all duration-300"
            style={{
              color: hovered ? "oklch(72% 0.19 160)" : "oklch(26% 0.01 160)",
              transform: hovered ? "translate(2px, -2px)" : "translate(0,0)"
            }}
          />
        </div>

        {/* Text */}
        <div className="mt-auto pt-6">
          <span
            className="block text-[0.57rem] uppercase tracking-[0.38em] text-[oklch(40%_0.01_160)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {cap.tagline}
          </span>
          <h3
            className="mt-2 text-[1.15rem] uppercase leading-tight tracking-[0.04em] text-white"
            style={{ fontWeight: 700 }}
          >
            {cap.title}
          </h3>
          <p className="mt-3 text-[0.82rem] leading-[1.72] text-[oklch(42%_0.01_160)]">
            {cap.description}
          </p>
        </div>
      </div>
    </m.div>
  );
}

export default function BentoGrid() {
  return (
    <section
      id="services"
      className="relative overflow-hidden py-32 scroll-mt-20"
      style={{ background: "oklch(7% 0.008 160)" }}
    >
      {/* Ambient top bloom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 35% at 50% 0%, oklch(72% 0.19 160 / 0.04) 0%, transparent 65%)"
        }}
      />

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-35" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">

        {/* Section header — asymmetric layout */}
        <m.div
          className="mb-16 grid gap-8 lg:grid-cols-[1fr_auto]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <span className="section-label">Capabilities</span>
            <h2
              className="mt-5 text-[2.5rem] uppercase leading-[0.91] tracking-[0.015em] text-white md:text-[3.4rem]"
              style={{ fontWeight: 900 }}
            >
              Engineering the{" "}
              <span style={{ color: "oklch(72% 0.19 160)" }}>Impossible.</span>
            </h2>
          </div>
          <div className="hidden flex-col justify-end lg:flex">
            <p className="max-w-xs text-[0.82rem] leading-relaxed text-[oklch(38%_0.01_160)]">
              Converging aerospace engineering, biological computation, and
              hyper-scale cloud infrastructure into unified solutions.
            </p>
          </div>
        </m.div>

        {/* Capability grid — asymmetric bento */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {capabilities.map((cap, i) => (
            <CapabilityCard key={cap.id} cap={cap} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}
