"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  className?: string;
  hideNumber?: boolean;
};

const DEFAULT_DURATION = 1600;

export default function AnimatedCounter({
  value,
  duration = DEFAULT_DURATION,
  prefix = "",
  suffix = "",
  className = "",
  hideNumber = false
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const formattedStatic = useMemo(
    () => `${prefix}${suffix}`,
    [prefix, suffix]
  );

  useEffect(() => {
    if (!inView || hideNumber) {
      return;
    }

    let startTime: number | null = null;
    let animationFrame = 0;

    const tick = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const nextValue = Math.round(progress * value);
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, inView, value, hideNumber]);

  const output = hideNumber
    ? formattedStatic
    : `${prefix}${displayValue}${suffix}`;

  return (
    <div ref={ref} className={className}>
      {output}
    </div>
  );
}
