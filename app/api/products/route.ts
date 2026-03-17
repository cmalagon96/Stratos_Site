/**
 * GET /api/products -- Public product listing
 *
 * Query params:
 *   page      - page number (default 1)
 *   pageSize  - items per page (default 12, max 50)
 *   category  - category slug filter
 *   type      - product type filter (saas|desktop|cli|template|report)
 *   search    - text search on name and short description
 */
import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/services/products";
import { paginated, fail, ErrorCodes } from "@/lib/types/api";
import type { Product } from "@/lib/db/types";

const VALID_TYPES: Product["type"][] = [
  "saas",
  "desktop",
  "cli",
  "template",
  "report",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "12", 10);
    const category = searchParams.get("category") ?? undefined;
    const type = searchParams.get("type") as Product["type"] | null;
    const search = searchParams.get("search") ?? undefined;

    // Validate type param
    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        fail(
          ErrorCodes.VALIDATION_FAILED,
          `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
        ),
        { status: 400 },
      );
    }

    const result = await getProducts(
      {
        category,
        type: type ?? undefined,
        search,
      },
      { page, pageSize },
    );

    return NextResponse.json(
      paginated(result.data, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      }),
    );
  } catch (error) {
    console.error("[api/products] GET error:", error);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch products."),
      { status: 500 },
    );
  }
}
