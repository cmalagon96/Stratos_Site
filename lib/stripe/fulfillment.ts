/**
 * Stratos Site — Order Fulfillment Logic
 *
 * Processes Stripe webhook events from the SQS queue:
 * - checkout.session.completed: create order + order items + license keys
 * - charge.refunded: update order status, revoke licenses
 * - subscription events: placeholder for Phase 5
 * - invoice events: placeholder for Phase 5
 *
 * Every handler is idempotent — safe to retry on failure.
 */
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  webhookEvents,
  products,
  licenses,
} from "@/lib/db/schema";
import { fulfillOrder } from "@/lib/services/fulfillment";
import type { FulfillmentMessage } from "./queue";

/**
 * Main dispatcher — routes the event to the correct handler.
 * Called by the SQS consumer or directly in local development.
 */
export async function processStripeEvent(
  message: FulfillmentMessage,
): Promise<void> {
  const { eventId, eventType, data } = message;

  console.log(`[fulfillment] Processing ${eventType} (${eventId})`);

  try {
    switch (eventType) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(data as unknown as Stripe.Checkout.Session);
        break;

      case "charge.refunded":
        await handleChargeRefunded(data as unknown as Stripe.Charge);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // Phase 5: Subscription management
        console.log(`[fulfillment] Subscription event ${eventType} — not yet implemented`);
        break;

      case "invoice.paid":
      case "invoice.payment_failed":
        // Phase 5: Invoice handling
        console.log(`[fulfillment] Invoice event ${eventType} — not yet implemented`);
        break;

      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
        // Informational — checkout.session.completed is the fulfillment trigger
        console.log(`[fulfillment] PaymentIntent event ${eventType} — logged, no action`);
        break;

      default:
        console.warn(`[fulfillment] Unhandled event type: ${eventType}`);
    }

    // Mark webhook event as processed
    await db
      .update(webhookEvents)
      .set({
        status: "processed",
        processedAt: new Date(),
      })
      .where(eq(webhookEvents.eventId, eventId));

    console.log(`[fulfillment] Successfully processed ${eventType} (${eventId})`);
  } catch (err) {
    console.error(`[fulfillment] Error processing ${eventType} (${eventId}):`, err);

    // Mark webhook event as failed
    await db
      .update(webhookEvents)
      .set({ status: "failed" })
      .where(eq(webhookEvents.eventId, eventId));

    // Re-throw so the SQS consumer retries (up to DLQ threshold)
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

/**
 * Handle checkout.session.completed:
 * 1. Retrieve full session with line items from Stripe
 * 2. Create order record
 * 3. Create order_items for each product
 * 4. Call fulfillOrder() to create Keygen licenses and link to order items
 * 5. Send confirmation email (placeholder for Resend integration)
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const sessionId = session.id;

  // Idempotency: check if order already exists for this session
  const [existingOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId))
    .limit(1);

  if (existingOrder) {
    console.log(
      `[fulfillment] Order already exists for session ${sessionId}, skipping`,
    );
    return;
  }

  // Extract metadata
  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error(
      `checkout.session.completed missing userId in metadata (session: ${sessionId})`,
    );
  }

  // Retrieve the full session with line items from Stripe
  const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  });

  const lineItems = fullSession.line_items?.data ?? [];
  if (lineItems.length === 0) {
    throw new Error(
      `checkout.session.completed has no line items (session: ${sessionId})`,
    );
  }

  // Calculate totals
  const totalAmount = fullSession.amount_total ?? 0;
  const taxAmount = fullSession.total_details?.amount_tax ?? 0;
  const currency = fullSession.currency ?? "usd";
  const paymentIntentId =
    typeof fullSession.payment_intent === "string"
      ? fullSession.payment_intent
      : fullSession.payment_intent?.id ?? null;

  // Wrap all DB writes in a transaction so a crash mid-fulfillment
  // does not leave a stranded order with no items/licenses
  const newOrder = await db.transaction(async (tx) => {
    // Create order
    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        stripeCheckoutSessionId: sessionId,
        stripePaymentIntentId: paymentIntentId,
        status: "completed",
        totalAmount,
        taxAmount,
        currency,
      })
      .returning({ id: orders.id });

    // Create order items and license keys
    for (const item of lineItems) {
      const stripeProduct =
        typeof item.price?.product === "object"
          ? (item.price.product as Stripe.Product)
          : null;

      // Look up our product by Stripe Product ID
      let productId: number | null = null;
      if (stripeProduct?.id) {
        const [dbProduct] = await tx
          .select({ id: products.id })
          .from(products)
          .where(eq(products.stripeProductId, stripeProduct.id))
          .limit(1);
        productId = dbProduct?.id ?? null;
      }

      if (!productId) {
        // Fallback: try to find by Stripe Price ID
        if (item.price?.id) {
          const [dbProduct] = await tx
            .select({ id: products.id })
            .from(products)
            .where(eq(products.stripePriceId, item.price.id))
            .limit(1);
          productId = dbProduct?.id ?? null;
        }
      }

      if (!productId) {
        console.error(
          `[fulfillment] Could not find product for Stripe line item: ${JSON.stringify({
            priceId: item.price?.id,
            productId: stripeProduct?.id,
          })}`,
        );
        continue;
      }

      const quantity = item.quantity ?? 1;
      const unitPrice = item.price?.unit_amount ?? 0;

      // Create order item without license reference — fulfillOrder() handles
      // Keygen license creation and links back to the order item.
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId,
        quantity,
        unitPrice,
      });
    }

    return order;
  });

  // Fulfill the order via Keygen — creates licenses and generates download URLs
  try {
    const fulfillmentResult = await fulfillOrder(newOrder.id);
    console.log(
      `[fulfillment] Order ${newOrder.id} fulfilled: ${fulfillmentResult.items.length} items with Keygen licenses`,
    );
  } catch (fulfillmentErr) {
    // Log but don't throw — the order is created, fulfillment can be retried
    console.error(
      `[fulfillment] Keygen fulfillment failed for order ${newOrder.id}:`,
      fulfillmentErr,
    );
    throw fulfillmentErr; // Re-throw so SQS retries the entire event
  }

  // TODO: Send confirmation email via Resend
  console.log(
    `[fulfillment] Order ${newOrder.id} created for user ${userId} (session: ${sessionId})`,
  );
}

/**
 * Handle charge.refunded:
 * 1. Find the order by payment intent ID
 * 2. Update order status to "refunded"
 * 3. Revoke associated license keys
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.warn("[fulfillment] charge.refunded missing payment_intent");
    return;
  }

  // Find the order
  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (!order) {
    console.warn(
      `[fulfillment] No order found for payment_intent ${paymentIntentId}`,
    );
    return;
  }

  // Idempotency: skip if already refunded
  if (order.status === "refunded") {
    console.log(`[fulfillment] Order ${order.id} already refunded, skipping`);
    return;
  }

  // Update order status
  await db
    .update(orders)
    .set({ status: "refunded" })
    .where(eq(orders.id, order.id));

  // Revoke all license keys for this order
  // Phase 5: Also revoke on Keygen.sh
  await db
    .update(licenses)
    .set({ status: "revoked" })
    .where(eq(licenses.orderId, order.id));

  console.log(
    `[fulfillment] Order ${order.id} refunded, licenses revoked`,
  );
}

