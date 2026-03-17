/**
 * GET /api/admin/orders — All orders (admin only, paginated, filterable)
 *
 * Returns all orders in the system with user info and line items.
 * Supports filtering by status and sorting by date.
 * Requires admin role.
 */
import { NextResponse } from "next/server";
import { eq, desc, count, SQL, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, products, users } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth/session";
import { fail, paginated, ErrorCodes } from "@/lib/types/api";
import type { OrderStatus } from "@/lib/db/types";

const VALID_STATUSES = new Set<string>([
  "pending",
  "completed",
  "refunded",
  "failed",
]);

export async function GET(request: Request) {
  try {
    await requireAdmin();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)),
    );
    const offset = (page - 1) * pageSize;
    const statusFilter = searchParams.get("status");

    // Build where conditions
    const conditions: SQL[] = [];
    if (statusFilter && VALID_STATUSES.has(statusFilter)) {
      conditions.push(eq(orders.status, statusFilter as OrderStatus));
    }

    // Count total matching orders
    const countQuery = db.select({ total: count() }).from(orders);
    // Apply filters
    let totalResult: { total: number }[];
    if (conditions.length > 0) {

      totalResult = await countQuery.where(and(...conditions));
    } else {
      totalResult = await countQuery;
    }
    const total = totalResult[0].total;

    // Fetch orders with user info
    let ordersQuery = db
      .select({
        id: orders.id,
        userId: orders.userId,
        userEmail: users.email,
        userName: users.name,
        status: orders.status,
        totalAmount: orders.totalAmount,
        taxAmount: orders.taxAmount,
        currency: orders.currency,
        stripeCheckoutSessionId: orders.stripeCheckoutSessionId,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset);

    let allOrders;
    if (conditions.length > 0) {

      allOrders = await ordersQuery.where(and(...conditions));
    } else {
      allOrders = await ordersQuery;
    }

    // Fetch items for all orders
    const orderIds = allOrders.map((o) => o.id);
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

    const data = allOrders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userEmail: order.userEmail,
      userName: order.userName,
      status: order.status,
      totalAmount: order.totalAmount,
      taxAmount: order.taxAmount,
      currency: order.currency,
      stripeCheckoutSessionId: order.stripeCheckoutSessionId,
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

    console.error("[admin/orders] Error fetching orders:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch orders"),
      { status: 500 },
    );
  }
}
