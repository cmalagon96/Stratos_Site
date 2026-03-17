import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin Dashboard — Stratos Strategies",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Order {
  id: number;
  userEmail: string;
  userName: string | null;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
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

// ---------------------------------------------------------------------------
// Server-side data fetch
// ---------------------------------------------------------------------------

async function fetchAdminStats() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
  const { headers } = await import("next/headers");
  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie") ?? "";

  const fetchOpts: RequestInit = {
    headers: { cookie: cookieHeader },
    next: { revalidate: 30 },
  };

  const [ordersRes, productsRes, licensesRes] = await Promise.allSettled([
    fetch(`${base}/api/admin/orders?pageSize=10`, fetchOpts),
    fetch(`${base}/api/products?pageSize=50`, fetchOpts),
    fetch(`${base}/api/admin/licenses?pageSize=5`, fetchOpts),
  ]);

  let recentOrders: Order[] = [];
  let totalOrders = 0;
  let totalRevenueCents = 0;
  let refundedOrders = 0;
  let totalProducts = 0;
  let activeLicenses = 0;

  if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
    const json = await ordersRes.value.json();
    if (json.success) {
      recentOrders = (json.data ?? []).slice(0, 5);
      totalOrders = json.pagination?.total ?? recentOrders.length;

      // Calculate revenue from recent orders (approximation for display)
      for (const o of json.data ?? []) {
        if (o.status === "completed") {
          totalRevenueCents += o.totalAmount;
        }
        if (o.status === "refunded") {
          refundedOrders++;
        }
      }
    }
  }

  if (productsRes.status === "fulfilled" && productsRes.value.ok) {
    const json = await productsRes.value.json();
    if (json.success) {
      totalProducts = json.pagination?.total ?? (json.data ?? []).length;
    }
  }

  if (licensesRes.status === "fulfilled" && licensesRes.value.ok) {
    const json = await licensesRes.value.json();
    if (json.success) {
      activeLicenses = json.pagination?.total ?? 0;
    }
  }

  const refundRate =
    totalOrders > 0 ? ((refundedOrders / totalOrders) * 100).toFixed(1) : "0.0";

  return {
    recentOrders,
    totalOrders,
    totalRevenueCents,
    refundRate,
    totalProducts,
    activeLicenses,
  };
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] p-6"
      role="listitem"
    >
      <span
        className="block text-[0.5rem] uppercase tracking-[0.4em] text-text-lo"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <span
        className={`mt-3 block text-3xl font-black tabular-nums ${accent ? "text-error" : "text-text-hi"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick action card
// ---------------------------------------------------------------------------

function QuickAction({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] p-6 transition-all duration-200 hover:border-[oklch(62%_0.22_25/0.3)] hover:bg-[oklch(62%_0.22_25/0.04)]"
    >
      <span
        className="mt-0.5 text-base text-text-lo transition-colors group-hover:text-error"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="flex-1">
        <p
          className="text-[0.58rem] uppercase tracking-[0.32em] text-text-hi"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </p>
        <p className="mt-1 text-xs text-text-lo">{description}</p>
      </div>
      <span className="text-xs text-text-lo transition-colors group-hover:text-error" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Admin label
// ---------------------------------------------------------------------------

function AdminLabel() {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        className="h-[1px] w-6 bg-[oklch(62%_0.22_25/0.5)]"
        aria-hidden="true"
      />
      <span
        className="text-[0.55rem] uppercase tracking-[0.45em] text-error"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Admin
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  const { user } = await getSession();
  const {
    recentOrders,
    totalOrders,
    totalRevenueCents,
    refundRate,
    totalProducts,
    activeLicenses,
  } = await fetchAdminStats();

  const STATS = [
    { label: "Total Orders",     value: totalOrders.toString() },
    { label: "Revenue (Sample)", value: formatCurrency(totalRevenueCents) },
    { label: "Refund Rate",      value: `${refundRate}%`,  accent: true },
    { label: "Active Licenses",  value: activeLicenses.toString() },
    { label: "Products",         value: totalProducts.toString() },
    { label: "Admin",            value: user?.email?.split("@")[0] ?? "—" },
  ];

  return (
    <div>
      <div className="mb-10">
        <AdminLabel />
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          Platform operations overview. All figures approximate from recent data window.
        </p>
      </div>

      {/* Stats grid */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Platform statistics"
      >
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-[0.55rem] uppercase tracking-[0.4em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-[0.5rem] uppercase tracking-[0.3em] text-[oklch(62%_0.22_25/0.6)] transition-colors hover:text-error"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] p-10 text-center">
            <p
              className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              No orders yet.
            </p>
          </div>
        ) : (
          <div className="border border-[oklch(22%_0.015_160)] bg-[oklch(6%_0.007_160)] divide-y divide-[oklch(22%_0.015_160)]">
            {/* Header */}
            <div className="hidden grid-cols-[2fr_1fr_auto_auto] gap-4 border-b border-[oklch(22%_0.015_160)] px-6 py-3 sm:grid">
              {["Customer", "Products", "Status", "Amount"].map((h) => (
                <span
                  key={h}
                  className="text-[0.48rem] uppercase tracking-[0.36em] text-text-lo"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {h}
                </span>
              ))}
            </div>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-1 gap-2 px-6 py-4 transition-colors hover:bg-[oklch(62%_0.22_25/0.03)] sm:grid-cols-[2fr_1fr_auto_auto] sm:items-center sm:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-text-hi">
                    {order.userName ?? order.userEmail}
                  </p>
                  <p
                    className="text-[0.48rem] uppercase tracking-[0.2em] text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <p className="truncate text-xs text-text-mid">
                  {order.items.map((i) => i.productName).join(", ")}
                </p>
                <span
                  className={`inline-block border px-2 py-0.5 text-[0.46rem] uppercase tracking-[0.26em] ${
                    order.status === "completed"
                      ? "border-emerald/20 bg-emerald/5 text-emerald"
                      : order.status === "refunded"
                      ? "border-text-lo/20 bg-text-lo/5 text-text-lo"
                      : order.status === "failed"
                      ? "border-red-400/20 bg-red-400/5 text-red-400"
                      : "border-amber-400/20 bg-amber-400/5 text-amber-400"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {order.status}
                </span>
                <span
                  className="text-sm tabular-nums text-text-mid"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2
          className="mb-4 text-[0.55rem] uppercase tracking-[0.4em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Quick Actions
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            href="/admin/orders"
            label="Manage Orders"
            description="View all orders, filter by status, process refunds"
            icon="◎"
          />
          <QuickAction
            href="/admin/products"
            label="Manage Products"
            description="Add, edit, and toggle product availability"
            icon="◉"
          />
          <QuickAction
            href="/admin/licenses"
            label="Manage Licenses"
            description="Inspect and administer license keys"
            icon="◐"
          />
        </div>
      </div>
    </div>
  );
}
