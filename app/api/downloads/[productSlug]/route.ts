/**
 * GET /api/downloads/[productSlug] -- Generate presigned download URL
 *
 * Requires authenticated session. Verifies the user has a valid
 * license/order for this product, generates a presigned S3 URL,
 * records the download, and returns the URL.
 *
 * The client should redirect or open this URL to start the download.
 * URLs expire after 5 minutes.
 */
import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/auth/session";
import {
  verifyDownloadAccess,
  generatePresignedUrl,
  recordDownload,
} from "@/lib/services/downloads";
import { ok, fail, ErrorCodes } from "@/lib/types/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productSlug: string }> },
) {
  try {
    const user = await requireAuth();
    const { productSlug } = await params;

    if (!productSlug) {
      return NextResponse.json(
        fail(ErrorCodes.VALIDATION_FAILED, "Product slug is required"),
        { status: 400 },
      );
    }

    // Verify the user has purchased this product
    const access = await verifyDownloadAccess(user.id, productSlug);

    if (!access.hasAccess) {
      return NextResponse.json(
        fail(ErrorCodes.FORBIDDEN, "You do not have access to download this product"),
        { status: 403 },
      );
    }

    if (!access.s3Key) {
      return NextResponse.json(
        fail(ErrorCodes.NOT_FOUND, "No downloadable file available for this product"),
        { status: 404 },
      );
    }

    // Generate presigned URL (5-minute expiry)
    const url = await generatePresignedUrl(
      access.s3Key,
      access.fileName ?? "download",
      300,
    );

    // Record the download
    await recordDownload(
      user.id,
      access.productId!,
      access.orderId!,
      access.fileName ?? "download",
      access.fileSize ?? 0,
      access.s3Key,
    );

    return NextResponse.json(
      ok({
        url,
        fileName: access.fileName,
        expiresInSeconds: 300,
      }),
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        fail(ErrorCodes.UNAUTHORIZED, err.message),
        { status: err.statusCode },
      );
    }
    console.error("[downloads] GET error:", err);
    return NextResponse.json(
      fail(ErrorCodes.INTERNAL_ERROR, "Failed to generate download URL"),
      { status: 500 },
    );
  }
}
