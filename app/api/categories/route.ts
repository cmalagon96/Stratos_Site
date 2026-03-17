/**
 * GET /api/categories -- All product categories (public)
 */
import { NextResponse } from "next/server";
import { getCategories } from "@/lib/services/products";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

export async function GET() {
  try {
    const cats = await getCategories();
    return NextResponse.json(ok(cats));
  } catch (error) {
    console.error("[api/categories] GET error:", error);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch categories."),
      { status: 500 },
    );
  }
}
