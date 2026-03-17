/**
 * Stratos Site — Keygen.sh License Types
 *
 * Types for interacting with the Keygen.sh license management API.
 */

/** License validation result from Keygen */
export interface KeygenValidationResult {
  valid: boolean;
  code:
    | "VALID"
    | "EXPIRED"
    | "SUSPENDED"
    | "OVERDUE"
    | "NO_MACHINES"
    | "TOO_MANY_MACHINES"
    | "NOT_FOUND";
  detail: string;
}

/** Keygen license object (subset of API response) */
export interface KeygenLicense {
  id: string;
  type: "licenses";
  attributes: {
    key: string;
    name: string | null;
    expiry: string | null;
    status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED" | "BANNED";
    maxMachines: number;
    uses: number;
    maxUses: number | null;
    protected: boolean;
    metadata: Record<string, unknown>;
    created: string;
    updated: string;
  };
  relationships: {
    policy: { data: { type: "policies"; id: string } };
    product: { data: { type: "products"; id: string } };
    user: { data: { type: "users"; id: string } | null };
  };
}

/** Keygen machine activation object */
export interface KeygenMachine {
  id: string;
  type: "machines";
  attributes: {
    fingerprint: string;
    name: string | null;
    ip: string | null;
    hostname: string | null;
    platform: string | null;
    cores: number | null;
    metadata: Record<string, unknown>;
    created: string;
    updated: string;
  };
}

/** Keygen webhook event types we handle */
export type KeygenWebhookEventType =
  | "license.created"
  | "license.updated"
  | "license.deleted"
  | "license.suspended"
  | "license.expiring-soon"
  | "license.expired"
  | "license.validation.succeeded"
  | "license.validation.failed"
  | "machine.created"
  | "machine.updated"
  | "machine.deleted"
  | "machine.heartbeat.ping"
  | "machine.heartbeat.dead";
