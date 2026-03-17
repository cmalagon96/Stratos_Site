/**
 * Stratos Site — Database Schema
 *
 * All tables for the product platform: users, auth, products, orders,
 * licenses, downloads, and webhook event tracking.
 *
 * ORM: Drizzle ORM 0.45 + PostgreSQL (Neon)
 */
import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  jsonb,
  bigint,
  serial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const productTypeEnum = pgEnum("product_type", [
  "saas",
  "desktop",
  "cli",
  "template",
  "report",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed",
  "refunded",
  "failed",
]);

export const licenseStatusEnum = pgEnum("license_status", [
  "active",
  "suspended",
  "expired",
  "revoked",
]);

export const webhookProviderEnum = pgEnum("webhook_provider", [
  "stripe",
  "keygen",
]);

export const webhookStatusEnum = pgEnum("webhook_status", [
  "pending",
  "processed",
  "failed",
]);

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

// ---------------------------------------------------------------------------
// Users (application-level — Better Auth manages sessions/accounts)
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // cuid / nanoid from Better Auth
    email: text("email").notNull(),
    name: text("name"),
    avatar: text("avatar"),
    role: userRoleEnum("role").default("customer").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

// ---------------------------------------------------------------------------
// Better Auth — sessions
// ---------------------------------------------------------------------------

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("sessions_user_id_idx").on(t.userId),
    uniqueIndex("sessions_token_idx").on(t.token),
  ],
);

// ---------------------------------------------------------------------------
// Better Auth — OAuth accounts
// ---------------------------------------------------------------------------

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    shortDescription: text("short_description"),
    type: productTypeEnum("type").notNull(),
    /** Price in smallest currency unit (cents) */
    price: integer("price").notNull(),
    currency: text("currency").default("usd").notNull(),
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    /** JSON array of feature strings */
    features: jsonb("features").$type<string[]>().default([]).notNull(),
    /** JSON array of screenshot URLs */
    screenshots: jsonb("screenshots").$type<string[]>().default([]).notNull(),
    downloadUrl: text("download_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_id_idx").on(t.categoryId),
    index("products_type_idx").on(t.type),
    index("products_is_active_idx").on(t.isActive),
  ],
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    status: orderStatusEnum("status").default("pending").notNull(),
    /** Total in smallest currency unit (cents) */
    totalAmount: integer("total_amount").notNull(),
    /** Tax in smallest currency unit (cents) */
    taxAmount: integer("tax_amount").default(0).notNull(),
    currency: text("currency").default("usd").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("orders_user_id_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    uniqueIndex("orders_stripe_checkout_idx").on(t.stripeCheckoutSessionId),
    index("orders_stripe_payment_intent_idx").on(t.stripePaymentIntentId),
  ],
);

// ---------------------------------------------------------------------------
// Order Items
// ---------------------------------------------------------------------------

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    quantity: integer("quantity").default(1).notNull(),
    /** Unit price in smallest currency unit (cents) */
    unitPrice: integer("unit_price").notNull(),
    licenseKeyId: integer("license_key_id"),
  },
  (t) => [
    index("order_items_order_id_idx").on(t.orderId),
    index("order_items_product_id_idx").on(t.productId),
  ],
);

// ---------------------------------------------------------------------------
// Licenses
// ---------------------------------------------------------------------------

export const licenses = pgTable(
  "licenses",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    /** Keygen.sh license ID */
    keygenLicenseId: text("keygen_license_id"),
    /** Keygen.sh policy ID */
    keygenPolicyId: text("keygen_policy_id"),
    /** The license key string */
    key: text("key").notNull(),
    status: licenseStatusEnum("status").default("active").notNull(),
    maxActivations: integer("max_activations").default(3).notNull(),
    currentActivations: integer("current_activations").default(0).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("licenses_user_id_idx").on(t.userId),
    index("licenses_product_id_idx").on(t.productId),
    index("licenses_order_id_idx").on(t.orderId),
    uniqueIndex("licenses_key_idx").on(t.key),
    index("licenses_status_idx").on(t.status),
  ],
);

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------

export const downloads = pgTable(
  "downloads",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    fileName: text("file_name").notNull(),
    /** File size in bytes */
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    /** S3 object key */
    s3Key: text("s3_key").notNull(),
    downloadCount: integer("download_count").default(0).notNull(),
    lastDownloadedAt: timestamp("last_downloaded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("downloads_user_id_idx").on(t.userId),
    index("downloads_product_id_idx").on(t.productId),
    index("downloads_order_id_idx").on(t.orderId),
  ],
);

// ---------------------------------------------------------------------------
// Webhook Events (audit log for Stripe / Keygen webhooks)
// ---------------------------------------------------------------------------

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: serial("id").primaryKey(),
    provider: webhookProviderEnum("provider").notNull(),
    /** The provider's unique event ID (for idempotency) */
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    /** Raw JSON payload */
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    status: webhookStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("webhook_events_event_id_idx").on(t.eventId),
    index("webhook_events_provider_idx").on(t.provider),
    index("webhook_events_status_idx").on(t.status),
  ],
);
