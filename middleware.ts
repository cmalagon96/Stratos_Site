import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Content Security Policy with nonce generation.
 *
 * Must allow:
 * - Three.js WebGL: blob: in img-src, worker-src
 * - Framer Motion: unsafe-inline in style-src (dynamic style injection)
 * - Google Fonts: fonts.googleapis.com in style-src, fonts.gstatic.com in font-src
 * - Inline scripts with nonce for Next.js hydration
 */
export function middleware(request: NextRequest) {
  // Generate a random nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Build CSP directives
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Framer Motion injects inline styles at runtime — unsafe-inline required
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob:`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self'`,
    `worker-src 'self' blob:`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ]
    .join("; ")
    // Collapse any accidental double spaces
    .replace(/\s{2,}/g, " ")
    .trim();

  // Clone request headers and inject the nonce for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP header — use Report-Only during development so nothing breaks,
  // enforce in production
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
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
