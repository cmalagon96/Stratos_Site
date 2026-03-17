/**
 * GET /api/orders — User's order history (paginated)
 *
 * Returns the authenticated user's orders, newest first.
 * Includes order items with product names.
 */
import { NextResponse } from "next/server";
import { eq, desc, count, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { fail, paginated, ErrorCodes } from "@/lib/types/api";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();

    // Parse pagination params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)),
    );
    const offset = (page - 1) * pageSize;

    // Count total orders for this user
    const [{ total }] = await db
      .select({ total: count() })
      .from(orders)
      .where(eq(orders.userId, user.id));

    // Fetch orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Fetch items for all returned orders
    const orderIds = userOrders.map((o) => o.id);
    let itemsByOrder = new Map<
      number,
      { productName: string; quantity: number; unitPrice: number }[]
    >();

    if (orderIds.length > 0) {
      const items = await db
        .select({
          orderId: orderItems.orderId,
          productName: products.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, orderIds));

      for (const item of items) {
        const existing = itemsByOrder.get(item.orderId) ?? [];
        existing.push({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        itemsByOrder.set(item.orderId, existing);
      }
    }

    const data = userOrders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      taxAmount: order.taxAmount,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      items: itemsByOrder.get(order.id) ?? [],
    }));

    return NextResponse.json(
      paginated(data, {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }

    console.error("[orders] Error fetching orders:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch orders"),
      { status: 500 },
    );
  }
}
