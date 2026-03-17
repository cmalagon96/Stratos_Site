"use client";

import { m } from "framer-motion";
import {
  Cloud,
  ShieldCheck,
  Certificate,
  Database,
  Code,
  Lightning
} from "@phosphor-icons/react";

const TRUST_ITEMS = [
  {
    Icon: Cloud,
    label: "AWS",
    sublabel: "Multi-Region"
  },
  {
    Icon: ShieldCheck,
    label: "NIST 800-171",
    sublabel: "110+ Controls"
  },
  {
    Icon: Certificate,
    label: "NIH dbGaP",
    sublabel: "Certified"
  },
  {
    Icon: Database,
    label: "TB-Scale",
    sublabel: "Data Pipelines"
  },
  {
    Icon: Code,
    label: "Full-Stack",
    sublabel: "React / Python"
  },
  {
    Icon: Lightning,
    label: "M365",
    sublabel: "Power Platform"
  }
];

export default function TrustBar() {
  return (
    <div
      className="relative overflow-hidden border-y border-[oklch(72%_0.19_160/0.06)]"
      style={{ background: "oklch(8% 0.008 160)" }}
    >
      {/* Subtle emerald line top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(to right, transparent, oklch(72% 0.19 160 / 0.18), transparent)"
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-6 md:px-12">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {TRUST_ITEMS.map((item, i) => (
            <m.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col items-center gap-2 py-3 transition-all duration-300"
            >
              <item.Icon
                weight="duotone"
                size={22}
                className="transition-all duration-300"
                style={{
                  color: "oklch(72% 0.19 160 / 0.35)"
                }}
              />
              <div className="text-center">
                <span
                  className="block text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[oklch(45%_0.01_160)] transition-colors duration-300 group-hover:text-[oklch(68%_0.01_160)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.label}
                </span>
                <span
                  className="block text-[0.5rem] uppercase tracking-[0.25em] text-[oklch(28%_0.01_160)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.sublabel}
                </span>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </div>
  );
}
