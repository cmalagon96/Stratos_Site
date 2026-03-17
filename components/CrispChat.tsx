"use client";

import { useEffect } from "react";

// Extend Window to hold the Crisp object
declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

/**
 * CrispChat — lazy-loaded support chat widget.
 *
 * Only renders on marketing pages (excluded from dashboard/admin layouts).
 * Loads via requestIdleCallback (or a 3 s fallback) so it never blocks
 * critical path resources.
 *
 * Add the component to app/(marketing)/layout.tsx.
 * Set NEXT_PUBLIC_CRISP_WEBSITE_ID in your .env to enable.
 */
export default function CrispChat() {
  useEffect(() => {
    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) return;

    function loadCrisp() {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = websiteId as string;

      const script = document.createElement("script");
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Defer until browser is idle to avoid competing with page paint
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(loadCrisp, { timeout: 3000 });
    } else {
      // Safari fallback
      setTimeout(loadCrisp, 3000);
    }
  }, []);

  // No DOM output — the widget injects its own iframe
  return null;
}
