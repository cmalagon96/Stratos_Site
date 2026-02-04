"use client";

import { Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-glass-border bg-obsidian">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:px-10 md:text-left">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-slate-500">
          © {currentYear} Stratos Strategies LLC. All rights reserved.
        </p>
        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 transition-colors hover:text-aviation-cobalt"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
