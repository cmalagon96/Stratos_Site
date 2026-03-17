/**
 * GET /api/products/:slug -- Single product by slug (public)
 */
import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/services/products";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Missing slug parameter."),
        { status: 400 },
      );
    }

    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, `Product "${slug}" not found.`),
        { status: 404 },
      );
    }

    return NextResponse.json(ok(product));
  } catch (error) {
    console.error("[api/products/slug] GET error:", error);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch product."),
      { status: 500 },
    );
  }
}
