"use client";

import { useEffect, useMemo, useRef, useState, CSSProperties } from "react";
import { useInView } from "framer-motion";

// P3-01: Removed unused `label` prop — it was accepted but never rendered.
type AnimatedCounterProps = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
  /**
   * P3-02: When `hideNumber` is true the numeric counter animation is
   * suppressed entirely. Only the static `prefix` + `suffix` string is
   * displayed (e.g. "TB-Scale" where the number itself is meaningless).
   * The aria-live region still announces the static text once on mount.
   */
  hideNumber?: boolean;
};

const DEFAULT_DURATION = 1600;

export default function AnimatedCounter({
  value,
  duration = DEFAULT_DURATION,
  prefix = "",
  suffix = "",
  className = "",
  style,
  hideNumber = false
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const formattedStatic = useMemo(() => `${prefix}${suffix}`, [prefix, suffix]);

  useEffect(() => {
    if (!inView || hideNumber) return;

    let startTime: number | null = null;
    let animationFrame = 0;

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayValue(Math.round(progress * value));
      if (progress < 1) animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => { if (animationFrame) window.cancelAnimationFrame(animationFrame); };
  }, [duration, inView, value, hideNumber]);

  const output = hideNumber ? formattedStatic : `${prefix}${displayValue}${suffix}`;

  return (
    // P2-01: aria-live="polite" announces the final value to screen readers
    // once the count-up animation completes (or immediately for hideNumber).
    // aria-atomic="true" prevents intermediate values from being announced —
    // only the complete string is read as a single unit.
    <div
      ref={ref}
      className={className}
      style={style}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {output}
    </div>
  );
}
