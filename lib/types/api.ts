/**
 * Stratos Site — API Response Envelope Types
 *
 * Standard response shapes for all API endpoints.
 * Every endpoint returns either a success or error envelope.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Helper constructors (use in API handlers)
// ---------------------------------------------------------------------------

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function paginated<T>(
  data: T[],
  pagination: PaginationMeta,
): PaginatedResponse<T> {
  return { success: true, data, pagination };
}

export function fail(
  code: string,
  message: string,
  details?: Record<string, string[]>,
): ApiError {
  return { success: false, error: { code, message, details } };
}

// ---------------------------------------------------------------------------
// Common error codes
// ---------------------------------------------------------------------------

export const ErrorCodes = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
