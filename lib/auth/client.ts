/**
 * Stratos Site -- Better Auth Client
 *
 * Client-side auth utilities for React components.
 * Import this in "use client" components for sign-in, sign-up,
 * sign-out, session hooks, and passkey operations.
 */
import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  // Base URL is optional when client and server share the same origin.
  // Explicitly set it for clarity and SSR consistency.
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000",
  plugins: [passkeyClient()],
});

// Re-export commonly used utilities for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
