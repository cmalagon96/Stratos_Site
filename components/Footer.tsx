"use client";

import { Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-teal-bright bg-navy-deep">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:px-10 md:text-left">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-silver-dark">
          © 2025 Stratos Strategies LLC. All rights reserved.
        </p>
        <a
          href="https://www.linkedin.com"
          className="flex items-center gap-2 text-silver-light transition-colors hover:text-teal-bright"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}
