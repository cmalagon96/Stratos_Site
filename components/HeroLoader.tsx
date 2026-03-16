"use client";

import dynamic from "next/dynamic";

// P0-05: Lazy-load Hero with ssr:false to eliminate SSR/hydration overhead for
// the Three.js canvas and Math.random() calls (P2-03). This must live in a
// Client Component because next/dynamic ssr:false is not permitted in Server
// Components — the outer page.tsx is a Server Component.
const Hero = dynamic(() => import("@/components/Hero"), {
  ssr: false,
  loading: () => (
    // Placeholder matches hero background exactly — no layout shift while bundle loads
    <div
      className="h-screen w-full"
      style={{ background: "oklch(4% 0.005 160)" }}
      aria-label="Loading hero section"
    />
  )
});

export default function HeroLoader() {
  return <Hero />;
}
