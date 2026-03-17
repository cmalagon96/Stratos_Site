/**
 * POST /api/licenses/[key]/deactivate -- Deactivate a device from a license
 *
 * Can be called by shipped software or from the dashboard.
 * Requires either session auth OR the license key + machine ID.
 *
 * Request body:
 *   { machineId: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { deactivateMachine, KeygenError } from "@/lib/keygen";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

const deactivateSchema = z.object({
  machineId: z.string().min(1).max(255),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const limit = await rateLimit(`license-deactivate:${ip}`);

    if (!limit.allowed) {
      return NextResponse.json(
        fail(ErrorCodes.RATE_LIMITED, "Too many requests. Try again later."),
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const { key } = await params;

    // Require authenticated session -- verify the caller owns this license
    const user = await requireAuth();

    // Parse body
    const body = await request.json();
    const parsed = deactivateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "machineId is required"),
        { status: 400 },
      );
    }

    const { machineId } = parsed.data;

    // Look up local license and verify the authenticated user owns it
    const [localLicense] = await db
      .select()
      .from(licenses)
      .where(and(eq(licenses.key, key), eq(licenses.userId, user.id)))
      .limit(1);

    if (!localLicense) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "License not found"),
        { status: 404 },
      );
    }

    // Deactivate the machine in Keygen
    await deactivateMachine(machineId);

    // Decrement local activation counter (floor at 0)
    await db
      .update(licenses)
      .set({
        currentActivations: sql`GREATEST(${licenses.currentActivations} - 1, 0)`,
      })
      .where(eq(licenses.id, localLicense.id));

    return NextResponse.json(
      ok({ machineId, deactivated: true }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }
    if (err instanceof KeygenError) {
      if (err.statusCode === 404) {
        return NextResponse.json(
          fail(ErrorCodes.NOT_FOUND, "Machine not found or already deactivated"),
          { status: 404 },
        );
      }
      console.error("[license-deactivate] Keygen error:", err.message);
      return NextResponse.json(
        fail(ErrorCodes.INTERNAL_ERROR, "Deactivation service unavailable"),
        { status: 502 },
      );
    }
    console.error("[license-deactivate] Unexpected error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to deactivate device"),
      { status: 500 },
    );
  }
}
