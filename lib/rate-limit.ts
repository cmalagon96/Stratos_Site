/**
 * In-memory rate limiter for API routes.
 * Key by IP address, sliding window approach.
 *
 * NOTE: This is per-instance — in a Lambda@Edge deployment each cold start
 * gets its own Map. Acceptable for a contact form; not suitable for
 * high-traffic APIs where you'd want Redis/DynamoDB.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 10 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  store.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  });
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the client can retry (only set when blocked) */
  retryAfterSeconds?: number;
  /** Requests remaining in the current window */
  remaining: number;
}

export function rateLimit(
  ip: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 15 * 60 * 1000 },
): RateLimitResult {
  const { maxRequests, windowMs } = config;
  const now = Date.now();

  cleanup(windowMs);

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
  };
}

/**
 * Extract client IP from request headers.
 * Checks CloudFront / Cloudflare / generic proxy headers.
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);

  // CloudFront (SST deploys behind CloudFront)
  const cfIp = headers.get('x-forwarded-for');
  if (cfIp) {
    // x-forwarded-for can be comma-separated; leftmost is the client
    return cfIp.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnecting = headers.get('cf-connecting-ip');
  if (cfConnecting) return cfConnecting;

  return '127.0.0.1';
}
