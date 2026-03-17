/**
 * POST /api/checkout — Create a Stripe Checkout Session
 *
 * Accepts product IDs and quantities, looks up prices SERVER-SIDE
 * (never trusts client-supplied prices), creates a Stripe Checkout
 * Session with automatic tax enabled, and returns the session URL.
 *
 * Requires an authenticated user session.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { STRIPE_CONFIG } from "@/lib/stripe/config";
import { db } from "@/lib/db";
import { products, users } from "@/lib/db/schema";
import { requireAuth, AuthError } from "@/lib/auth/session";
import { fail, ok, ErrorCodes } from "@/lib/types/api";
import { rateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
});

const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(20),
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 1. Require authentication
    const user = await requireAuth();

    // 1.5. Rate limit: 10 checkout attempts per minute per user
    const rl = await rateLimit(`checkout:${user.id}`);
    if (!rl.allowed) {
      return NextResponse.json(
        fail(ErrorCodes.RATE_LIMITED, "Too many checkout attempts. Please try again later."),
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSeconds ?? 60),
          },
        },
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        fail(
          ErrorCodes.VALIDATION_FAILED,
          "Invalid checkout request",
          parsed.error.flatten().fieldErrors as Record<string, string[]>,
        ),
        { status: 400 },
      );
    }

    const { items } = parsed.data;
    const productIds = items.map((i) => i.productId);

    // 3. Look up products SERVER-SIDE (never trust client prices)
    const dbProducts = await db
      .select()
      .from(products)
      .where(
        and(
          inArray(products.id, productIds),
          eq(products.isActive, true),
        ),
      );

    // Verify all requested products exist and are active
    if (dbProducts.length !== new Set(productIds).size) {
      const foundIds = new Set(dbProducts.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        fail(
          ErrorCodes.NOT_FOUND,
          `Products not found or inactive: ${missing.join(", ")}`,
        ),
        { status: 404 },
      );
    }

    // Verify all products have Stripe Price IDs
    const missingPriceId = dbProducts.filter((p) => !p.stripePriceId);
    if (missingPriceId.length > 0) {
      return NextResponse.json(
        fail(
          ErrorCodes.VALIDATION_FAILED,
          `Products not configured for purchase: ${missingPriceId.map((p) => p.name).join(", ")}`,
        ),
        { status: 400 },
      );
    }

    // 4. Build Stripe line items from server-side data
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        price: product.stripePriceId!,
        quantity: item.quantity,
      };
    });

    // 5. Ensure the user has a Stripe Customer ID (or create one)
    let stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    // 6. Build the app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";

    // 7. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: STRIPE_CONFIG.checkout.automaticTax },
      success_url: `${appUrl}${STRIPE_CONFIG.checkout.successUrl}`,
      cancel_url: `${appUrl}${STRIPE_CONFIG.checkout.cancelUrl}`,
      metadata: {
        userId: user.id,
        productIds: productIds.join(","),
      },
      // Collect billing address for tax calculation
      billing_address_collection: "required",
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json(
      ok({
        sessionId: session.id,
        url: session.url,
      }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }

    console.error("[checkout] Error creating session:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to create checkout session"),
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get or create a Stripe Customer for the given user.
 * Stores the customer ID back to the users table for future use.
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string | null,
): Promise<string> {
  // Check if user already has a Stripe Customer ID
  const [user] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create a new Stripe Customer
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  // Store the customer ID
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, userId));

  return customer.id;
}
