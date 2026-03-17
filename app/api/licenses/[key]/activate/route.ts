/**
 * POST /api/licenses/[key]/activate -- Activate a device for a license
 *
 * Called by shipped software to register a device fingerprint.
 * Does NOT require session auth (uses license key as credential),
 * but IS rate limited aggressively.
 *
 * Request body:
 *   { fingerprint: string, name?: string, platform?: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  validateLicense,
  activateMachine,
  KeygenError,
} from "@/lib/keygen";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

const activateSchema = z.object({
  fingerprint: z.string().min(8).max(255),
  name: z.string().max(255).optional(),
  platform: z.string().max(64).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const limit = await rateLimit(`license-activate:${ip}`);

    if (!limit.allowed) {
      return NextResponse.json(
        fail(ErrorCodes.RATE_LIMITED, "Too many activation requests. Try again later."),
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const { key } = await params;

    // Parse and validate body
    const body = await request.json();
    const parsed = activateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Invalid request body", {
          fields: parsed.error.issues.map((i) => i.message),
        }),
        { status: 400 },
      );
    }

    const { fingerprint, name, platform } = parsed.data;

    // Validate the license key first
    const validation = await validateLicense(key);

    if (!validation.valid && validation.code !== "NO_MACHINES") {
      return NextResponse.json(
        fail("LICENSE_INVALID", `License validation failed: ${validation.code}`),
        { status: 403 },
      );
    }

    // Look up local license record to get the Keygen license ID
    const [localLicense] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.key, key))
      .limit(1);

    if (!localLicense || !localLicense.keygenLicenseId) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "License not found"),
        { status: 404 },
      );
    }

    // Activate the machine in Keygen
    const machine = await activateMachine(
      localLicense.keygenLicenseId,
      fingerprint,
      name,
      platform,
    );

    // Increment local activation counter
    await db
      .update(licenses)
      .set({
        currentActivations: sql`${licenses.currentActivations} + 1`,
      })
      .where(eq(licenses.id, localLicense.id));

    return NextResponse.json(
      ok({
        machineId: machine.id,
        fingerprint: machine.attributes.fingerprint,
        name: machine.attributes.name,
        activated: true,
      }),
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof KeygenError) {
      // Keygen returns 422 when machine limit is reached
      if (err.statusCode === 422) {
        return NextResponse.json(
          fail("ACTIVATION_LIMIT_REACHED", "Maximum device activations reached"),
          { status: 422 },
        );
      }
      // Keygen returns 409 when fingerprint already activated
      if (err.statusCode === 409) {
        return NextResponse.json(
          fail("ALREADY_ACTIVATED", "This device is already activated"),
          { status: 409 },
        );
      }
      console.error("[license-activate] Keygen error:", err.message);
      return NextResponse.json(
        fail(ErrorCodes.INTERNAL_ERROR, "Activation service unavailable"),
        { status: 502 },
      );
    }
    console.error("[license-activate] Unexpected error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to activate device"),
      { status: 500 },
    );
  }
}
