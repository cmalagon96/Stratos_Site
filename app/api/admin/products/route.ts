/**
 * POST /api/admin/products -- Create a new product (admin only)
 *
 * Validates auth session AND admin role in the route handler.
 * Uses drizzle-zod insert schema for input validation.
 */
import { NextRequest, NextResponse } from "next/server";
import { createProduct } from "@/lib/services/products";
import { requireAdmin, AuthError } from "@/lib/auth/session";
import { insertProductSchema } from "@/lib/db/zod-schemas";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

export async function POST(request: NextRequest) {
  try {
    // Auth check: validate session AND admin role in handler (Better Auth cookies)
    await requireAdmin();

    const body = await request.json();

    // Validate input against drizzle-zod schema
    const parsed = insertProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        fail(
          ErrorCodes.VALIDATION_FAILED,
          "Invalid product data.",
          parsed.error.flatten().fieldErrors as Record<string, string[]>,
        ),
        { status: 400 },
      );
    }

    const product = await createProduct(parsed.data);
    return NextResponse.json(ok(product), { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        fail(error.statusCode === 403 ? ErrorCodes.FORBIDDEN : ErrorCodes.UNAUTHORIZED, error.message),
        { status: error.statusCode },
      );
    }
    console.error("[api/admin/products] POST error:", error);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to create product."),
      { status: 500 },
    );
  }
}
