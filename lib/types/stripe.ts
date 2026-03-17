/**
 * Stratos Site — Stripe-specific Types
 *
 * Metadata shapes attached to Stripe Checkout Sessions and
 * webhook event type literals for type-safe webhook handling.
 */

/** Metadata attached to a Stripe Checkout Session */
export interface CheckoutMetadata {
  userId: string;
  productIds: string; // comma-separated product IDs
  orderId: string;
}

/** Metadata attached to a Stripe Customer */
export interface CustomerMetadata {
  userId: string;
}

/** Stripe webhook event types we handle */
export type StripeWebhookEventType =
  | "checkout.session.completed"
  | "checkout.session.expired"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "charge.refunded";

/** Shape of a parsed Stripe webhook event (subset we care about) */
export interface ParsedStripeEvent {
  id: string;
  type: StripeWebhookEventType;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}
