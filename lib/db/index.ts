/**
 * Stratos Site — Drizzle Client
 *
 * Connects to Neon Postgres over HTTP (serverless-friendly).
 * Uses the @neondatabase/serverless driver for edge/Lambda compatibility.
 *
 * The client is lazy-initialized via Proxy so that importing this module
 * during `next build` (when NEON_DATABASE_URL is absent) does not crash.
 * The real neon() + drizzle() call happens on first property access at
 * runtime, when the env var is guaranteed to exist.
 */
// Validate environment variables on first DB module load
import "@/lib/env";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./relations";

const combinedSchema = { ...schema, ...relations };

let _db: NeonHttpDatabase<typeof combinedSchema> | null = null;

export function getDb(): NeonHttpDatabase<typeof combinedSchema> {
  if (!_db) {
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error(
        "NEON_DATABASE_URL is not set. Database calls require this environment variable at runtime.",
      );
    }
    const sql = neon(process.env.NEON_DATABASE_URL);
    _db = drizzle(sql, { schema: combinedSchema });
  }
  return _db;
}

/**
 * Backward-compatible lazy `db` export.
 * All property accesses are forwarded to the real Drizzle instance,
 * which is only created on first use (not at import time).
 */
export const db = new Proxy({} as NeonHttpDatabase<typeof combinedSchema>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

// Re-export schema and relations for convenience
export { schema, relations };
