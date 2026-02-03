"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { stats } from "@/lib/constants";

export default function About() {
  return (
    <section id="about" className="bg-navy-mid py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-teal-bright">
            Our Approach
          </span>
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            We do not advise from a distance. We build, implement, and operate.
          </h2>
          <div className="flex flex-col gap-4 text-base text-silver-light">
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

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="flex flex-col gap-2 border border-[rgba(232,236,241,0.18)] bg-[#0f1e36] px-6 py-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                hideNumber={stat.hideNumber}
                className="font-display text-3xl font-bold text-white"
              />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-silver-dark">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
