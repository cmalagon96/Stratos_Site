"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { m } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// P0-06: Named import instead of `import * as THREE` for tree-shaking.
// Only the symbols actually used are pulled into the bundle.
import { AdditiveBlending } from "three";
import type { Points as ThreePoints } from "three";
import useIsomorphicLayoutEffect from "@/lib/hooks/useIsomorphicLayoutEffect";
import usePrefersReducedMotion from "@/lib/hooks/usePrefersReducedMotion";

// P2-05: registerPlugin is side-effectful; running it at module scope fires on
// every SSR render even though ScrollTrigger is browser-only. Moved inside
// useEffect (see Hero component below) so it only runs client-side.

// ─── Vortex ring — mirrors logo particle ring ───────────────────────
function generateVortexRing(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2;
    const ringIndex = i % 4;
    const radii = [0.75, 1.0, 1.24, 1.48];
    const r = radii[ringIndex] + (Math.random() - 0.5) * 0.045;
    const ySpread = ringIndex * 0.09 - 0.13;
    positions[i * 3]     = Math.cos(angle) * r;
    positions[i * 3 + 1] = ySpread + (Math.random() - 0.5) * 0.07;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }
  return positions;
}

function generateHelixPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const halfCount = count / 2;
  for (let i = 0; i < count; i++) {
    const t = (i % halfCount) / halfCount;
    const angle = t * Math.PI * 6;
    const strand = i < halfCount ? 0 : Math.PI;
    positions[i * 3]     = Math.cos(angle + strand) * 0.6;
    positions[i * 3 + 1] = (t - 0.5) * 3;
    positions[i * 3 + 2] = Math.sin(angle + strand) * 0.6;
  }
  return positions;
}

function generateNetworkPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const clusterOffsets = [
    { x: -1.2, y: 0.8 }, { x: 1.2, y: 0.5 },
    { x: 0, y: -0.8 },   { x: -0.8, y: -0.3 },
    { x: 0.9, y: -0.6 }
  ];
  for (let i = 0; i < count; i++) {
    const cluster = Math.floor(Math.random() * 5);
    const offset = clusterOffsets[cluster];
    positions[i * 3]     = offset.x + (Math.random() - 0.5) * 0.45;
    positions[i * 3 + 1] = offset.y + (Math.random() - 0.5) * 0.45;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return positions;
}

function ParticleVortex({ morphProgress }: { morphProgress: number }) {
  const pointsRef = useRef<ThreePoints>(null);
  const pointCount = 3600;

  // P1-03: Track the last morphProgress value used for interpolation.
  // When it hasn't changed, skip the 10,800-iteration loop — only rotation
  // (cheap) continues every frame.
  const lastMorphProgress = useRef<number>(-1);

  const [vortexPos, helixPos, networkPos] = useMemo(() => [
    generateVortexRing(pointCount),
    generateHelixPositions(pointCount),
    generateNetworkPositions(pointCount)
  ], []);

  const currentPositions = useMemo(() => new Float32Array(pointCount * 3), []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Rotation updates every frame regardless (cheap, visually important)
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.042;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.022) * 0.09;

    // P1-03: Only re-interpolate all 10,800 values when morphProgress changed
    if (morphProgress === lastMorphProgress.current) return;
    lastMorphProgress.current = morphProgress;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const p1 = Math.min(morphProgress * 2, 1);
    const p2 = Math.max((morphProgress - 0.5) * 2, 0);

    for (let i = 0; i < pointCount * 3; i++) {
      const fromVortexToHelix = vortexPos[i] * (1 - p1) + helixPos[i] * p1;
      currentPositions[i] = fromVortexToHelix * (1 - p2) + networkPos[i] * p2;
      positions[i] = currentPositions[i];
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={vortexPos} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#3ecf8e"
        size={0.0065}
        sizeAttenuation={true}
        depthWrite={false}
        blending={AdditiveBlending}
        opacity={0.92}
      />
    </Points>
  );
}

function AmbientField() {
  const pointsRef = useRef<ThreePoints>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.012;
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.007;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#164d32"
        size={0.0022}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  );
}

// ─── P0-05: Static fallback for prefers-reduced-motion users ─────────
// No Three.js canvas, no particle animation — saves ~300KB bundle.
function ReducedMotionFallback() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Subtle radial gradient mimicking the particle glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 48%, oklch(20% 0.06 160 / 0.35) 0%, transparent 70%)",
        }}
      />
      {/* Static dot grid accent */}
      <div className="pointer-events-none absolute inset-0 dot-matrix opacity-10" />
    </div>
  );
}

// ─── Terminal credential readout ─────────────────────────────────────
const CREDENTIALS = [
  { code: "SYS-001", label: "17+ AWS Regions" },
  { code: "SYS-002", label: "NIST 800-171 Compliant" },
  { code: "SYS-003", label: "NIH dbGaP Certified" },
  { code: "SYS-004", label: "TB-Scale Genomic Pipelines" },
];

// ─── Hero ─────────────────────────────────────────────────────────────
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [morphProgress, setMorphProgress] = useState(0);
  const [fontWeight, setFontWeight] = useState(800);

  // P0-05: Check user motion preference
  const prefersReducedMotion = usePrefersReducedMotion();

  // P2-05: registerPlugin moved into useEffect — browser-only, never runs SSR.
  // P1-04: useIsomorphicLayoutEffect resolves the SSR useLayoutEffect warning.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useIsomorphicLayoutEffect(() => {
    // P0-05: Skip scroll-driven animations when user prefers reduced motion
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => setMorphProgress(self.progress)
      });
      ScrollTrigger.create({
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity());
          const weight = gsap.utils.clamp(800, 900, 800 + velocity * 0.05);
          setFontWeight(weight);
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "oklch(4% 0.005 160)" }}
    >
      {/* P0-05: Conditionally render 3D canvas or static fallback */}
      {prefersReducedMotion ? (
        <ReducedMotionFallback />
      ) : (
        <div className="absolute inset-0 z-0">
          {/* P0-06: dpr={[1, 1.5]} caps pixel ratio — 25-35% less GPU on mobile */}
          <Canvas
            camera={{ position: [0, 0, 2.9], fov: 56 }}
            dpr={[1, 1.5]}
          >
            <ambientLight intensity={0.25} />
            <ParticleVortex morphProgress={morphProgress} />
            <AmbientField />
          </Canvas>
        </div>
      )}

      {/* Deep vignette — darker edges, brighter centre */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background: "radial-gradient(ellipse 68% 62% at 50% 46%, transparent 0%, oklch(4% 0.005 160 / 0.75) 55%, oklch(4% 0.005 160) 100%)"
        }}
      />

      {/* Very subtle dot matrix */}
      <div className="pointer-events-none absolute inset-0 z-[4] dot-matrix opacity-15" />

      {/* Left edge tactical line */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-[6] h-full w-[1px] opacity-20"
        style={{ background: "linear-gradient(to bottom, transparent, oklch(72% 0.19 160), transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 pt-20 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">

          {/* Status row */}
          <m.div
            className="mb-10 flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Live indicator */}
            <div
              className="inline-flex items-center gap-2.5 border border-[oklch(72%_0.19_160/0.22)] bg-[oklch(72%_0.19_160/0.05)] px-4 py-1.5"
            >
              <span className="relative flex h-[6px] w-[6px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-55" />
                <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-emerald" />
              </span>
              <span
                className="text-[0.58rem] uppercase tracking-[0.42em] text-[oklch(55%_0.01_160)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Systems Online
              </span>
            </div>
            {/* Sector tags */}
            <div className="hidden items-center gap-2 md:flex">
              {["Biotech", "Aviation", "Cloud"].map((tag) => (
                <span
                  key={tag}
                  className="text-[0.55rem] uppercase tracking-[0.38em] text-[oklch(28%_0.01_160)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  / {tag}
                </span>
              ))}
            </div>
          </m.div>

          {/* Main headline — massive, left-aligned */}
          <m.h1
            className="max-w-5xl"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontWeight: Math.round(fontWeight) }}
          >
            <span
              className="block leading-[0.89] text-white"
              style={{
                fontSize: "clamp(3rem, 8.5vw, 7.2rem)",
                letterSpacing: "0.01em",
                textTransform: "uppercase"
              }}
            >
              Infrastructure for
            </span>
            <span
              className="block leading-[0.89]"
              style={{
                fontSize: "clamp(3rem, 8.5vw, 7.2rem)",
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                color: "oklch(72% 0.19 160)",
                textShadow: "0 0 100px oklch(72% 0.19 160 / 0.3)"
              }}
            >
              the Frontiers
            </span>
            <span
              className="block leading-[0.89] text-white"
              style={{
                fontSize: "clamp(3rem, 8.5vw, 7.2rem)",
                letterSpacing: "0.01em",
                textTransform: "uppercase"
              }}
            >
              of Life & Flight
            </span>
          </m.h1>

          {/* Sub-headline + CTA — two-column on desktop */}
          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <m.div
              className="max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.42 }}
            >
              <p className="text-[0.95rem] leading-[1.8] text-[oklch(45%_0.01_160)]">
                Aviation logistics. Genomic pipelines. Enterprise cloud.
                Built by engineers who execute — not advisors who observe.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-3 border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.08)] px-7 py-3.5 transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.85)] hover:bg-[oklch(72%_0.19_160/0.15)] hover:shadow-[0_0_30px_oklch(72%_0.19_160/0.22)]"
                >
                  <span
                    className="text-[0.6rem] uppercase tracking-[0.35em] text-emerald"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Start a Conversation
                  </span>
                  <svg className="h-3 w-3 text-emerald transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center gap-2 py-3.5 transition-colors duration-200"
                >
                  <span
                    className="text-[0.6rem] uppercase tracking-[0.35em] text-[oklch(32%_0.01_160)] hover:text-[oklch(50%_0.01_160)] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    View Services
                  </span>
                </a>
              </div>
            </m.div>

            {/* Terminal credential readout */}
            <m.div
              className="hidden lg:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <div
                className="border border-[oklch(72%_0.19_160/0.10)] bg-[oklch(4%_0.005_160/0.8)] p-5 backdrop-blur-sm"
                style={{ minWidth: 260 }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="text-[0.55rem] uppercase tracking-[0.4em] text-[oklch(28%_0.01_160)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Credentials / Active
                  </span>
                  <span className="h-[1px] flex-1 bg-[oklch(72%_0.19_160/0.08)]" />
                </div>
                {CREDENTIALS.map((cred, i) => (
                  <m.div
                    key={cred.code}
                    className="flex items-center gap-3 py-1.5"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <span
                      className="text-[0.52rem] uppercase tracking-[0.3em] text-[oklch(72%_0.19_160/0.5)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {cred.code}
                    </span>
                    <span className="h-[1px] w-3 bg-[oklch(72%_0.19_160/0.15)]" />
                    <span
                      className="text-[0.6rem] uppercase tracking-[0.25em] text-[oklch(55%_0.01_160)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {cred.label}
                    </span>
                  </m.div>
                ))}
                {/* Blinking cursor */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className="text-[0.52rem] text-[oklch(72%_0.19_160/0.45)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ›
                  </span>
                  <span
                    className="inline-block h-[10px] w-[1px] bg-emerald cursor-blink"
                  />
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-20 h-48 w-full"
        style={{ background: "linear-gradient(to top, oklch(7% 0.008 160), transparent)" }}
      />

      {/* Scroll indicator */}
      <m.div
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="flex flex-col items-center gap-3">
          <m.div
            className="h-10 w-[1px]"
            style={{ background: "linear-gradient(to bottom, transparent, oklch(72% 0.19 160 / 0.5), transparent)" }}
            animate={{ scaleY: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className="text-[0.52rem] uppercase tracking-[0.45em] text-[oklch(24%_0.01_160)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Scroll
          </span>
        </div>
      </m.div>
    </section>
  );
}
