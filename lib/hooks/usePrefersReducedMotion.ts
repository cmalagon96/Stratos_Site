import { useState, useEffect } from "react";

/**
 * P0-05: Detect the user's prefers-reduced-motion OS/browser setting.
 *
 * Returns `true` when the user prefers reduced motion. Components should
 * use this to skip heavy animations (Three.js canvas, particle systems)
 * and show a lightweight static fallback instead — also saves ~300KB
 * of Three.js bundle via dynamic import avoidance.
 */
export default function usePrefersReducedMotion(): boolean {
  // Default to reduced motion on the server / first render to avoid
  // flashing the heavy animation before the media query resolves.
  const [prefersReduced, setPrefersReduced] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
