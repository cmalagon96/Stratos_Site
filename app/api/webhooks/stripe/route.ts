/**
 * POST /api/webhooks/stripe — Stripe Webhook Receiver
 *
 * Security-critical endpoint:
 * 1. Reads raw body via request.text() (NOT .json()) for HMAC verification
 * 2. Verifies Stripe signature using constructEvent()
 * 3. Checks idempotency — skips already-processed events
 * 4. Stores event in webhook_events table with status "pending"
 * 5. Pushes to SQS for async processing
 * 6. Returns 200 immediately (Stripe requires fast response)
 *
 * DO NOT add heavy processing here — that belongs in the SQS consumer.
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { webhookEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { publishToFulfillmentQueue } from "@/lib/stripe/queue";
import type { StripeWebhookEventType } from "@/lib/types/stripe";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

/** Events we actually process — ignore everything else */
const HANDLED_EVENTS = new Set<string>(STRIPE_CONFIG.webhookEvents);

export async function POST(request: Request) {
  let event: Stripe.Event;

  // -------------------------------------------------------------------------
  // 1. Read raw body as text (CRITICAL: must be raw for HMAC verification)
  // -------------------------------------------------------------------------
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.warn("[stripe-webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  // -------------------------------------------------------------------------
  // 2. Verify signature
  // -------------------------------------------------------------------------
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe-webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  // -------------------------------------------------------------------------
  // 3. Check if this is an event type we handle
  // -------------------------------------------------------------------------
  if (!HANDLED_EVENTS.has(event.type)) {
    // Acknowledge but don't process
    return NextResponse.json({ received: true, handled: false });
  }

  // -------------------------------------------------------------------------
  // 4. Idempotency check — skip if we've already seen this event ID
  // -------------------------------------------------------------------------
  const [existing] = await db
    .select({ id: webhookEvents.id, status: webhookEvents.status })
    .from(webhookEvents)
    .where(eq(webhookEvents.eventId, event.id))
    .limit(1);

  if (existing) {
    console.log(
      `[stripe-webhook] Duplicate event ${event.id} (status: ${existing.status}), skipping`,
    );
    return NextResponse.json({ received: true, duplicate: true });
  }

  // -------------------------------------------------------------------------
  // 5. Store event in webhook_events table with status "pending"
  // -------------------------------------------------------------------------
  try {
    await db.insert(webhookEvents).values({
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      payload: event.data.object as unknown as Record<string, unknown>,
      status: "pending",
    });
  } catch (err) {
    // Handle race condition: another Lambda may have inserted between check and insert
    if (
      err instanceof Error &&
      err.message.includes("unique") // unique constraint violation
    ) {
      console.log(
        `[stripe-webhook] Race condition duplicate for ${event.id}, skipping`,
      );
      return NextResponse.json({ received: true, duplicate: true });
    }
    throw err;
  }

  // -------------------------------------------------------------------------
  // 6. Push to SQS for async processing
  // -------------------------------------------------------------------------
  try {
    await publishToFulfillmentQueue({
      eventId: event.id,
      eventType: event.type as StripeWebhookEventType,
      data: event.data.object as unknown as Record<string, unknown>,
      created: event.created,
    });
  } catch (err) {
    // SQS publish failed — mark the webhook event as failed so we can retry
    console.error(
      `[stripe-webhook] Failed to publish event ${event.id} to SQS:`,
      err,
    );
    await db
      .update(webhookEvents)
      .set({ status: "failed" })
      .where(eq(webhookEvents.eventId, event.id));

    // Still return 200 to Stripe (the event is stored, we can replay from DB)
    return NextResponse.json({ received: true, queued: false });
  }

  // -------------------------------------------------------------------------
  // 7. Return 200 immediately
  // -------------------------------------------------------------------------
  return NextResponse.json({ received: true, queued: true });
}
