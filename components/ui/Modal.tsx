"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";

export interface ModalProps {
  /** Control open state from parent */
  open: boolean;
  /** Called when modal requests to close (Escape, backdrop click, close button) */
  onClose: () => void;
  /** Modal heading — rendered in h2, used for aria-labelledby */
  title: string;
  /** Optional sub-heading rendered below title */
  description?: string;
  children: React.ReactNode;
  /** Max width class (default: max-w-lg) */
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const titleId       = React.useId();
  const descriptionId = React.useId();
  const contentRef    = React.useRef<HTMLDivElement>(null);
  const closeRef      = React.useRef<HTMLButtonElement>(null);

  // Escape key
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus trap
  React.useEffect(() => {
    if (!open || !contentRef.current) return;
    const modal = contentRef.current;
    const sel   = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>(sel));

    // Move focus to close button on open
    requestAnimationFrame(() => closeRef.current?.focus());

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els   = getFocusable();
      if (els.length === 0) return;
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    modal.addEventListener("keydown", trap);
    return () => modal.removeEventListener("keydown", trap);
  }, [open]);

  // Prevent body scroll while open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        /* Backdrop */
        <m.div
          className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
          style={{ background: "oklch(4% 0.005 160 / 0.85)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Modal panel */}
          <m.div
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={[
              "relative w-full glass",
              maxWidth,
            ].join(" ")}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow line top */}
            <div
              className="absolute left-0 right-0 top-0 h-[1px]"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(72% 0.19 160 / 0.35), transparent)",
              }}
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[oklch(72%_0.19_160/0.07)] p-6">
              <div>
                <h2
                  id={titleId}
                  className="text-base font-black uppercase tracking-tight text-text-hi"
                >
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="mt-1 text-xs text-text-mid">
                    {description}
                  </p>
                )}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-7 w-7 shrink-0 items-center justify-center border border-[oklch(22%_0.015_160)] text-text-lo transition-all hover:border-[oklch(72%_0.19_160/0.35)] hover:text-text-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-[oklch(72%_0.19_160/0.5)]"
              >
                <span aria-hidden="true" className="text-[0.7rem]">✕</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

/** Convenience footer row for modal action buttons */
export function ModalFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "mt-6 flex items-center justify-end gap-3 border-t border-[oklch(72%_0.19_160/0.07)] pt-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
