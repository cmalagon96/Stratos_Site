"use client";

import { useRef, useMemo, useState, useLayoutEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Generate DNA Helix point positions
function generateHelixPoints(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const halfCount = count / 2;

  for (let i = 0; i < count; i++) {
    const t = (i % halfCount) / halfCount;
    const angle = t * Math.PI * 6; // 3 full rotations
    const strand = i < halfCount ? 0 : Math.PI; // Offset for double helix

    positions[i * 3] = Math.cos(angle + strand) * 0.6; // x
    positions[i * 3 + 1] = (t - 0.5) * 3; // y (vertical spread)
    positions[i * 3 + 2] = Math.sin(angle + strand) * 0.6; // z
  }

  return positions;
}

// Generate Network Graph positions (scattered nodes)
function generateNetworkPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Create clustered node positions
    const cluster = Math.floor(Math.random() * 5);
    const clusterOffsets = [
      { x: -1.2, y: 0.8 },
      { x: 1.2, y: 0.5 },
      { x: 0, y: -0.8 },
      { x: -0.8, y: -0.3 },
      { x: 0.9, y: -0.6 }
    ];

    const offset = clusterOffsets[cluster];
    const spread = 0.4;

    positions[i * 3] = offset.x + (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = offset.y + (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  return positions;
}

// The 3D Point Cloud component
function PointCloudHelix({ morphProgress }: { morphProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const pointCount = 3000;

  const [helixPositions, networkPositions] = useMemo(() => {
    return [generateHelixPoints(pointCount), generateNetworkPositions(pointCount)];
  }, []);

  const currentPositions = useMemo(() => {
    return new Float32Array(pointCount * 3);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    // Interpolate between helix and network based on morphProgress
    for (let i = 0; i < pointCount * 3; i++) {
      currentPositions[i] =
        helixPositions[i] * (1 - morphProgress) + networkPositions[i] * morphProgress;
    }

    // Copy to geometry
    for (let i = 0; i < pointCount * 3; i++) {
      positions[i] = currentPositions[i];
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Gentle rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={helixPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#38bdf8" // Aviation Cobalt
        size={0.008}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Secondary ambient particles
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a78bfa" // DNA Purple
        size={0.003}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Main Hero component
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [morphProgress, setMorphProgress] = useState(0);
  const [fontWeight, setFontWeight] = useState(300);

  // GSAP ScrollTrigger for morph and kinetic typography
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Morph progress based on scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          setMorphProgress(self.progress);
        }
      });

      // Kinetic typography - font weight based on scroll velocity
      ScrollTrigger.create({
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity());
          const weight = gsap.utils.clamp(300, 700, 300 + velocity * 0.15);
          setFontWeight(weight);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Staggered assembly animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative h-screen w-full overflow-hidden bg-obsidian"
    >
      {/* Layer 1: 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 2.5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <PointCloudHelix morphProgress={morphProgress} />
          <AmbientParticles />
        </Canvas>
      </div>

      {/* Radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 z-5 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(15%_0.02_250)_70%)]" />

      {/* Layer 2: Content */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Systems Online Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 backdrop-blur-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bio-mint opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-bio-mint" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
            Systems Online • V 4.0
          </span>
        </motion.div>

        {/* Main Title with Kinetic Typography */}
        <motion.h1
          variants={itemVariants}
          className="kinetic-text max-w-5xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{
            fontWeight,
            fontVariationSettings: `'wght' ${fontWeight}`
          }}
        >
          <span className="block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Infrastructure for the
          </span>
          <span className="mt-2 block bg-gradient-to-r from-aviation-cobalt via-bio-mint to-dna-purple bg-clip-text text-transparent">
            Frontiers of Life & Flight
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-8 max-w-2xl text-lg text-slate-400 md:text-xl"
        >
          Aviation logistics systems. Genomic data pipelines. Enterprise cloud architecture.
          Built by engineers who execute, not advisors who observe.
        </motion.p>

        {/* CTA Button */}
        <motion.a
          variants={itemVariants}
          href="#contact"
          className="mt-10 inline-flex items-center gap-3 rounded-sm border border-aviation-cobalt/50 bg-aviation-cobalt/10 px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-aviation-cobalt backdrop-blur-sm transition-all duration-300 hover:border-aviation-cobalt hover:bg-aviation-cobalt/20 hover:shadow-glow-cobalt"
        >
          <span>Start a Conversation</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </motion.a>
      </motion.div>

      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-32 w-full bg-gradient-to-t from-obsidian to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Scroll
          </span>
          <motion.div
            className="h-8 w-[1px] bg-gradient-to-b from-aviation-cobalt to-transparent"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
