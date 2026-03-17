/**
 * Stratos Site -- Session Authentication Helper
 *
 * Server-side session utilities that wrap Better Auth's API.
 * Use these in server components, route handlers, and server actions.
 *
 * This is a server-only module -- never import from client components.
 *
 * CVE-2025-29927: NEVER rely on middleware as sole auth gate.
 * Always call getSession() / requireAuth() in every protected route handler.
 */
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: "customer" | "admin";
}

export interface SessionResult {
  user: AuthenticatedUser | null;
  error: string | null;
}

/**
 * Extract and validate the current user session via Better Auth.
 *
 * Uses Better Auth's native session validation which handles
 * cookie parsing, token verification, and DB lookup internally.
 *
 * Returns { user: null, error: "..." } if unauthenticated.
 */
export async function getSession(): Promise<SessionResult> {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) {
      return { user: null, error: "No active session" };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        // Better Auth stores additional fields -- role comes from our users table
        role: (session.user as Record<string, unknown>).role as "customer" | "admin" ?? "customer",
      },
      error: null,
    };
  } catch (err) {
    console.error("[auth] Session validation error:", err);
    return { user: null, error: "Session validation failed" };
  }
}

/**
 * Require an authenticated session. Returns the user or throws
 * a response-ready error object.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const { user, error } = await getSession();
  if (!user) {
    throw new AuthError(error ?? "Unauthorized");
  }
  return user;
}

/**
 * Require the authenticated user to have admin role.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new AuthError("Forbidden: admin access required", 403);
  }
  return user;
}

export class AuthError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
