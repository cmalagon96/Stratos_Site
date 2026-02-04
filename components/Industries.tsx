"use client";

import { motion } from "framer-motion";
import { industries } from "@/lib/constants";
import { Dna, Plane } from "lucide-react";

const industryIcons: Record<string, typeof Dna> = {
  biotech: Dna,
  aviation: Plane
};

export default function Industries() {
  return (
    <section id="industries" className="bg-obsidian py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-dna-purple">
            Industries
          </span>
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            Deep expertise where precision matters.
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {industries.map((industry, index) => {
            const Icon = industryIcons[industry.id] || Dna;
            const accentColor = industry.id === "biotech" ? "dna-purple" : "aviation-cobalt";

            return (
              <motion.article
                key={industry.id}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-xl border border-glass-border bg-obsidian-mid px-6 py-8"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Gradient hover effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    industry.id === "biotech"
                      ? "from-dna-purple/5"
                      : "from-aviation-cobalt/5"
                  } to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                {/* Icon and accent bar */}
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className={`rounded-lg border border-glass-border ${
                      industry.id === "biotech"
                        ? "bg-dna-purple/10"
                        : "bg-aviation-cobalt/10"
                    } p-2`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        industry.id === "biotech"
                          ? "text-dna-purple"
                          : "text-aviation-cobalt"
                      }`}
                    />
                  </div>
                  <span
                    className={`h-[2px] w-12 ${
                      industry.id === "biotech"
                        ? "bg-dna-purple"
                        : "bg-aviation-cobalt"
                    }`}
                  />
                </div>

                <h3 className="relative z-10 font-display text-xl font-semibold text-white">
                  {industry.title}
                </h3>
                <p className="relative z-10 text-sm leading-relaxed text-slate-400">
                  {industry.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
