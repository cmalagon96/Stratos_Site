/**
 * GET /api/admin/licenses -- List all licenses (admin only, paginated)
 *
 * Requires admin authentication. Supports pagination and filtering.
 *
 * Query params:
 *   page     - Page number (default 1)
 *   pageSize - Items per page (default 20, max 100)
 *   status   - Filter by license status
 *   userId   - Filter by user ID
 */
import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { licenses, products, users } from "@/lib/db/schema";
import { eq, desc, count, and, type SQL } from "drizzle-orm";
import { paginated, fail, ErrorCodes } from "@/lib/types/api";
import type { LicenseStatus } from "@/lib/db/types";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("pageSize") ?? 20)),
    );
    const offset = (page - 1) * pageSize;

    const statusFilter = url.searchParams.get("status") as LicenseStatus | null;
    const userIdFilter = url.searchParams.get("userId");

    // Build WHERE conditions
    const conditions: SQL[] = [];
    if (statusFilter) {
      conditions.push(eq(licenses.status, statusFilter));
    }
    if (userIdFilter) {
      conditions.push(eq(licenses.userId, userIdFilter));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count total
    const [{ total: totalCount }] = await db
      .select({ total: count() })
      .from(licenses)
      .where(whereClause);

    const total = Number(totalCount);

    // Fetch paginated rows
    const rows = await db
      .select({
        id: licenses.id,
        key: licenses.key,
        status: licenses.status,
        maxActivations: licenses.maxActivations,
        currentActivations: licenses.currentActivations,
        expiresAt: licenses.expiresAt,
        createdAt: licenses.createdAt,
        keygenLicenseId: licenses.keygenLicenseId,
        productId: products.id,
        productName: products.name,
        productType: products.type,
        userId: users.id,
        userEmail: users.email,
        userName: users.name,
      })
      .from(licenses)
      .innerJoin(products, eq(licenses.productId, products.id))
      .innerJoin(users, eq(licenses.userId, users.id))
      .where(whereClause)
      .orderBy(desc(licenses.createdAt))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json(
      paginated(rows, {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(
          err.statusCode === 403
            ? ErrorCodes.FORBIDDEN
            : ErrorCodes.UNAUTHORIZED,
          err.message,
        ),
        { status: err.statusCode },
      );
    }
    console.error("[admin-licenses] GET error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch licenses"),
      { status: 500 },
    );
  }
}
