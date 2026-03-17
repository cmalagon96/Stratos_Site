/**
 * Stratos Site -- Better Auth Server Configuration
 *
 * Central auth instance used by the API route handler and server-side
 * session helpers. Uses Drizzle adapter with Neon Postgres.
 *
 * Plugins: email/password, passkeys (WebAuthn/FIDO2).
 * Session strategy: database-backed sessions with HTTP-only cookies.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    // Map plural table names used in our schema to Better Auth's expected models
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
    },
  }),

  // Base URL for auth endpoints -- used for cookie domain, redirect validation
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,

  // Secret for signing tokens and cookies
  secret: process.env.BETTER_AUTH_SECRET,

  // Email + password authentication
  emailAndPassword: {
    enabled: true,
    // Enforce minimum 12-char passwords per security checklist
    minPasswordLength: 12,
    // Auto sign in after registration
    autoSignIn: true,
  },

  // Session configuration
  session: {
    // Database-backed sessions (not JWT)
    strategy: "database",
    // 7-day session expiry
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Refresh session when accessed within 1 day of expiry
    updateAge: 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes -- edge middleware uses cookie-only check
    },
  },

  // User model configuration -- maps to our users table
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // Cannot be set via signup -- only via DB/admin
      },
    },
  },

  // Trusted origins for CORS and redirect validation
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000",
  ],

  // Plugins
  plugins: [
    passkey({
      rpID:
        process.env.NODE_ENV === "production"
          ? process.env.PASSKEY_RP_ID ?? "stratos.dev"
          : "localhost",
      rpName: "Stratos Strategies",
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_APP_URL ?? "https://stratos.dev"
          : "http://localhost:4000",
    }),
  ],
});

// Export the auth type for client-side type inference
export type Auth = typeof auth;
