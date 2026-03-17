/**
 * GET /api/licenses -- List current user's licenses
 *
 * Requires authentication. Returns all licenses for the authenticated user
 * with product details and activation counts.
 */
import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { licenses, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

export async function GET() {
  try {
    const user = await requireAuth();

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
        productSlug: products.slug,
        productType: products.type,
      })
      .from(licenses)
      .innerJoin(products, eq(licenses.productId, products.id))
      .where(eq(licenses.userId, user.id))
      .orderBy(desc(licenses.createdAt));

    // Mask license keys -- show first 8 and last 4 chars
    const masked = rows.map((row) => ({
      ...row,
      maskedKey: maskLicenseKey(row.key),
    }));

    return NextResponse.json(ok(masked));
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }
    console.error("[licenses] GET error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch licenses"),
      { status: 500 },
    );
  }
}

function maskLicenseKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}${"*".repeat(key.length - 12)}${key.slice(-4)}`;
}
