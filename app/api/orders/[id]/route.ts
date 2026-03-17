/**
 * GET /api/orders/[id] — Single order detail with items
 *
 * Returns a specific order with all line items, product names,
 * and license keys. Authenticated, scoped to the requesting user.
 */
import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, licenses } from "@/lib/db/schema";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { fail, ok, ErrorCodes } from "@/lib/types/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id: idParam } = await params;
    const orderId = parseInt(idParam, 10);

    if (isNaN(orderId)) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Invalid order ID"),
        { status: 400 },
      );
    }

    // Fetch order, scoped to this user
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "Order not found"),
        { status: 404 },
      );
    }

    // Fetch order items with product details
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: products.name,
        productSlug: products.slug,
        productType: products.type,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        licenseKeyId: orderItems.licenseKeyId,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Fetch license keys for items that have them
    const licenseKeyIds = items
      .map((i) => i.licenseKeyId)
      .filter((id): id is number => id !== null);

    let licenseMap = new Map<number, { key: string; status: string }>();
    if (licenseKeyIds.length > 0) {
      const licenseRows = await db
        .select({
          id: licenses.id,
          key: licenses.key,
          status: licenses.status,
        })
        .from(licenses)
        .where(inArray(licenses.id, licenseKeyIds));
      licenseMap = new Map(
        licenseRows.map((l) => [l.id, { key: l.key, status: l.status }]),
      );
    }

    return NextResponse.json(
      ok({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount,
        currency: order.currency,
        stripeCheckoutSessionId: order.stripeCheckoutSessionId,
        createdAt: order.createdAt.toISOString(),
        items: items.map((item) => {
          const license = item.licenseKeyId
            ? licenseMap.get(item.licenseKeyId)
            : null;
          return {
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            productType: item.productType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            license: license
              ? { key: license.key, status: license.status }
              : null,
          };
        }),
      }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }

    console.error("[orders] Error fetching order:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch order"),
      { status: 500 },
    );
  }
}
