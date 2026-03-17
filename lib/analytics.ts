/**
 * Stratos Strategies — Analytics Helper
 *
 * Thin wrappers over PostHog that provide a typed, import-friendly API.
 * All calls are safe no-ops when PostHog is not initialised (no key set,
 * build-time import, or SSR context).
 *
 * Usage:
 *   import { trackPurchase, trackSignup, trackProductView } from "@/lib/analytics";
 *   trackProductView("billflow");
 */

import type { PostHog } from "posthog-js";

// Lazy PostHog accessor — avoids SSR crashes when module is imported server-side
function ph(): PostHog | null {
  if (typeof window === "undefined") return null;
  try {
    // posthog-js attaches itself to window on init
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).posthog ?? null;
  } catch {
    return null;
  }
}

// ─── Purchase ─────────────────────────────────────────────────────────────────
/**
 * Track a successful purchase / checkout completion.
 *
 * @param productId  The Stripe price ID or internal product slug
 * @param amount     Amount in USD (dollars, not cents)
 */
export function trackPurchase(productId: string, amount: number): void {
  ph()?.capture("purchase_completed", {
    product_id: productId,
    amount_usd: amount,
    currency: "USD",
  });
}

// ─── Signup ───────────────────────────────────────────────────────────────────
/**
 * Track a new user registration.
 * Call after the auth provider confirms account creation.
 */
export function trackSignup(): void {
  ph()?.capture("user_signed_up");
}

// ─── Product View ─────────────────────────────────────────────────────────────
/**
 * Track when a user views a product detail page.
 *
 * @param productSlug  URL slug of the product (e.g. "billflow", "rosabio")
 */
export function trackProductView(productSlug: string): void {
  ph()?.capture("product_viewed", {
    product_slug: productSlug,
  });
}

// ─── Generic Event ────────────────────────────────────────────────────────────
/**
 * Escape hatch for one-off events not covered by the typed helpers above.
 *
 * @param event       PostHog event name (snake_case preferred)
 * @param properties  Optional key/value properties
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  ph()?.capture(event, properties);
}
