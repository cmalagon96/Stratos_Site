"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Dna, Server, ShieldCheck, ArrowUpRight } from "lucide-react";

// Bento grid feature data
const features = [
  {
    title: "Aviation Systems",
    description:
      "MRO coordination platforms, repair order tracking, vendor management systems, and ERP integrations built specifically for aviation parts brokerage and maintenance operations.",
    icon: Plane,
    colSpan: "md:col-span-2",
    accent: "aviation-cobalt",
    gradientFrom: "from-aviation-cobalt/10",
    gradientTo: "to-aviation-cobalt/5"
  },
  {
    title: "Genomic Sequencing",
    description:
      "High-throughput DNA analysis pipelines, NIH dbGaP compliant data environments, and cloud infrastructure for cancer research studies.",
    icon: Dna,
    colSpan: "md:col-span-1",
    accent: "dna-purple",
    gradientFrom: "from-dna-purple/10",
    gradientTo: "to-dna-purple/5"
  },
  {
    title: "Cloud Infrastructure",
    description:
      "Enterprise-grade AWS architecture handling terabyte-scale workloads across 17+ regions with federal compliance standards.",
    icon: Server,
    colSpan: "md:col-span-1",
    accent: "emerald",
    gradientFrom: "from-emerald/10",
    gradientTo: "to-emerald/5"
  },
  {
    title: "Security & Compliance",
    description:
      "NIST SP 800-171 engineering, HIPAA-compliant encrypted vaults, and comprehensive audit remediation with 110+ controls implemented.",
    icon: ShieldCheck,
    colSpan: "md:col-span-2",
    accent: "rose",
    gradientFrom: "from-rose/10",
    gradientTo: "to-rose/5"
  }
];

// Individual Bento Card with spotlight effect
function BentoCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const Icon = feature.icon;

  // Staggered assembly animation
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-2xl border border-glass-border bg-obsidian-mid ${feature.colSpan}`}
      style={{ containerType: "inline-size" }}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, oklch(55% 0.20 250 / 0.08), transparent 40%)`
            : "none"
        }}
      />

      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Content */}
      <div className="relative z-20 flex h-full min-h-[240px] flex-col justify-between p-6 @[320px]:p-8 @[480px]:p-10">
        <div className="flex items-start justify-between">
          {/* Icon */}
          <div
            className={`rounded-xl border border-glass-border bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} p-3 backdrop-blur-sm`}
          >
            <Icon className={`h-6 w-6 text-${feature.accent}`} />
          </div>

          {/* Arrow */}
          <ArrowUpRight className="h-5 w-5 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-slate-400" />
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white @[480px]:text-2xl">
            {feature.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 @[480px]:text-base">
            {feature.description}
          </p>
        </div>
      </div>

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
    </motion.div>
  );
}

// Main BentoGrid component
export default function BentoGrid() {
  return (
    <section id="services" className="relative bg-obsidian py-24 overflow-hidden">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(55%_0.20_250_/_0.03)_0%,transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Section header */}
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-aviation-cobalt">
            Capabilities
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Engineering the{" "}
            <span className="bg-gradient-to-r from-aviation-cobalt to-dna-purple bg-clip-text text-transparent">
              Impossible.
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Converging aerospace engineering, biological computation, and hyper-scale
            infrastructure.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <BentoCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
