/**
 * Stratos Site — Stripe Configuration
 *
 * Centralizes Stripe API version, currency, and checkout settings.
 * All Stripe-related constants live here to avoid magic strings.
 */

export const STRIPE_CONFIG = {
  /** Stripe API version — pinned for stability */
  apiVersion: "2026-02-25.clover" as const,

  /** Default currency for Checkout Sessions */
  currency: "usd",

  /** Checkout Session configuration */
  checkout: {
    /** Where to redirect after successful payment */
    successUrl: "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    /** Where to redirect if the customer cancels */
    cancelUrl: "/checkout/cancel",
    /** Payment methods to accept */
    paymentMethodTypes: ["card"] as const,
    /** Enable Stripe Tax for automatic tax calculation */
    automaticTax: true,
  },

  /** Webhook event types we subscribe to */
  webhookEvents: [
    "checkout.session.completed",
    "checkout.session.expired",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
    "charge.refunded",
  ] as const,
} as const;
