"use client";

import { motion } from "framer-motion";
import {
  Cloud,
  ShieldCheck,
  Code2,
  Workflow,
  Plane,
  LucideIcon
} from "lucide-react";
import { services } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  cloud: Cloud,
  compliance: ShieldCheck,
  fullstack: Code2,
  automation: Workflow,
  aviation: Plane
};

export default function Services() {
  return (
    <section id="services" className="bg-navy-deep py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <span className="font-mono text-xs uppercase tracking-[0.4em] text-teal-bright">
            What We Do
          </span>
          <h2 className="text-balance font-display text-3xl font-bold text-white md:text-4xl">
            End-to-end technical strategy, from infrastructure to application.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.id];
            return (
              <motion.article
                key={service.id}
                className="group relative flex h-full flex-col gap-4 border border-[rgba(232,236,241,0.18)] bg-navy-mid px-6 py-8 transition-colors duration-300 hover:bg-[#0f1e36]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-teal-bright transition-transform duration-300 group-hover:scale-y-100" />
                <div className="flex h-12 w-12 items-center justify-center border border-[rgba(232,236,241,0.18)] text-teal-bright">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-silver-light">
                  {service.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
