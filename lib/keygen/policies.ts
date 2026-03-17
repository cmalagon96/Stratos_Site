/**
 * Stratos Site -- Keygen License Policy Configurations
 *
 * Maps product types to their respective licensing policies.
 * Policy IDs are set in the Keygen dashboard and referenced here.
 *
 * Policy types:
 *   - SaaS:     No activation limit, subscription-tied, expires with billing
 *   - Desktop:  Max 3 activations, perpetual license
 *   - CLI:      Max 5 activations, perpetual license
 *   - Template: Unlimited activations, one-time purchase, no machine lock
 *   - Report:   Unlimited activations, one-time purchase, no machine lock
 */
import type { ProductType } from "@/lib/db/types";

export interface LicensePolicy {
  /** Human-readable name */
  name: string;
  /** Maximum machine activations (null = unlimited) */
  maxMachines: number | null;
  /** Whether the license requires a subscription (expires with billing cycle) */
  requiresSubscription: boolean;
  /** Whether machine activation is required for validation */
  requiresMachineActivation: boolean;
  /** Duration in seconds (null = perpetual) */
  duration: number | null;
  /** Grace period in seconds for offline validation (null = no grace) */
  offlineGracePeriod: number | null;
}

/**
 * Policy configuration by product type.
 * Machine limits and subscription rules are enforced by Keygen policies;
 * these values mirror what is configured in the Keygen dashboard.
 */
export const LICENSE_POLICIES: Record<ProductType, LicensePolicy> = {
  saas: {
    name: "SaaS Subscription",
    maxMachines: null,
    requiresSubscription: true,
    requiresMachineActivation: false,
    duration: null, // controlled by Stripe subscription
    offlineGracePeriod: null,
  },
  desktop: {
    name: "Desktop Perpetual",
    maxMachines: 3,
    requiresSubscription: false,
    requiresMachineActivation: true,
    duration: null, // perpetual
    offlineGracePeriod: 3 * 24 * 60 * 60, // 3 days
  },
  cli: {
    name: "CLI Perpetual",
    maxMachines: 5,
    requiresSubscription: false,
    requiresMachineActivation: true,
    duration: null, // perpetual
    offlineGracePeriod: 5 * 24 * 60 * 60, // 5 days
  },
  template: {
    name: "Template One-Time",
    maxMachines: null,
    requiresSubscription: false,
    requiresMachineActivation: false,
    duration: null, // perpetual
    offlineGracePeriod: null,
  },
  report: {
    name: "Report One-Time",
    maxMachines: null,
    requiresSubscription: false,
    requiresMachineActivation: false,
    duration: null, // perpetual
    offlineGracePeriod: null,
  },
};

/**
 * Get the policy configuration for a product type.
 */
export function getPolicyForProductType(type: ProductType): LicensePolicy {
  return LICENSE_POLICIES[type];
}
