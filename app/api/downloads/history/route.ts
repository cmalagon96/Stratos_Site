/**
 * GET /api/downloads/history -- User's download history
 *
 * Requires authenticated session. Returns all download records
 * for the current user, ordered by most recent first.
 */
import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { getDownloadHistory } from "@/lib/services/downloads";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

export async function GET() {
  try {
    const user = await requireAuth();
    const history = await getDownloadHistory(user.id);

    return NextResponse.json(ok(history));
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }
    console.error("[downloads-history] GET error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to fetch download history"),
      { status: 500 },
    );
  }
}
