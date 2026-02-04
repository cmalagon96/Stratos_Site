"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { stats } from "@/lib/constants";

export default function About() {
  return (
    <section id="about" className="bg-obsidian-light py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-aviation-cobalt">
            Our Approach
          </span>
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            We do not advise from a distance. We build, implement, and operate.
          </h2>
          <div className="flex flex-col gap-4 text-base text-slate-400">
            <p>
              Stratos Strategies exists at the intersection of infrastructure
              engineering, software development, and operational execution. We
              work with organizations that need someone who can design the
              architecture, write the code, pass the audit, and keep the system
              running.
            </p>
            <p>
              Our clients range from biotech research companies managing
              controlled-access genomic data to aviation parts brokerages
              modernizing decades-old workflows. What they have in common:
              complex technical problems that require someone who builds
              solutions, not slide decks.
            </p>
            <p>
              Every engagement is hands-on. We embed into your existing systems,
              identify what is broken or missing, and deliver working
              infrastructure — not recommendations.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-glass-border bg-obsidian-mid px-6 py-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-aviation-cobalt/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                hideNumber={stat.hideNumber}
                className="relative z-10 font-display text-3xl font-bold text-white"
              />
              <span className="relative z-10 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
