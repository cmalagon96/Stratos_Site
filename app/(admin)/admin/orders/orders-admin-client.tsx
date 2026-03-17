"use client";

/**
 * Admin Orders Management Client
 *
 * NOTE: The refund action calls POST /api/admin/orders/[id]/refund.
 * If that endpoint does not yet exist, the button will show an error
 * gracefully. API agent should implement:
 *   POST /api/admin/orders/[id]/refund
 *   → Calls Stripe refund API, updates order status to "refunded"
 *   → Returns { success: true, data: { orderId, refundId } }
 */

import { useEffect, useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminOrder {
  id: number;
  userId: string;
  userEmail: string;
  userName: string | null;
  status: "completed" | "pending" | "refunded" | "failed";
  totalAmount: number;
  taxAmount: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

type StatusFilter = "" | "completed" | "pending" | "refunded" | "failed";

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

// ---------------------------------------------------------------------------
// Order detail panel
// ---------------------------------------------------------------------------

function OrderDetailPanel({
  order,
  onRefund,
  refunding,
}: {
  order: AdminOrder;
  onRefund: (id: number) => void;
  refunding: boolean;
}) {
  return (
    <div className="border-b border-[oklch(22%_0.015_160)] bg-[oklch(62%_0.22_25/0.02)] px-6 py-5">
      {/* Meta */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p
            className="text-[0.48rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Customer
          </p>
          <p className="mt-1 text-sm text-text-hi">{order.userName ?? order.userEmail}</p>
          <p className="text-xs text-text-lo">{order.userEmail}</p>
        </div>
        <div>
          <p
            className="text-[0.48rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Stripe Session
          </p>
          <p
            className="mt-1 break-all text-[0.52rem] text-text-mid"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {order.stripeCheckoutSessionId ?? "—"}
          </p>
        </div>
        <div>
          <p
            className="text-[0.48rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Date
          </p>
          <p className="mt-1 text-sm text-text-hi">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Line items */}
      <div
        className="mb-3 text-[0.48rem] uppercase tracking-[0.3em] text-text-lo"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Line Items
      </div>
      <div className="mb-5 space-y-2">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-[oklch(22%_0.015_160)] pb-2 last:border-0"
          >
            <span className="text-sm text-text-mid">{item.productName}</span>
            <div className="flex items-center gap-4">
              <span
                className="text-[0.5rem] text-text-lo"
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className="text-[0.52rem] uppercase tracking-[0.3em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Total: {formatCurrency(order.totalAmount, order.currency)}
          </span>
          {order.taxAmount > 0 && (
            <span
              className="text-[0.52rem] uppercase tracking-[0.3em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              (Tax: {formatCurrency(order.taxAmount, order.currency)})
            </span>
          )}
        </div>

        {/* Refund button — only shown for completed orders */}
        {order.status === "completed" && (
          <button
            type="button"
            onClick={() => onRefund(order.id)}
            disabled={refunding}
            className="border border-[oklch(62%_0.22_25/0.3)] bg-[oklch(62%_0.22_25/0.05)] px-4 py-1.5 text-[0.5rem] uppercase tracking-[0.3em] text-error transition-all hover:border-error/60 hover:bg-[oklch(62%_0.22_25/0.1)] disabled:opacity-50"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {refunding ? "Processing..." : "Issue Refund"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OrdersAdminClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refunding, setRefunding] = useState<number | null>(null);
  const [refundMsg, setRefundMsg] = useState<string | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(
    async (page: number, status: StatusFilter, q: string) => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
      });
      if (status) params.set("status", status);
      // Note: search filter on email/name requires backend support
      // Currently not supported by /api/admin/orders — filtered client-side
      try {
        const res = await fetch(`/api/admin/orders?${params}`);
        const json = await res.json();
        if (json.success) {
          let data: AdminOrder[] = json.data ?? [];
          // Client-side search fallback until API supports it
          if (q) {
            const lq = q.toLowerCase();
            data = data.filter(
              (o) =>
                o.userEmail.toLowerCase().includes(lq) ||
                (o.userName ?? "").toLowerCase().includes(lq) ||
                o.id.toString().includes(lq),
            );
          }
          setOrders(data);
          setPagination(json.pagination ?? { page, pageSize: 20, total: 0, totalPages: 1 });
        } else {
          setError(json.error?.message ?? "Failed to load orders");
        }
      } catch {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchOrders(1, statusFilter, search);
  }, [fetchOrders, statusFilter]);

  // Debounced search
  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      if (searchRef.current) clearTimeout(searchRef.current);
      searchRef.current = setTimeout(() => {
        fetchOrders(1, statusFilter, val);
      }, 350);
    },
    [fetchOrders, statusFilter],
  );

  const handleRefund = useCallback(
    async (orderId: number) => {
      if (!confirm("Issue a full refund for this order?")) return;
      setRefunding(orderId);
      setRefundMsg(null);
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
          method: "POST",
        });
        const json = await res.json();
        if (json.success) {
          setRefundMsg("Refund issued successfully.");
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: "refunded" } : o)),
          );
        } else {
          setRefundMsg(json.error?.message ?? "Refund failed.");
        }
      } catch {
        setRefundMsg("Network error — refund not processed.");
      } finally {
        setRefunding(null);
      }
    },
    [],
  );

  const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "",          label: "All statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending",   label: "Pending" },
    { value: "refunded",  label: "Refunded" },
    { value: "failed",    label: "Failed" },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="search"
          placeholder="Search email, name, order ID..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] px-4 py-2 text-sm text-text-hi outline-none transition-colors placeholder:text-text-lo focus:border-[oklch(62%_0.22_25/0.3)] min-w-[200px]"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] px-4 py-2 text-[0.52rem] uppercase tracking-[0.3em] text-text-mid outline-none transition-colors focus:border-[oklch(62%_0.22_25/0.3)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Refund feedback */}
      {refundMsg && (
        <div
          className={`mb-4 border px-4 py-3 text-sm ${
            refundMsg.includes("success")
              ? "border-emerald/20 bg-emerald/5 text-emerald"
              : "border-red-400/20 bg-red-400/5 text-red-400"
          }`}
        >
          {refundMsg}
          <button
            type="button"
            className="ml-3 text-xs opacity-60 hover:opacity-100"
            onClick={() => setRefundMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] overflow-hidden">
        {/* Column headers */}
        <div className="hidden grid-cols-[auto_2fr_1fr_auto_auto_auto] gap-4 border-b border-[oklch(22%_0.015_160)] bg-[oklch(4%_0.005_160)] px-6 py-3 md:grid">
          {["ID", "Customer", "Products", "Date", "Status", "Total"].map((h) => (
            <span
              key={h}
              className="text-[0.48rem] uppercase tracking-[0.38em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="grid grid-cols-[auto_2fr_1fr_auto_auto_auto] gap-4 border-b border-[oklch(22%_0.015_160)] px-6 py-4"
              >
                {[20, 50, 60, 30, 18, 25].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 animate-pulse rounded-none bg-surface"
                    style={{ width: `${w}%` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p
              className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              No orders found.
            </p>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <div key={order.id}>
                {/* Row */}
                <div
                  className="grid grid-cols-1 gap-2 border-b border-[oklch(22%_0.015_160)] px-6 py-4 transition-colors hover:bg-[oklch(62%_0.22_25/0.02)] md:grid-cols-[auto_2fr_1fr_auto_auto_auto] md:items-center md:gap-4"
                >
                  {/* ID */}
                  <span
                    className="text-[0.52rem] tabular-nums text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    #{order.id}
                  </span>

                  {/* Customer */}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-hi">
                      {order.userName ?? order.userEmail}
                    </p>
                    <p
                      className="text-[0.48rem] text-text-lo"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {order.userEmail}
                    </p>
                  </div>

                  {/* Products */}
                  <p className="truncate text-xs text-text-mid">
                    {order.items.map((i) => i.productName).join(", ")}
                  </p>

                  {/* Date */}
                  <span
                    className="hidden text-[0.5rem] text-text-lo md:block"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDate(order.createdAt)}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`inline-block border px-2 py-0.5 text-[0.46rem] uppercase tracking-[0.26em] ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {order.status}
                  </span>

                  {/* Amount + expand */}
                  <div className="flex items-center gap-3">
                    <span
                      className="tabular-nums text-sm text-text-hi"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatCurrency(order.totalAmount, order.currency)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId((id) => (id === order.id ? null : order.id))
                      }
                      aria-expanded={expandedId === order.id}
                      aria-label={
                        expandedId === order.id ? "Collapse order" : "Expand order"
                      }
                      className="text-[0.55rem] text-text-lo transition-colors hover:text-error"
                    >
                      {expandedId === order.id ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Detail panel */}
                {expandedId === order.id && (
                  <OrderDetailPanel
                    order={order}
                    onRefund={handleRefund}
                    refunding={refunding === order.id}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[oklch(22%_0.015_160)] px-6 py-4">
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
                onClick={() => fetchOrders(pagination.page - 1, statusFilter, search)}
                className="border border-[oklch(22%_0.015_160)] px-3 py-1.5 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:border-[oklch(62%_0.22_25/0.3)] hover:text-error disabled:pointer-events-none disabled:opacity-30"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Prev
              </button>
              <button
                type="button"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchOrders(pagination.page + 1, statusFilter, search)}
                className="border border-[oklch(22%_0.015_160)] px-3 py-1.5 text-[0.5rem] uppercase tracking-[0.3em] text-text-lo transition-colors hover:border-[oklch(62%_0.22_25/0.3)] hover:text-error disabled:pointer-events-none disabled:opacity-30"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
