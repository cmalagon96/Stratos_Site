"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ─── Page View Tracking ───────────────────────────────────────────────────────
// Separate component so it can be wrapped in Suspense (useSearchParams requirement)
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url += `?${searchParams.toString()}`;
      }
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

// ─── PostHog Initializer ──────────────────────────────────────────────────────
function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

    if (!key) return;

    // Respect Do Not Track
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;

    posthog.init(key, {
      api_host: host,
      // Cookie-free mode: all state stored in memory only, never persisted
      persistence: "memory",
      // Disable session recording to minimise data collection
      disable_session_recording: true,
      // Manual page-view capture via PageViewTracker above
      capture_pageview: false,
      // Disable automatic heatmaps
      autocapture: false,
      // Respect user opt-out
      opt_out_capturing_by_default: false,
    });
  }, []);

  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  // If no key is configured, render children without analytics
  if (!key) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
