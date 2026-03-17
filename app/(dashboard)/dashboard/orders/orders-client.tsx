"use client";

import { useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  status: "completed" | "pending" | "refunded" | "failed";
  totalAmount: number;
  taxAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  completed: "text-emerald border-emerald/20 bg-emerald/5",
  pending:   "text-amber-400 border-amber-400/20 bg-amber-400/5",
  refunded:  "text-text-lo border-text-lo/20 bg-text-lo/5",
  failed:    "text-red-400 border-red-400/20 bg-red-400/5",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[0.48rem] uppercase tracking-[0.28em] ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="glass p-16 text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[oklch(72%_0.19_160/0.12)]"
        aria-hidden="true"
      >
        <span className="text-lg text-text-lo">◎</span>
      </div>
      <p
        className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        No orders found.
      </p>
      <p className="mt-2 text-xs text-text-lo">
        Your purchase history will appear here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-[oklch(72%_0.19_160/0.04)] px-6 py-5 sm:grid-cols-[2fr_1fr_auto_auto]">
      <div className="space-y-2">
        <div className="h-3 w-48 animate-pulse rounded-none bg-surface" />
        <div className="h-2.5 w-32 animate-pulse rounded-none bg-surface" />
      </div>
      <div className="hidden h-3 w-20 animate-pulse rounded-none bg-surface sm:block" />
      <div className="h-5 w-16 animate-pulse rounded-none bg-surface" />
      <div className="h-3 w-12 animate-pulse rounded-none bg-surface" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order row — expandable
// ---------------------------------------------------------------------------

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-[oklch(72%_0.19_160/0.04)] px-6 py-5 transition-colors hover:bg-emerald/[0.02] sm:grid-cols-[2fr_1fr_auto_auto]"
      >
        {/* Product + date */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-hi">
            {order.items.map((i) => i.productName).join(", ") || `Order #${order.id}`}
          </p>
          <p
            className="mt-0.5 text-[0.5rem] uppercase tracking-[0.25em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            #{order.id} · {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Amount — hidden on mobile */}
        <span
          className="hidden tabular-nums text-sm text-text-mid sm:block"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatCurrency(order.totalAmount, order.currency)}
        </span>

        {/* Status badge */}
        <StatusBadge status={order.status} />

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse order details" : "Expand order details"}
          className="flex h-6 w-6 items-center justify-center text-[0.6rem] text-text-lo transition-colors hover:text-emerald"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-b border-[oklch(72%_0.19_160/0.04)] bg-[oklch(72%_0.19_160/0.02)] px-6 py-5">
          <div className="mb-3 flex items-center gap-4 sm:hidden">
            <span
              className="text-[0.5rem] uppercase tracking-[0.28em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Total
            </span>
            <span
              className="text-sm tabular-nums text-text-hi"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatCurrency(order.totalAmount, order.currency)}
            </span>
          </div>

          {/* Line items table */}
          <div
            className="mb-3 text-[0.48rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Line Items
          </div>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-[oklch(72%_0.19_160/0.04)] pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm text-text-mid">{item.productName}</span>
                <div className="flex items-center gap-4">
                  <span
                    className="text-[0.5rem] tabular-nums text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    ×{item.quantity}
                  </span>
                  <span
                    className="text-sm tabular-nums text-text-hi"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatCurrency(item.unitPrice, order.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tax row */}
          {order.taxAmount > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-[oklch(72%_0.19_160/0.06)] pt-3">
              <span
                className="text-[0.5rem] uppercase tracking-[0.28em] text-text-lo"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Tax
              </span>
              <span
                className="text-sm tabular-nums text-text-lo"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatCurrency(order.taxAmount, order.currency)}
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-[oklch(72%_0.19_160/0.09)] pt-3">
            <span
              className="text-[0.5rem] uppercase tracking-[0.28em] text-emerald"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Total
            </span>
            <span
              className="text-base tabular-nums font-bold text-text-hi"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {formatCurrency(order.totalAmount, order.currency)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------

function PaginationBar({
  pagination,
  onPage,
}: {
  pagination: Pagination;
  onPage: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[oklch(72%_0.19_160/0.06)] px-6 py-4">
      <span
        className="text-[0.5rem] uppercase tracking-[0.3em] text-text-lo"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} orders
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagination.page === 1}
          onClick={() => onPage(pagination.page - 1)}
          className="border border-[oklch(22%_0.015_160)] px-3 py-1.5 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:border-emerald/30 hover:text-emerald disabled:pointer-events-none disabled:opacity-30"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Prev
        </button>
        <button
          type="button"
          disabled={pagination.page === pagination.totalPages}
          onClick={() => onPage(pagination.page + 1)}
          className="border border-[oklch(22%_0.015_160)] px-3 py-1.5 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:border-emerald/30 hover:text-emerald disabled:pointer-events-none disabled:opacity-30"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders?page=${page}&pageSize=10`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data ?? []);
        setPagination(
          json.pagination ?? { page, pageSize: 10, total: 0, totalPages: 1 },
        );
      } else {
        setError(json.error?.message ?? "Failed to load orders");
      }
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  if (error) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => fetchOrders(pagination.page)}
          className="mt-3 text-[0.5rem] uppercase tracking-[0.3em] text-emerald hover:underline"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden">
      {/* Table header */}
      <div className="hidden grid-cols-[2fr_1fr_auto_auto] gap-4 border-b border-[oklch(72%_0.19_160/0.09)] bg-[oklch(72%_0.19_160/0.03)] px-6 py-3 sm:grid">
        {["Product / Date", "Amount", "Status", ""].map((h, i) => (
          <span
            key={i}
            className="text-[0.48rem] uppercase tracking-[0.38em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {loading ? (
        <div>{[1, 2, 3, 4, 5].map((n) => <SkeletonRow key={n} />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <PaginationBar pagination={pagination} onPage={fetchOrders} />
      )}
    </div>
  );
}
