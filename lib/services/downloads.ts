/**
 * Stratos Site -- Download Service
 *
 * Handles S3 presigned URL generation and download tracking.
 * Used by the download API routes and fulfillment service.
 *
 * S3 bucket is provisioned in sst.config.ts as "ProductFiles".
 * Presigned URLs expire after 5 minutes by default.
 */
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/lib/db";
import { downloads, products, licenses, orders, orderItems } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { Download } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// S3 Client
// ---------------------------------------------------------------------------

/**
 * S3 client configured for the same region as the SST deployment.
 * In SST v4, the bucket name is available via the Resource module,
 * but we also support a fallback env var for local development.
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
});

/**
 * Get the S3 bucket name from SST Resource binding or env var.
 */
function getBucketName(): string {
  // SST v4 injects resource names as env vars: PRODUCT_FILES_BUCKET_NAME
  // or via the sst/resource module
  const bucketName =
    process.env.PRODUCT_FILES_BUCKET_NAME ??
    process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error(
      "S3 bucket name not configured. Set PRODUCT_FILES_BUCKET_NAME or S3_BUCKET_NAME.",
    );
  }
  return bucketName;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PresignedDownload {
  url: string;
  expiresInSeconds: number;
  fileName: string;
  fileSize: number;
}

export interface DownloadHistoryItem {
  id: number;
  productName: string;
  productSlug: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  lastDownloadedAt: Date | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Presigned URL generation
// ---------------------------------------------------------------------------

/**
 * Generate a presigned S3 download URL.
 *
 * @param s3Key         - The S3 object key (path within the bucket)
 * @param fileName      - Original file name for Content-Disposition header
 * @param expirySeconds - URL expiry in seconds (default 300 = 5 minutes)
 * @returns Presigned URL string
 */
export async function generatePresignedUrl(
  s3Key: string,
  fileName: string,
  expirySeconds = 300,
): Promise<string> {
  // Sanitize filename to prevent header injection via " or ; characters
  const sanitizedFileName = fileName.replace(/[";\\]/g, "_");

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${sanitizedFileName}"`,
  });

  return getSignedUrl(s3, command, { expiresIn: expirySeconds });
}

// ---------------------------------------------------------------------------
// Download tracking
// ---------------------------------------------------------------------------

/**
 * Record a download event and increment the download counter.
 *
 * If a download record already exists for this user+product+order,
 * the counter is incremented. Otherwise a new record is created.
 *
 * @returns The download record (created or updated)
 */
export async function recordDownload(
  userId: string,
  productId: number,
  orderId: number,
  fileName: string,
  fileSize: number,
  s3Key: string,
): Promise<Download> {
  // Check for existing download record
  const existing = await db
    .select()
    .from(downloads)
    .where(
      and(
        eq(downloads.userId, userId),
        eq(downloads.productId, productId),
        eq(downloads.orderId, orderId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Increment counter and update timestamp
    const [updated] = await db
      .update(downloads)
      .set({
        downloadCount: sql`${downloads.downloadCount} + 1`,
        lastDownloadedAt: new Date(),
      })
      .where(eq(downloads.id, existing[0].id))
      .returning();
    return updated;
  }

  // Create new record
  const [created] = await db
    .insert(downloads)
    .values({
      userId,
      productId,
      orderId,
      fileName,
      fileSize,
      s3Key,
      downloadCount: 1,
      lastDownloadedAt: new Date(),
    })
    .returning();

  return created;
}

/**
 * Get download history for a user, ordered by most recent first.
 */
export async function getDownloadHistory(
  userId: string,
): Promise<DownloadHistoryItem[]> {
  const rows = await db
    .select({
      id: downloads.id,
      productName: products.name,
      productSlug: products.slug,
      fileName: downloads.fileName,
      fileSize: downloads.fileSize,
      downloadCount: downloads.downloadCount,
      lastDownloadedAt: downloads.lastDownloadedAt,
      createdAt: downloads.createdAt,
    })
    .from(downloads)
    .innerJoin(products, eq(downloads.productId, products.id))
    .where(eq(downloads.userId, userId))
    .orderBy(desc(downloads.lastDownloadedAt));

  return rows;
}

/**
 * Get available downloads for a user -- products they have a valid
 * license/order for that include downloadable files.
 */
export async function getAvailableDownloads(
  userId: string,
): Promise<
  {
    productId: number;
    productName: string;
    productSlug: string;
    productType: string;
    orderId: number;
    licenseKey: string | null;
    downloadUrl: string | null;
  }[]
> {
  // Find all completed orders for this user and their associated products
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productType: products.type,
      orderId: orders.id,
      licenseKey: licenses.key,
      downloadUrl: products.downloadUrl,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(
      licenses,
      and(
        eq(licenses.userId, orders.userId),
        eq(licenses.productId, products.id),
        eq(licenses.orderId, orders.id),
      ),
    )
    .where(
      and(eq(orders.userId, userId), eq(orders.status, "completed")),
    )
    .orderBy(desc(orders.createdAt));

  return rows;
}

/**
 * Verify that a user has access to download a specific product.
 * Returns the order ID and product details if they have a valid purchase.
 */
export async function verifyDownloadAccess(
  userId: string,
  productSlug: string,
): Promise<{
  hasAccess: boolean;
  productId: number | null;
  orderId: number | null;
  s3Key: string | null;
  fileName: string | null;
  fileSize: number | null;
}> {
  // Find a completed order for this product with an active license
  const rows = await db
    .select({
      productId: products.id,
      orderId: orders.id,
      downloadUrl: products.downloadUrl,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(
      licenses,
      and(
        eq(licenses.orderId, orders.id),
        eq(licenses.productId, products.id),
        eq(licenses.userId, orders.userId),
      ),
    )
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "completed"),
        eq(products.slug, productSlug),
        eq(licenses.status, "active"),
      ),
    )
    .limit(1);

  if (rows.length === 0 || !rows[0].downloadUrl) {
    return {
      hasAccess: rows.length > 0,
      productId: rows[0]?.productId ?? null,
      orderId: rows[0]?.orderId ?? null,
      s3Key: null,
      fileName: null,
      fileSize: null,
    };
  }

  const downloadUrl = rows[0].downloadUrl;
  // downloadUrl is the S3 key (e.g., "products/my-tool/v1.0/installer.zip")
  const fileName = downloadUrl.split("/").pop() ?? "download";

  return {
    hasAccess: true,
    productId: rows[0].productId,
    orderId: rows[0].orderId,
    s3Key: downloadUrl,
    fileName,
    fileSize: 0, // Will be populated from actual S3 metadata on first download
  };
}
