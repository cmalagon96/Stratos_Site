/**
 * Stratos Site -- Admin User Seed Script
 *
 * One-time script to create or promote the admin user.
 * Admin role is stored directly in the database -- NOT via env var.
 *
 * Usage:
 *   npx tsx lib/db/seed-admin.ts <email>
 *
 * This script:
 *   1. Looks up the user by email in the users table
 *   2. If found, sets their role to "admin"
 *   3. If not found, prints instructions to register first
 *
 * The admin must register via the normal signup flow first,
 * then run this script to elevate their role.
 *
 * Prerequisites:
 *   - NEON_DATABASE_URL env var set (or .env.local loaded)
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users } from "./schema";

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx lib/db/seed-admin.ts <email>");
    console.error("Example: npx tsx lib/db/seed-admin.ts admin@stratos.dev");
    process.exit(1);
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error("Error: NEON_DATABASE_URL environment variable is not set.");
    console.error("Set it in .env.local or export it in your shell.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log(`Looking up user: ${email}`);

  const result = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) {
    console.error(`\nUser not found: ${email}`);
    console.error("The user must register via /signup first, then run this script.");
    process.exit(1);
  }

  const user = result[0];

  if (user.role === "admin") {
    console.log(`User ${email} is already an admin. No changes made.`);
    process.exit(0);
  }

  await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, user.id));

  console.log(`\nAdmin role granted to: ${email}`);
  console.log("The user can now access /admin routes.");
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
