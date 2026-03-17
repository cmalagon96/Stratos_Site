/**
 * POST /api/admin/orders/[id]/refund — Refund an order (admin only)
 *
 * Issues a full refund via Stripe, updates order status to "refunded",
 * and suspends all associated Keygen licenses.
 *
 * Requires admin role.
 *
 * Error codes:
 *   401 — Not authenticated / not admin
 *   404 — Order not found
 *   400 — Order status does not allow refund (must be "completed")
 *   500 — Stripe or Keygen API failure
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, licenses } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth/session";
import { ok, fail, ErrorCodes } from "@/lib/types/api";
import { stripe } from "@/lib/stripe";
import { suspendLicense } from "@/lib/keygen";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    await requireAdmin();

    const { id: rawId } = await context.params;
    const orderId = parseInt(rawId, 10);

    if (Number.isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Invalid order ID"),
        { status: 400 },
      );
    }

    // Look up the order
    const [order] = await db
      .select({
        id: orders.id,
        status: orders.status,
        stripePaymentIntentId: orders.stripePaymentIntentId,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "Order not found"),
        { status: 404 },
      );
    }

    // Only completed orders can be refunded
    if (order.status !== "completed") {
      return NextResponse.json(
        fail(
          ErrorCodes.VALIDATION_FAILED,
          `Cannot refund order with status "${order.status}". Only completed orders can be refunded.`,
        ),
        { status: 400 },
      );
    }

    if (!order.stripePaymentIntentId) {
      return NextResponse.json(
        fail(
          ErrorCodes.VALIDATION_FAILED,
          "Order has no associated Stripe payment intent",
        ),
        { status: 400 },
      );
    }

    // Issue refund via Stripe
    let refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
    } catch (stripeErr) {
      console.error("[admin/orders/refund] Stripe refund failed:", stripeErr);
      const message =
        stripeErr instanceof Error
          ? stripeErr.message
          : "Stripe refund failed";
      return NextResponse.json(
        fail(ErrorCodes.INTERNAL_ERROR, message),
        { status: 500 },
      );
    }

    // Update order status to "refunded"
    await db
      .update(orders)
      .set({ status: "refunded" })
      .where(eq(orders.id, orderId));

    // Suspend all licenses associated with this order
    const orderLicenses = await db
      .select({
        id: licenses.id,
        keygenLicenseId: licenses.keygenLicenseId,
      })
      .from(licenses)
      .where(eq(licenses.orderId, orderId));

    const suspensionErrors: string[] = [];

    for (const license of orderLicenses) {
      try {
        if (license.keygenLicenseId) {
          await suspendLicense(license.keygenLicenseId);
        }

        // Update local license status regardless of Keygen call
        await db
          .update(licenses)
          .set({ status: "suspended" })
          .where(eq(licenses.id, license.id));
      } catch (keygenErr) {
        console.error(
          `[admin/orders/refund] Failed to suspend license ${license.id}:`,
          keygenErr,
        );
        suspensionErrors.push(
          `License ${license.id}: ${keygenErr instanceof Error ? keygenErr.message : "Unknown error"}`,
        );
      }
    }

    if (suspensionErrors.length > 0) {
      console.warn(
        "[admin/orders/refund] Some licenses failed to suspend:",
        suspensionErrors,
      );
    }

    return NextResponse.json(
      ok({
        orderId,
        refundId: refund.id,
        licenseSuspended: orderLicenses.length - suspensionErrors.length,
        licenseFailed: suspensionErrors.length,
      }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }

    console.error("[admin/orders/refund] Unexpected error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to process refund"),
      { status: 500 },
    );
  }
}
