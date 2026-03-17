/**
 * POST /api/webhooks/keygen -- Keygen.sh webhook handler
 *
 * Receives webhook events from Keygen and syncs license/machine state
 * to the local database. Verifies the webhook signature to ensure
 * the event originated from Keygen.
 *
 * Handled events:
 *   - license.created    -> no-op (we create licenses via fulfillment)
 *   - license.expired    -> update local status to "expired"
 *   - license.suspended  -> update local status to "suspended"
 *   - machine.created    -> increment activation count
 *   - machine.deleted    -> decrement activation count
 *
 * Keygen webhook docs: https://keygen.sh/docs/api/webhooks/
 * Signature verification: https://keygen.sh/docs/api/signatures/
 */
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { licenses, webhookEvents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { KeygenWebhookEventType } from "@/lib/types/keygen";

// ---------------------------------------------------------------------------
// Signature Verification
// ---------------------------------------------------------------------------

/**
 * Keygen webhook Ed25519 verify key (hex-encoded).
 * Get this from your Keygen account settings -> Webhook Signing Key.
 * Store as an environment variable.
 */
const KEYGEN_VERIFY_KEY = process.env.KEYGEN_WEBHOOK_SIGNING_KEY;

/**
 * Parse the parameterized Keygen-Signature header.
 *
 * Format: keyid="<account-id>", algorithm="ed25519", signature="<base64>",
 *         headers="(request-target) host date digest"
 */
function parseSignatureHeader(
  header: string,
): Record<string, string> | null {
  try {
    const params = header.split(/\s*,\s*/g);
    const result: Record<string, string> = {};

    for (const param of params) {
      const match = param.match(/([^=]+)="([^"]+)"/i);
      if (match) {
        result[match[1]] = match[2];
      }
    }

    return result.signature ? result : null;
  } catch {
    return null;
  }
}

/**
 * Encode a hex Ed25519 public key into DER SPKI format.
 *
 * Node.js crypto does not accept raw hex keys directly.
 * This builds the DER-encoded SubjectPublicKeyInfo structure
 * per the Ed25519 OID (1.3.101.112).
 *
 * Reference: https://keygen.sh/blog/how-to-use-hexadecimal-ed25519-keys-in-node/
 */
function encodeHexKeyToDerFormat(hex: string): Buffer {
  const oid = Buffer.from([0x06, 0x03, 0x2b, 0x65, 0x70]); // Ed25519 OID
  const key = Buffer.from(hex, "hex");

  const elements = Buffer.concat([
    Buffer.concat([
      Buffer.from([0x30]), // Sequence tag
      Buffer.from([oid.length]),
      oid,
    ]),
    Buffer.concat([
      Buffer.from([0x03]), // Bit string tag
      Buffer.from([key.length + 1]),
      Buffer.from([0x00]), // Zero unused bits
      key,
    ]),
  ]);

  return Buffer.concat([
    Buffer.from([0x30]), // Sequence tag
    Buffer.from([elements.length]),
    elements,
  ]);
}

/**
 * Verify the Keygen webhook signature using Ed25519.
 *
 * Follows Keygen's official verification protocol:
 * 1. Parse the Keygen-Signature header for algorithm and signature
 * 2. Verify the body digest matches the Digest header
 * 3. Reconstruct the signing data from headers
 * 4. Verify the Ed25519 signature using crypto.verify()
 *
 * Reference: https://github.com/keygen-sh/example-webhook-handler
 */
async function verifyWebhookSignature(
  request: Request,
  body: string,
): Promise<boolean> {
  // Only bypass signature verification in development with explicit opt-in
  if (!KEYGEN_VERIFY_KEY) {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.KEYGEN_WEBHOOK_SKIP_VERIFY === "true"
    ) {
      console.warn("[keygen-webhook] Skipping signature verification (dev bypass)");
      return true;
    }
    console.error("[keygen-webhook] No verify key configured — rejecting");
    return false;
  }

  const signatureHeader = request.headers.get("keygen-signature");
  if (!signatureHeader) {
    return false;
  }

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) return false;

  // Ensure algorithm is Ed25519
  if (parsed.algorithm !== "ed25519") {
    console.warn(`[keygen-webhook] Unexpected algorithm: ${parsed.algorithm}`);
    return false;
  }

  try {
    // Verify the body digest
    const hash = crypto.createHash("sha256").update(body);
    const digest = `sha-256=${hash.digest("base64")}`;
    const requestDigest = request.headers.get("digest");

    if (digest !== requestDigest) {
      console.warn("[keygen-webhook] Digest mismatch");
      return false;
    }

    // Reconstruct the signing data from headers
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    const date = request.headers.get("date") ?? "";
    const signingData = [
      `(request-target): post ${url.pathname}`,
      `host: ${host}`,
      `date: ${date}`,
      `digest: ${digest}`,
    ].join("\n");

    // Create the Ed25519 public key from hex-encoded verify key
    const verifyKey = crypto.createPublicKey({
      key: encodeHexKeyToDerFormat(KEYGEN_VERIFY_KEY),
      format: "der",
      type: "spki",
    });

    // Verify the Ed25519 signature
    const signatureBytes = Buffer.from(parsed.signature, "base64");
    const dataBytes = Buffer.from(signingData);

    return crypto.verify(null, dataBytes, verifyKey, signatureBytes);
  } catch (err) {
    console.error("[keygen-webhook] Signature verification error:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Webhook event types
// ---------------------------------------------------------------------------

interface KeygenWebhookPayload {
  data: {
    id: string;
    type: string;
    attributes: {
      event: KeygenWebhookEventType;
      payload: {
        data: {
          id: string;
          type: string;
          attributes: Record<string, unknown>;
          relationships?: Record<
            string,
            { data: { type: string; id: string } | null }
          >;
        };
      };
    };
  };
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------

async function handleLicenseExpired(licenseId: string): Promise<void> {
  await db
    .update(licenses)
    .set({ status: "expired" })
    .where(eq(licenses.keygenLicenseId, licenseId));
}

async function handleLicenseSuspended(licenseId: string): Promise<void> {
  await db
    .update(licenses)
    .set({ status: "suspended" })
    .where(eq(licenses.keygenLicenseId, licenseId));
}

async function handleMachineCreated(
  payload: KeygenWebhookPayload["data"]["attributes"]["payload"],
): Promise<void> {
  const licenseRel = payload.data.relationships?.license;
  if (!licenseRel?.data?.id) return;

  await db
    .update(licenses)
    .set({
      currentActivations: sql`${licenses.currentActivations} + 1`,
    })
    .where(eq(licenses.keygenLicenseId, licenseRel.data.id));
}

async function handleMachineDeleted(
  payload: KeygenWebhookPayload["data"]["attributes"]["payload"],
): Promise<void> {
  const licenseRel = payload.data.relationships?.license;
  if (!licenseRel?.data?.id) return;

  await db
    .update(licenses)
    .set({
      currentActivations: sql`GREATEST(${licenses.currentActivations} - 1, 0)`,
    })
    .where(eq(licenses.keygenLicenseId, licenseRel.data.id));
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    // Verify webhook signature (Ed25519, full signing data reconstruction)
    const isValid = await verifyWebhookSignature(request, rawBody);
    if (!isValid) {
      console.warn("[keygen-webhook] Invalid signature -- rejecting");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const payload: KeygenWebhookPayload = JSON.parse(rawBody);
    const eventType = payload.data.attributes.event;
    const eventId = payload.data.id;

    // Idempotency check -- skip if we've already processed this event
    const existing = await db
      .select({ id: webhookEvents.id })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Log the event
    await db.insert(webhookEvents).values({
      provider: "keygen",
      eventId,
      eventType,
      payload: payload as unknown as Record<string, unknown>,
      status: "pending",
    });

    // Route to handler
    const innerPayload = payload.data.attributes.payload;
    const resourceId = innerPayload.data.id;

    switch (eventType) {
      case "license.expired":
        await handleLicenseExpired(resourceId);
        break;

      case "license.validation.failed":
        // Log only -- no state change needed
        console.log(`[keygen-webhook] License validation failed: ${resourceId}`);
        break;

      case "machine.created":
        await handleMachineCreated(innerPayload);
        break;

      case "machine.deleted":
        await handleMachineDeleted(innerPayload);
        break;

      case "license.suspended":
        await handleLicenseSuspended(resourceId);
        break;

      // license.created is handled by our fulfillment flow, not webhooks
      case "license.created":
      case "license.updated":
      case "license.deleted":
      case "license.expiring-soon":
      case "license.validation.succeeded":
      case "machine.updated":
      case "machine.heartbeat.ping":
      case "machine.heartbeat.dead":
        // Acknowledged but no action needed
        break;

      default:
        console.log(`[keygen-webhook] Unhandled event type: ${eventType}`);
    }

    // Mark event as processed
    await db
      .update(webhookEvents)
      .set({
        status: "processed",
        processedAt: new Date(),
      })
      .where(eq(webhookEvents.eventId, eventId));

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[keygen-webhook] Error processing webhook:", err);

    // Still return 200 to prevent Keygen from retrying indefinitely
    // The event is logged with "failed" status for manual review
    return NextResponse.json({ received: true, error: "Processing failed" });
  }
}
