"use client";

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types (mirrors API response shape)
// ---------------------------------------------------------------------------

interface LicenseRow {
  id: number;
  key: string;
  maskedKey: string;
  status: "active" | "suspended" | "expired" | "revoked";
  maxActivations: number;
  currentActivations: number;
  expiresAt: string | null;
  createdAt: string;
  keygenLicenseId: string | null;
  productId: number;
  productName: string;
  productSlug: string;
  productType: string;
}

interface Machine {
  id: string;
  attributes: {
    fingerprint: string;
    name: string | null;
    platform: string | null;
    created: string;
  };
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, string> = {
  active: "text-emerald border-emerald/20 bg-emerald/5",
  suspended: "text-amber-400 border-amber-400/20 bg-amber-400/5",
  expired: "text-text-lo border-text-lo/20 bg-text-lo/5",
  revoked: "text-red-400 border-red-400/20 bg-red-400/5",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[0.5rem] uppercase tracking-[0.3em] ${STATUS_STYLES[status] ?? STATUS_STYLES.expired}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LicensesClient() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLicenses() {
      try {
        const res = await fetch("/api/licenses");
        const json = await res.json();
        if (json.success) {
          setLicenses(json.data);
        } else {
          setError(json.error?.message ?? "Failed to load licenses");
        }
      } catch {
        setError("Failed to load licenses");
      } finally {
        setLoading(false);
      }
    }
    fetchLicenses();
  }, []);

  const toggleExpand = useCallback(
    async (license: LicenseRow) => {
      if (expandedId === license.id) {
        setExpandedId(null);
        setMachines([]);
        return;
      }

      setExpandedId(license.id);
      setMachinesLoading(true);

      // For products that require activation, fetch machines from Keygen
      // via a client-side call (proxied through our API in a future iteration)
      // For now, show the activation count from the local DB
      setMachines([]);
      setMachinesLoading(false);
    },
    [expandedId],
  );

  const copyKey = useCallback(async (license: LicenseRow) => {
    try {
      await navigator.clipboard.writeText(license.key);
      setCopiedId(license.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, []);

  const deactivateDevice = useCallback(
    async (licenseKey: string, machineId: string) => {
      try {
        const res = await fetch(`/api/licenses/${licenseKey}/deactivate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ machineId }),
        });
        const json = await res.json();
        if (json.success) {
          setMachines((prev) => prev.filter((m) => m.id !== machineId));
          setLicenses((prev) =>
            prev.map((l) =>
              l.key === licenseKey
                ? { ...l, currentActivations: Math.max(0, l.currentActivations - 1) }
                : l,
            ),
          );
        }
      } catch {
        // Silently fail -- UI stays consistent
      }
    },
    [],
  );

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass p-6">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="text-[0.52rem] uppercase tracking-[0.4em] text-emerald"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                License Key
              </span>
              <div className="h-2.5 w-14 animate-pulse rounded-none bg-surface" />
            </div>
            <div className="mb-4 h-7 w-full animate-pulse rounded-none bg-surface" />
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-24 animate-pulse rounded-none bg-surface" />
              <div className="h-2.5 w-20 animate-pulse rounded-none bg-surface" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="glass p-10 text-center">
        <p
          className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          No licenses found. Purchase a product to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {licenses.map((license) => (
        <div key={license.id} className="glass p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <span
              className="text-[0.52rem] uppercase tracking-[0.4em] text-emerald"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {license.productName}
            </span>
            <StatusBadge status={license.status} />
          </div>

          {/* Masked key with copy button */}
          <div className="mb-4 flex items-center gap-2">
            <code
              className="flex-1 truncate text-xs text-text-hi"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {license.maskedKey}
            </code>
            <button
              type="button"
              onClick={() => copyKey(license)}
              className="shrink-0 border border-[oklch(72%_0.19_160/0.12)] px-2 py-1 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:border-emerald/30 hover:text-emerald"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {copiedId === license.id ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between text-[0.5rem] text-text-lo">
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {license.productType.toUpperCase()}
            </span>
            {license.maxActivations > 0 && (
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {license.currentActivations}/{license.maxActivations} devices
              </span>
            )}
          </div>

          {/* Expand for devices */}
          {license.maxActivations > 0 && license.currentActivations > 0 && (
            <button
              type="button"
              onClick={() => toggleExpand(license)}
              className="mt-3 w-full border-t border-[oklch(72%_0.19_160/0.06)] pt-3 text-left text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:text-emerald"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {expandedId === license.id ? "Hide devices" : "Show devices"}
            </button>
          )}

          {/* Expanded device list */}
          {expandedId === license.id && (
            <div className="mt-3 space-y-2">
              {machinesLoading ? (
                <div className="h-8 animate-pulse bg-surface" />
              ) : machines.length > 0 ? (
                machines.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border border-[oklch(72%_0.19_160/0.06)] px-3 py-2"
                  >
                    <div>
                      <p
                        className="text-[0.55rem] text-text-mid"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {m.attributes.name ?? m.attributes.fingerprint.slice(0, 16)}
                      </p>
                      <p className="text-[0.45rem] text-text-lo">
                        {m.attributes.platform ?? "Unknown platform"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deactivateDevice(license.key, m.id)}
                      className="text-[0.45rem] uppercase tracking-[0.3em] text-red-400/60 transition-colors hover:text-red-400"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p
                  className="text-[0.5rem] text-text-lo"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {license.currentActivations} device(s) activated.
                  Device details available from the desktop application.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
