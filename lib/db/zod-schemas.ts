/**
 * Stratos Site — Auto-generated Zod Schemas from Drizzle Tables
 *
 * Uses drizzle-zod to derive validation schemas directly from the
 * database schema. These are used for API request/response validation.
 */
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import {
  users,
  categories,
  products,
  orders,
  orderItems,
  licenses,
  downloads,
  webhookEvents,
} from "./schema";

// ---------------------------------------------------------------------------
// Select schemas (validate data coming FROM the database)
// ---------------------------------------------------------------------------

export const selectUserSchema = createSelectSchema(users);
export const selectCategorySchema = createSelectSchema(categories);
export const selectProductSchema = createSelectSchema(products);
export const selectOrderSchema = createSelectSchema(orders);
export const selectOrderItemSchema = createSelectSchema(orderItems);
export const selectLicenseSchema = createSelectSchema(licenses);
export const selectDownloadSchema = createSelectSchema(downloads);
export const selectWebhookEventSchema = createSelectSchema(webhookEvents);

// ---------------------------------------------------------------------------
// Insert schemas (validate data going INTO the database)
// ---------------------------------------------------------------------------

export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories);
export const insertProductSchema = createInsertSchema(products);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertLicenseSchema = createInsertSchema(licenses);
export const insertDownloadSchema = createInsertSchema(downloads);
export const insertWebhookEventSchema = createInsertSchema(webhookEvents);
