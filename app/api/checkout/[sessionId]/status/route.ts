/**
 * GET /api/checkout/[sessionId]/status — Check checkout fulfillment status
 *
 * Post-purchase polling endpoint. The success page calls this every 2 seconds
 * to check if the webhook has been processed and the order fulfilled.
 *
 * Returns:
 * - "pending"    — webhook not yet received or still processing
 * - "completed"  — order created, license keys provisioned
 * - "failed"     — something went wrong during fulfillment
 *
 * Authenticated and scoped to the requesting user's sessions only.
 */
import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, licenses } from "@/lib/db/schema";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { fail, ok, ErrorCodes } from "@/lib/types/api";

interface StatusResponse {
  status: "pending" | "completed" | "failed";
  order?: {
    id: number;
    totalAmount: number;
    taxAmount: number;
    currency: string;
    items: {
      productName: string;
      quantity: number;
      unitPrice: number;
      licenseKey: string | null;
    }[];
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const user = await requireAuth();
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Session ID is required"),
        { status: 400 },
      );
    }

    // Look up the order by Stripe Checkout Session ID, scoped to this user
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.stripeCheckoutSessionId, sessionId),
          eq(orders.userId, user.id),
        ),
      )
      .limit(1);

    if (!order) {
      // No order yet — webhook hasn't been processed
      return NextResponse.json(ok<StatusResponse>({ status: "pending" }));
    }

    if (order.status === "failed") {
      return NextResponse.json(ok<StatusResponse>({ status: "failed" }));
    }

    if (order.status === "completed") {
      // Fetch order items with product names and license keys
      const items = await db
        .select({
          productName: products.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          licenseKeyId: orderItems.licenseKeyId,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      // Look up license keys for items that have them
      const licenseKeyIds = items
        .map((i) => i.licenseKeyId)
        .filter((id): id is number => id !== null);

      let licenseMap = new Map<number, string>();
      if (licenseKeyIds.length > 0) {
        const licenseRows = await db
          .select({ id: licenses.id, key: licenses.key })
          .from(licenses)
          .where(inArray(licenses.id, licenseKeyIds));
        licenseMap = new Map(licenseRows.map((l) => [l.id, l.key]));
      }

      return NextResponse.json(
        ok<StatusResponse>({
          status: "completed",
          order: {
            id: order.id,
            totalAmount: order.totalAmount,
            taxAmount: order.taxAmount,
            currency: order.currency,
            items: items.map((item) => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              licenseKey: item.licenseKeyId
                ? licenseMap.get(item.licenseKeyId) ?? null
                : null,
            })),
          },
        }),
      );
    }

    // Order exists but still pending (e.g., payment processing)
    return NextResponse.json(ok<StatusResponse>({ status: "pending" }));
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }

    console.error("[checkout/status] Error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to check order status"),
      { status: 500 },
    );
  }
}
