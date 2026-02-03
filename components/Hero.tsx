"use client";

import { motion } from "framer-motion";

const headlineWords = ["Infrastructure.", "Intelligence.", "Execution."];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden bg-navy-deep pt-28"
    >
      <div className="pointer-events-none absolute inset-0 grid-texture-fine opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06101f]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-20 pt-10 md:px-10">
        <motion.h1
          className="text-balance font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[5.25rem] lg:leading-[1.05]"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {headlineWords.map((word) => (
            <motion.span
              key={word}
              className="mr-3 inline-block"
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: "easeOut" }
                }
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="max-w-2xl text-lg text-silver-light md:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          We architect cloud systems, engineer compliance frameworks, and build
          the software that runs your operations.
        </motion.p>

        <motion.a
          href="#contact"
          className="inline-flex w-fit items-center justify-center bg-teal-bright px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-navy-deep transition-all duration-300 hover:shadow-tealGlow"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          Start a Conversation
        </motion.a>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-teal-bright"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.6, duration: 1 }}
      />
    </section>
  );
}
