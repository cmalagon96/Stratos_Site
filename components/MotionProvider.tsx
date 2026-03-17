"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * P0-06: LazyMotion provider — wraps the app tree so all `m.*` components
 * use the lighter domAnimation feature set (~15KB) instead of the full
 * framer-motion bundle (~55KB). Saves ~40KB.
 *
 * All child components should import { m } from "framer-motion" instead
 * of { motion }.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
