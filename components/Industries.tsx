"use client";

import { motion } from "framer-motion";
import { industries } from "@/lib/constants";

export default function Industries() {
  return (
    <section id="industries" className="bg-navy-deep py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-teal-bright">
            Industries
          </span>
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            Deep expertise where precision matters.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {industries.map((industry, index) => (
            <motion.article
              key={industry.id}
              className="flex h-full flex-col gap-4 border border-[rgba(232,236,241,0.18)] bg-navy-mid px-6 py-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <span className="h-[2px] w-16 bg-teal-bright" />
              <h3 className="font-display text-xl font-semibold text-white">
                {industry.title}
              </h3>
              <p className="text-sm text-silver-light">
                {industry.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
