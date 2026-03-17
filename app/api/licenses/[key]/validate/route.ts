/**
 * GET /api/licenses/[key]/validate -- Public license validation endpoint
 *
 * Called by shipped software (desktop apps, CLI tools) to validate
 * a license key. Does NOT require authentication.
 *
 * Rate limited aggressively to prevent abuse / key enumeration.
 */
import { NextResponse } from "next/server";
import { validateLicense, KeygenError } from "@/lib/keygen";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    // Aggressive rate limiting for public validation endpoint
    const ip = getClientIp(request);
    const limit = await rateLimit(`license-validate:${ip}`);

    if (!limit.allowed) {
      return NextResponse.json(
        fail(ErrorCodes.RATE_LIMITED, "Too many validation requests. Try again later."),
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const { key } = await params;

    if (!key || key.length < 8) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Invalid license key format"),
        { status: 400 },
      );
    }

    const result = await validateLicense(key);

    return NextResponse.json(ok(result), {
      headers: {
        // Cache validation results for 60 seconds to reduce Keygen API load
        "Cache-Control": "private, max-age=60",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (err) {
    if (err instanceof KeygenError) {
      console.error("[license-validate] Keygen API error:", err.message);
      return NextResponse.json(
        fail(ErrorCodes.INTERNAL_ERROR, "License validation service unavailable"),
        { status: 502 },
      );
    }
    console.error("[license-validate] Unexpected error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to validate license"),
      { status: 500 },
    );
  }
}
