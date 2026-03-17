/**
 * Stratos Site — Inferred Database Types
 *
 * Auto-generated types from Drizzle schema using $inferSelect / $inferInsert.
 * Import these instead of manually typing database rows.
 */
import type {
  users,
  sessions,
  accounts,
  categories,
  products,
  orders,
  orderItems,
  licenses,
  downloads,
  webhookEvents,
} from "./schema";

// ---------------------------------------------------------------------------
// Select types (what you get back from a query)
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

// ---------------------------------------------------------------------------
// Insert types (what you pass to an insert)
// ---------------------------------------------------------------------------

export type NewUser = typeof users.$inferInsert;
export type NewSession = typeof sessions.$inferInsert;
export type NewAccount = typeof accounts.$inferInsert;
export type NewCategory = typeof categories.$inferInsert;
export type NewProduct = typeof products.$inferInsert;
export type NewOrder = typeof orders.$inferInsert;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type NewLicense = typeof licenses.$inferInsert;
export type NewDownload = typeof downloads.$inferInsert;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;

// ---------------------------------------------------------------------------
// Enum value types (for use in business logic)
// ---------------------------------------------------------------------------

export type ProductType = Product["type"];
export type OrderStatus = Order["status"];
export type LicenseStatus = License["status"];
export type WebhookProvider = WebhookEvent["provider"];
export type WebhookStatus = WebhookEvent["status"];
export type UserRole = User["role"];
