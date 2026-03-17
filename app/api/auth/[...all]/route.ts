/**
 * Better Auth -- Catch-all API Route Handler
 *
 * Mounts at /api/auth/[...all] to handle all Better Auth endpoints:
 *   - POST /api/auth/sign-up/email
 *   - POST /api/auth/sign-in/email
 *   - POST /api/auth/sign-out
 *   - GET  /api/auth/session
 *   - POST /api/auth/passkey/*
 *   - etc.
 *
 * No collision with /api/contact (separate route segment).
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
