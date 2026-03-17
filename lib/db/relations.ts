/**
 * Stratos Site — Drizzle Relations
 *
 * Defines the relationships between all tables for Drizzle's
 * relational query builder (db.query.* with `with` clauses).
 */
import { relations } from "drizzle-orm";
import {
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
// Users
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  orders: many(orders),
  licenses: many(licenses),
  downloads: many(downloads),
}));

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// Accounts (OAuth)
// ---------------------------------------------------------------------------

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  licenses: many(licenses),
  downloads: many(downloads),
}));

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  licenses: many(licenses),
  downloads: many(downloads),
}));

// ---------------------------------------------------------------------------
// Order Items
// ---------------------------------------------------------------------------

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// ---------------------------------------------------------------------------
// Licenses
// ---------------------------------------------------------------------------

export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, {
    fields: [licenses.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [licenses.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [licenses.orderId],
    references: [orders.id],
  }),
}));

// ---------------------------------------------------------------------------
// Downloads
// ---------------------------------------------------------------------------

export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [downloads.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [downloads.orderId],
    references: [orders.id],
  }),
}));
