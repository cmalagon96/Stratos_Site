import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Content Security Policy + Auth Route Protection.
 *
 * AUTH STRATEGY (edge runtime limitation):
 *   Edge middleware CANNOT do full DB session validation (requires Node.js runtime).
 *   Instead we do a cookie-only optimistic check: if the session cookie exists,
 *   allow the request through. The actual session validation happens in each
 *   route handler / layout via getSession() or requireAuth().
 *
 *   CVE-2025-29927: This middleware is NOT the sole auth gate. Every protected
 *   route handler MUST independently validate the session.
 *
 * CSP:
 *   Nonce-based script-src for Next.js hydration.
 *   Report-Only in development, enforced in production.
 *
 * ─── PENDING INTEGRATION UPDATES ────────────────────────────────────────────
 * The following domains MUST be added when each service is integrated.
 * DO NOT add them until the service is actually wired in (avoids expanding
 * the attack surface prematurely).
 *
 * 1. Stripe.js (payments -- Phase 4) [DONE]
 *    script-src:  https://js.stripe.com
 *    connect-src: https://api.stripe.com
 *    frame-src:   https://js.stripe.com https://hooks.stripe.com
 *    img-src:     https://*.stripe.com
 *
 * 2. PostHog (analytics -- Phase 3)
 *    script-src:  https://app.posthog.com https://cdn.posthog.com
 *    connect-src: https://app.posthog.com https://ingest.posthog.com
 *
 * 3. Crisp (live chat -- Phase 3)
 *    script-src:  https://client.crisp.chat
 *    connect-src: wss://client.relay.crisp.chat https://client.crisp.chat
 *    img-src:     https://image.crisp.chat https://client.crisp.chat
 *    frame-src:   https://game.crisp.chat
 *    style-src:   https://client.crisp.chat
 *
 * 4. Tolt (affiliate tracking -- Phase 3)
 *    script-src:  https://cdn.tolt.io
 *    connect-src: https://api.tolt.io
 *
 * 5. Better Auth OAuth providers (Phase 3)
 *    form-action:  'self' https://accounts.google.com https://github.com
 *
 * 6. AWS S3 presigned downloads (Phase 3)
 *    connect-src: https://<bucket>.s3.<region>.amazonaws.com
 *    img-src:     https://<bucket>.s3.<region>.amazonaws.com
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Routes that require authentication (cookie-only optimistic check)
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Routes that are always public (no auth check needed)
const PUBLIC_PREFIXES = [
  "/",
  "/products",
  "/pricing",
  "/about",
  "/login",
  "/signup",
  "/api/auth",
  "/api/contact",
  "/api/webhooks",
  "/checkout/success",
  "/checkout/cancel",
];

/**
 * Check if a pathname is public (does not require auth).
 */
function isPublicPath(pathname: string): boolean {
  // Exact match for root
  if (pathname === "/") return true;

  // Check prefixes
  for (const prefix of PUBLIC_PREFIXES) {
    if (prefix === "/") continue; // Already handled
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a pathname requires authentication.
 */
function isProtectedPath(pathname: string): boolean {
  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth: Cookie-only optimistic check for protected routes ──────────
  if (isProtectedPath(pathname) && !isPublicPath(pathname)) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token")?.value ??
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      // Preserve the intended destination for post-login redirect.
      // Only set relative paths to prevent open redirect attacks.
      if (pathname.startsWith("/")) {
        loginUrl.searchParams.set("callbackUrl", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is already authenticated and visits login/signup, redirect to dashboard
  if (pathname === "/login" || pathname === "/signup") {
    const sessionCookie =
      request.cookies.get("better-auth.session_token")?.value ??
      request.cookies.get("__Secure-better-auth.session_token")?.value;

    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ── CSP: Nonce generation ────────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    // Phase 7: Added PostHog (analytics) + Crisp (chat) script sources
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://app.posthog.com https://cdn.posthog.com https://client.crisp.chat`,
    // Framer Motion injects inline styles at runtime — unsafe-inline required
    // Phase 7: Added Crisp stylesheet source
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://client.crisp.chat`,
    // Phase 7: Added Crisp image sources
    `img-src 'self' data: blob: https://*.stripe.com https://image.crisp.chat https://client.crisp.chat`,
    `font-src 'self' https://fonts.gstatic.com`,
    // Phase 7: Added PostHog ingest endpoints + Crisp connect + Crisp relay WebSocket
    `connect-src 'self' https://api.stripe.com https://api.keygen.sh https://*.s3.amazonaws.com https://*.s3.us-east-1.amazonaws.com https://app.posthog.com https://ingest.posthog.com https://client.crisp.chat wss://client.relay.crisp.chat`,
    `worker-src 'self' blob:`,
    // Phase 7: Added Crisp game frame
    `frame-src https://js.stripe.com https://hooks.stripe.com https://game.crisp.chat`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Clone request headers and inject the nonce for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP header -- Report-Only during development, enforce in production
  const cspHeader =
    process.env.NODE_ENV === "production"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only";

  response.headers.set(cspHeader, csp);

  return response;
}

export const config = {
  // Apply to all routes except static files and Next.js internals
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
