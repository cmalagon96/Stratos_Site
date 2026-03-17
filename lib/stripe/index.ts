/**
 * Stratos Site — Stripe Client
 *
 * Singleton Stripe SDK instance configured from environment variables.
 * Import `stripe` from this module for all server-side Stripe operations.
 *
 * The client is lazy-initialized via Proxy so that importing this module
 * during `next build` (when STRIPE_SECRET_KEY is absent) does not crash.
 * The real Stripe instance is created on first property access at runtime.
 *
 * NEVER import this in client components — the secret key is server-only.
 */
import Stripe from "stripe";
import { STRIPE_CONFIG } from "./config";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local or set it via `sst secret set StripeSecretKey <value>`.",
      );
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_CONFIG.apiVersion,
      typescript: true,
      appInfo: {
        name: "stratos-site",
        version: "0.1.0",
      },
      // Reasonable timeout for serverless environments
      timeout: 10_000,
      maxNetworkRetries: 2,
    });
  }
  return _stripe;
}

/**
 * Lazy Stripe client proxy.
 * All property accesses are forwarded to the real Stripe instance,
 * which is only created on first use (not at import time).
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const real = getStripe();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
