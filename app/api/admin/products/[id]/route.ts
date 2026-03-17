/**
 * PUT  /api/admin/products/:id -- Update product (admin only)
 * DELETE /api/admin/products/:id -- Soft delete product (admin only)
 *
 * Both endpoints validate auth session AND admin role in the handler.
 */
import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct, getProductById } from "@/lib/services/products";
import { requireAdmin, AuthError } from "@/lib/auth/session";
import { insertProductSchema } from "@/lib/db/zod-schemas";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: idStr } = await context.params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Invalid product ID."),
        { status: 400 },
      );
    }

    // Check product exists
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "Product not found."),
        { status: 404 },
      );
    }

    const body = await request.json();

    // Partial validation -- use the insert schema but make fields optional
    const partialSchema = insertProductSchema.partial();
    const parsed = partialSchema.safeParse(body);
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

    const updated = await updateProduct(id, parsed.data);
    if (!updated) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "Product not found."),
        { status: 404 },
      );
    }

    return NextResponse.json(ok(updated));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        fail(error.statusCode === 403 ? ErrorCodes.FORBIDDEN : ErrorCodes.UNAUTHORIZED, error.message),
        { status: error.statusCode },
      );
    }
    console.error("[api/admin/products/id] PUT error:", error);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to update product."),
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id: idStr } = await context.params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Invalid product ID."),
        { status: 400 },
      );
    }

    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "Product not found."),
        { status: 404 },
      );
    }

    return NextResponse.json(ok({ id, deleted: true }));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        fail(error.statusCode === 403 ? ErrorCodes.FORBIDDEN : ErrorCodes.UNAUTHORIZED, error.message),
        { status: error.statusCode },
      );
    }
    console.error("[api/admin/products/id] DELETE error:", error);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to delete product."),
      { status: 500 },
    );
  }
}
