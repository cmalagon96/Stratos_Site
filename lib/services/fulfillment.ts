/**
 * Stratos Site -- Order Fulfillment Service
 *
 * Called by the Stripe webhook consumer (Phase 4) after a successful payment.
 * For each order item:
 *   1. Creates a Keygen license with the appropriate policy
 *   2. Stores the license in the local database
 *   3. Generates an initial download URL (if product has a downloadable file)
 *   4. Returns license keys + download URLs for the confirmation email
 *
 * This module is the bridge between payment (Stripe) and delivery (Keygen + S3).
 */
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  products,
  licenses,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createLicense } from "@/lib/keygen";
import { getPolicyForProductType } from "@/lib/keygen/policies";
import { generatePresignedUrl } from "@/lib/services/downloads";
import type { ProductType } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FulfillmentItem {
  productId: number;
  productName: string;
  productType: ProductType;
  licenseKey: string;
  downloadUrl: string | null;
}

export interface FulfillmentResult {
  orderId: number;
  items: FulfillmentItem[];
  fulfilledAt: Date;
}

// ---------------------------------------------------------------------------
// Policy ID Mapping
// ---------------------------------------------------------------------------

/**
 * Map product types to Keygen policy IDs.
 *
 * These IDs must match the policies configured in the Keygen dashboard.
 * Set them as environment variables so they can differ between
 * staging and production accounts.
 *
 * Required env vars:
 *   KEYGEN_POLICY_SAAS
 *   KEYGEN_POLICY_DESKTOP
 *   KEYGEN_POLICY_CLI
 *   KEYGEN_POLICY_TEMPLATE
 *   KEYGEN_POLICY_REPORT
 */
function getPolicyId(productType: ProductType): string {
  const envKey = `KEYGEN_POLICY_${productType.toUpperCase()}`;
  const policyId = process.env[envKey];

  if (!policyId) {
    throw new Error(
      `Missing Keygen policy ID for product type "${productType}". ` +
        `Set ${envKey} in your environment.`,
    );
  }

  return policyId;
}

// ---------------------------------------------------------------------------
// Fulfillment
// ---------------------------------------------------------------------------

/**
 * Fulfill an order by creating licenses and generating download URLs.
 *
 * This function is idempotent -- if a license already exists for an
 * order item, it skips creation and returns the existing license.
 *
 * @param orderId - The internal order ID to fulfill
 * @returns Array of fulfilled items with license keys and download URLs
 */
export async function fulfillOrder(
  orderId: number,
): Promise<FulfillmentResult> {
  // Load the order with its items and associated products
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (order.length === 0) {
    throw new Error(`Order ${orderId} not found`);
  }

  const items = await db
    .select({
      orderItem: orderItems,
      product: products,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  if (items.length === 0) {
    throw new Error(`Order ${orderId} has no items`);
  }

  const userId = order[0].userId;
  const fulfilledItems: FulfillmentItem[] = [];

  for (const { orderItem, product } of items) {
    // Check if license already exists for this order+product (idempotency)
    const existingLicense = await db
      .select()
      .from(licenses)
      .where(
        and(eq(licenses.orderId, orderId), eq(licenses.productId, product.id)),
      )
      .limit(1);

    if (existingLicense.length > 0) {
      // License already created -- return existing
      let downloadUrl: string | null = null;
      if (product.downloadUrl) {
        const fileName = product.downloadUrl.split("/").pop() ?? "download";
        downloadUrl = await generatePresignedUrl(
          product.downloadUrl,
          fileName,
        );
      }

      fulfilledItems.push({
        productId: product.id,
        productName: product.name,
        productType: product.type,
        licenseKey: existingLicense[0].key,
        downloadUrl,
      });
      continue;
    }

    // Determine the policy for this product type
    const policyId = getPolicyId(product.type);
    const policyConfig = getPolicyForProductType(product.type);

    // Create the license in Keygen
    const keygenLicense = await createLicense(userId, product.id, policyId, {
      orderId,
      orderItemId: orderItem.id,
      productSlug: product.slug,
    });

    // Store the license locally
    const [localLicense] = await db
      .insert(licenses)
      .values({
        userId,
        productId: product.id,
        orderId,
        keygenLicenseId: keygenLicense.id,
        keygenPolicyId: policyId,
        key: keygenLicense.attributes.key,
        status: "active",
        maxActivations: policyConfig.maxMachines ?? 0,
        currentActivations: 0,
        expiresAt: keygenLicense.attributes.expiry
          ? new Date(keygenLicense.attributes.expiry)
          : null,
      })
      .returning();

    // Update the order item with the license reference
    await db
      .update(orderItems)
      .set({ licenseKeyId: localLicense.id })
      .where(eq(orderItems.id, orderItem.id));

    // Generate download URL if the product has a downloadable file
    let downloadUrl: string | null = null;
    if (product.downloadUrl) {
      const fileName = product.downloadUrl.split("/").pop() ?? "download";
      downloadUrl = await generatePresignedUrl(product.downloadUrl, fileName);
    }

    fulfilledItems.push({
      productId: product.id,
      productName: product.name,
      productType: product.type,
      licenseKey: keygenLicense.attributes.key,
      downloadUrl,
    });
  }

  return {
    orderId,
    items: fulfilledItems,
    fulfilledAt: new Date(),
  };
}
