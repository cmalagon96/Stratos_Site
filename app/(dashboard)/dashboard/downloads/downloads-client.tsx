"use client";

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AvailableDownload {
  productId: number;
  productName: string;
  productSlug: string;
  productType: string;
  orderId: number;
  licenseKey: string | null;
  downloadUrl: string | null;
}

interface DownloadHistoryItem {
  id: number;
  productName: string;
  productSlug: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "---";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DownloadsClient() {
  const [tab, setTab] = useState<"available" | "history">("available");
  const [available, setAvailable] = useState<AvailableDownload[]>([]);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch available downloads (products with valid orders)
  useEffect(() => {
    async function fetchData() {
      try {
        const [licensesRes, historyRes] = await Promise.all([
          fetch("/api/licenses"),
          fetch("/api/downloads/history"),
        ]);

        const licensesJson = await licensesRes.json();
        const historyJson = await historyRes.json();

        if (licensesJson.success) {
          // Build available downloads from licenses
          const downloads: AvailableDownload[] = licensesJson.data.map(
            (l: {
              productId: number;
              productName: string;
              productSlug: string;
              productType: string;
              key: string;
            }) => ({
              productId: l.productId,
              productName: l.productName,
              productSlug: l.productSlug,
              productType: l.productType,
              orderId: 0,
              licenseKey: l.key,
              downloadUrl: null, // Will be generated on click
            }),
          );
          setAvailable(downloads);
        }

        if (historyJson.success) {
          setHistory(historyJson.data);
        }
      } catch {
        setError("Failed to load downloads");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const startDownload = useCallback(async (productSlug: string) => {
    setDownloading(productSlug);
    try {
      const res = await fetch(`/api/downloads/${productSlug}`);
      const json = await res.json();

      if (json.success && json.data.url) {
        // Open the presigned URL in a new tab to start download
        window.open(json.data.url, "_blank");

        // Refresh history after a brief delay
        setTimeout(async () => {
          const historyRes = await fetch("/api/downloads/history");
          const historyJson = await historyRes.json();
          if (historyJson.success) {
            setHistory(historyJson.data);
          }
        }, 1000);
      } else {
        setError(json.error?.message ?? "Download not available");
      }
    } catch {
      setError("Failed to generate download link");
    } finally {
      setDownloading(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="glass divide-y divide-[oklch(72%_0.19_160/0.06)]">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-6 px-6 py-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(72%_0.19_160/0.04)]">
              <span className="text-xs text-emerald-dim" aria-hidden="true">
                {"\u2193"}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 animate-pulse rounded-none bg-surface" />
              <div className="h-2.5 w-32 animate-pulse rounded-none bg-surface" />
            </div>
            <div className="h-2.5 w-14 animate-pulse rounded-none bg-surface" />
            <div className="h-8 w-24 animate-pulse rounded-none bg-surface" />
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

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-4 border-b border-[oklch(72%_0.19_160/0.06)]">
        {(["available", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-3 text-[0.55rem] uppercase tracking-[0.35em] transition-colors ${
              tab === t
                ? "border-b border-emerald text-emerald"
                : "text-text-lo hover:text-text-mid"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {t === "available" ? "Available" : "History"}
          </button>
        ))}
      </div>

      {/* Available downloads */}
      {tab === "available" && (
        <>
          {available.length === 0 ? (
            <div className="glass p-10 text-center">
              <p
                className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                No downloads available. Purchase a product to get started.
              </p>
            </div>
          ) : (
            <div className="glass divide-y divide-[oklch(72%_0.19_160/0.06)]">
              {available.map((d) => (
                <div
                  key={`${d.productId}-${d.orderId}`}
                  className="flex items-center gap-6 px-6 py-5"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(72%_0.19_160/0.04)]">
                    <span className="text-xs text-emerald" aria-hidden="true">
                      {"\u2193"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-hi">
                      {d.productName}
                    </p>
                    <p
                      className="mt-0.5 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {d.productType}
                    </p>
                  </div>

                  {/* Download button */}
                  <button
                    type="button"
                    onClick={() => startDownload(d.productSlug)}
                    disabled={downloading === d.productSlug}
                    className="border border-emerald/20 bg-emerald/5 px-4 py-2 text-[0.5rem] uppercase tracking-[0.3em] text-emerald transition-all hover:border-emerald/40 hover:bg-emerald/10 disabled:opacity-50"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {downloading === d.productSlug ? "Generating..." : "Download"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Download history */}
      {tab === "history" && (
        <>
          {history.length === 0 ? (
            <div className="glass p-10 text-center">
              <p
                className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                No download history yet.
              </p>
            </div>
          ) : (
            <div className="glass divide-y divide-[oklch(72%_0.19_160/0.06)]">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-6 px-6 py-5"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(72%_0.19_160/0.04)]">
                    <span className="text-xs text-text-lo" aria-hidden="true">
                      {"\u2713"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-hi">
                      {h.productName}
                    </p>
                    <p
                      className="mt-0.5 text-[0.5rem] text-text-lo"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {h.fileName}
                    </p>
                  </div>

                  {/* Size */}
                  <span
                    className="text-[0.5rem] text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatFileSize(h.fileSize)}
                  </span>

                  {/* Count & date */}
                  <div className="text-right">
                    <p
                      className="text-[0.5rem] text-text-lo"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {h.downloadCount}x downloaded
                    </p>
                    {h.lastDownloadedAt && (
                      <p className="mt-0.5 text-[0.45rem] text-text-lo">
                        {formatDate(h.lastDownloadedAt)}
                      </p>
                    )}
                  </div>

                  {/* Re-download */}
                  <button
                    type="button"
                    onClick={() => startDownload(h.productSlug)}
                    disabled={downloading === h.productSlug}
                    className="border border-[oklch(72%_0.19_160/0.12)] px-3 py-1.5 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:border-emerald/30 hover:text-emerald disabled:opacity-50"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {downloading === h.productSlug ? "..." : "Re-download"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
