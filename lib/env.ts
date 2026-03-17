/**
 * Stratos Site — Runtime Environment Validation
 *
 * Validates all required environment variables at startup using Zod.
 * Import `env` from this module instead of reading process.env directly.
 * Fails fast with a clear error message if any variable is missing.
 */
import { z } from "zod";

const envSchema = z.object({
  // Database
  NEON_DATABASE_URL: z.url("Must be a valid Neon Postgres connection string"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),

  // Upstash Redis (rate limiting, caching)
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Keygen.sh (license management)
  KEYGEN_ACCOUNT_ID: z.string().uuid(),
  KEYGEN_PRODUCT_TOKEN: z.string().min(1),

  // Resend (transactional email)
  RESEND_API_KEY: z.string().startsWith("re_"),

  // PostHog (analytics)
  POSTHOG_API_KEY: z.string().min(1).optional(),

  // App
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Missing or invalid environment variables:\n${formatted}\n\nSee .env.example for required variables.`,
    );
  }

  return result.data;
}

/**
 * Validated environment variables.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const dbUrl = env.NEON_DATABASE_URL;
 *
 * Throws at import time if any required variable is missing.
 */
export const env = validateEnv();
