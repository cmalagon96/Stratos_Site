/**
 * P0-04: Upstash Redis rate limiter for API routes.
 *
 * Replaces the previous in-memory Map implementation that reset on every
 * Lambda cold start. Uses @upstash/ratelimit with a sliding window algorithm
 * backed by Upstash Redis — works correctly across Lambda instances and
 * cold starts.
 *
 * Requires environment variables:
 *   UPSTASH_REDIS_REST_URL   — Upstash Redis REST endpoint
 *   UPSTASH_REDIS_REST_TOKEN — Upstash Redis REST auth token
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Create the Upstash Redis client. Falls back gracefully if env vars are
 * missing (development without Redis) — rateLimit() will allow all requests.
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedisClient();

/**
 * Sliding-window rate limiter: 5 requests per 15-minute window.
 * Declared at module scope so the instance is reused across warm invocations.
 */
const rateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: false,
      prefix: "stratos:ratelimit",
    })
  : null;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the client can retry (only set when blocked) */
  retryAfterSeconds?: number;
  /** Requests remaining in the current window */
  remaining: number;
}

/**
 * Check rate limit for a given identifier (typically client IP).
 *
 * When Upstash is not configured (missing env vars), all requests are allowed
 * so local development is not blocked.
 */
export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  if (!rateLimiter) {
    // Upstash not configured — allow everything (dev fallback)
    console.warn("[rate-limit] Upstash not configured — allowing all requests");
    return { allowed: true, remaining: 999 };
  }

  const { success, remaining, reset } = await rateLimiter.limit(identifier);

  if (!success) {
    const retryAfterMs = Math.max(0, reset - Date.now());
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining,
  };
}

/**
 * Extract client IP from request headers.
 * Checks CloudFront viewer address (not spoofable), then falls back
 * to the rightmost x-forwarded-for entry, then Cloudflare headers.
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);

  // CloudFront injects the real viewer IP in this header (cannot be spoofed)
  const viewerAddr = headers.get("cloudfront-viewer-address");
  if (viewerAddr) return viewerAddr.split(":")[0];

  // Fallback: rightmost x-forwarded-for entry (last proxy-appended value)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    return ips[ips.length - 1];
  }

  // Cloudflare
  const cfConnecting = headers.get("cf-connecting-ip");
  if (cfConnecting) return cfConnecting;

  return "127.0.0.1";
}
