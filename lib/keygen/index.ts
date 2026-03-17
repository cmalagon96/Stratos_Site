/**
 * Stratos Site -- Keygen.sh API Client
 *
 * Thin proxy over the Keygen.sh REST API (JSON:API format).
 * All license CRUD, validation, and machine activation flows go through here.
 *
 * Keygen API docs: https://keygen.sh/docs/api/
 *
 * NEVER import this in client components -- the product token is server-only.
 */
import type {
  KeygenLicense,
  KeygenMachine,
  KeygenValidationResult,
} from "@/lib/types/keygen";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const KEYGEN_ACCOUNT_ID = process.env.KEYGEN_ACCOUNT_ID;
const KEYGEN_PRODUCT_TOKEN = process.env.KEYGEN_PRODUCT_TOKEN;
const KEYGEN_API_BASE = "https://api.keygen.sh/v1/accounts";

function getBaseUrl(): string {
  if (!KEYGEN_ACCOUNT_ID) {
    throw new Error(
      "KEYGEN_ACCOUNT_ID is not set. Add it to .env.local or set via `sst secret set KeygenAccountId <value>`.",
    );
  }
  return `${KEYGEN_API_BASE}/${KEYGEN_ACCOUNT_ID}`;
}

function getAuthHeaders(): Record<string, string> {
  if (!KEYGEN_PRODUCT_TOKEN) {
    throw new Error(
      "KEYGEN_PRODUCT_TOKEN is not set. Add it to .env.local or set via `sst secret set KeygenProductToken <value>`.",
    );
  }
  return {
    Authorization: `Bearer ${KEYGEN_PRODUCT_TOKEN}`,
    "Content-Type": "application/vnd.api+json",
    Accept: "application/vnd.api+json",
  };
}

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

export class KeygenError extends Error {
  public readonly statusCode: number;
  public readonly keygenCode: string | null;
  public readonly detail: string | null;

  constructor(
    message: string,
    statusCode: number,
    keygenCode: string | null = null,
    detail: string | null = null,
  ) {
    super(message);
    this.name = "KeygenError";
    this.statusCode = statusCode;
    this.keygenCode = keygenCode;
    this.detail = detail;
  }
}

interface KeygenApiError {
  title: string;
  detail: string;
  code: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Keygen API error: ${response.status}`;
    let keygenCode: string | null = null;
    let detail: string | null = null;

    try {
      const body = await response.json();
      const errors: KeygenApiError[] = body.errors ?? [];
      if (errors.length > 0) {
        errorMessage = errors[0].title;
        keygenCode = errors[0].code;
        detail = errors[0].detail;
      }
    } catch {
      // Response body wasn't JSON -- use status text
    }

    throw new KeygenError(errorMessage, response.status, keygenCode, detail);
  }

  // 204 No Content (e.g., DELETE responses)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// License Operations
// ---------------------------------------------------------------------------

/**
 * Create a new license in Keygen.
 *
 * @param userId     - Internal user ID (stored as metadata)
 * @param productId  - Internal product ID (stored as metadata)
 * @param policyId   - Keygen policy ID (from dashboard, determines activation rules)
 * @param metadata   - Additional metadata to store on the license
 * @returns The created Keygen license object
 */
export async function createLicense(
  userId: string,
  productId: number,
  policyId: string,
  metadata: Record<string, unknown> = {},
): Promise<KeygenLicense> {
  const response = await fetch(`${getBaseUrl()}/licenses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      data: {
        type: "licenses",
        attributes: {
          metadata: {
            ...metadata,
            stratosUserId: userId,
            stratosProductId: productId,
          },
        },
        relationships: {
          policy: {
            data: { type: "policies", id: policyId },
          },
        },
      },
    }),
  });

  const body = await handleResponse<{ data: KeygenLicense }>(response);
  return body.data;
}

/**
 * Validate a license key.
 *
 * This endpoint does NOT require authentication -- shipped software
 * can call it directly. Uses the validate-key action.
 *
 * @param licenseKey - The license key string to validate
 * @returns Validation result with code and detail
 */
export async function validateLicense(
  licenseKey: string,
): Promise<KeygenValidationResult> {
  const response = await fetch(`${getBaseUrl()}/licenses/actions/validate-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      meta: {
        key: licenseKey,
      },
    }),
  });

  // Keygen returns 200 even for invalid keys -- the validation result
  // is in the response body, not the status code.
  // However, non-2xx responses (429, 503, 401) indicate real API errors
  // and must NOT be silently treated as "invalid license."
  if (!response.ok && response.status !== 404) {
    // For non-OK, non-404 responses, throw so callers can distinguish
    // "license invalid" from "Keygen service unavailable"
    await handleResponse<never>(response);
  }

  const body = await response.json();

  return {
    valid: body.meta?.valid ?? false,
    code: body.meta?.code ?? "NOT_FOUND",
    detail: body.meta?.detail ?? "Unknown validation result",
  };
}

/**
 * Suspend a license (e.g., on refund or subscription cancellation).
 * A suspended license will always fail validation.
 *
 * @param licenseId - The Keygen license ID (not the key)
 */
export async function suspendLicense(licenseId: string): Promise<KeygenLicense> {
  const response = await fetch(
    `${getBaseUrl()}/licenses/${licenseId}/actions/suspend`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  const body = await handleResponse<{ data: KeygenLicense }>(response);
  return body.data;
}

/**
 * Revoke (permanently delete) a license.
 *
 * @param licenseId - The Keygen license ID (not the key)
 */
export async function revokeLicense(licenseId: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/licenses/${licenseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse<void>(response);
}

// ---------------------------------------------------------------------------
// Machine (Device Activation) Operations
// ---------------------------------------------------------------------------

/**
 * Activate a machine for a license (device fingerprinting).
 *
 * @param licenseId   - The Keygen license ID
 * @param fingerprint - Unique device fingerprint (hardware hash, MAC, etc.)
 * @param name        - Human-readable device name (optional)
 * @param platform    - OS platform string (optional)
 * @returns The created machine activation object
 */
export async function activateMachine(
  licenseId: string,
  fingerprint: string,
  name?: string,
  platform?: string,
): Promise<KeygenMachine> {
  const response = await fetch(`${getBaseUrl()}/machines`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      data: {
        type: "machines",
        attributes: {
          fingerprint,
          ...(name && { name }),
          ...(platform && { platform }),
        },
        relationships: {
          license: {
            data: { type: "licenses", id: licenseId },
          },
        },
      },
    }),
  });

  const body = await handleResponse<{ data: KeygenMachine }>(response);
  return body.data;
}

/**
 * Deactivate (remove) a machine from a license.
 *
 * @param machineId - The Keygen machine ID
 */
export async function deactivateMachine(machineId: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/machines/${machineId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse<void>(response);
}

/**
 * List all activated machines for a license.
 *
 * @param licenseId - The Keygen license ID
 * @returns Array of machine activation objects
 */
export async function listMachines(
  licenseId: string,
): Promise<KeygenMachine[]> {
  const response = await fetch(
    `${getBaseUrl()}/licenses/${licenseId}/machines`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const body = await handleResponse<{ data: KeygenMachine[] }>(response);
  return body.data;
}

/**
 * Retrieve a single license by its Keygen ID.
 *
 * @param licenseId - The Keygen license ID
 * @returns The license object
 */
export async function getLicense(licenseId: string): Promise<KeygenLicense> {
  const response = await fetch(`${getBaseUrl()}/licenses/${licenseId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const body = await handleResponse<{ data: KeygenLicense }>(response);
  return body.data;
}
