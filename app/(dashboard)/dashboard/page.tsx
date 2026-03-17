import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard — Stratos Strategies",
  description: "Your Stratos Strategies account dashboard.",
  robots: { index: false, follow: false },
};

// ---------------------------------------------------------------------------
// Types (mirrors /api/orders response shape)
// ---------------------------------------------------------------------------

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

interface License {
  id: number;
  status: string;
  productName: string;
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

const ORDER_STATUS_STYLES: Record<string, string> = {
  completed: "text-emerald border-emerald/20 bg-emerald/5",
  pending:   "text-amber-400 border-amber-400/20 bg-amber-400/5",
  refunded:  "text-text-lo border-text-lo/20 bg-text-lo/5",
  failed:    "text-error border-error/20 bg-error/5",
};

// ---------------------------------------------------------------------------
// Server component — fetches data directly via internal API
// ---------------------------------------------------------------------------

async function fetchDashboardData(userId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";

  // We call our own API routes with the right cookie header forwarding.
  // Since this is a server component, we use fetch with next: { revalidate: 60 }.
  // Both calls run in parallel.
  const { headers } = await import("next/headers");
  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie") ?? "";

  const fetchOpts: RequestInit = {
    headers: { cookie: cookieHeader },
    next: { revalidate: 60 },
  };

  const [ordersRes, licensesRes] = await Promise.allSettled([
    fetch(`${base}/api/orders?pageSize=5`, fetchOpts),
    fetch(`${base}/api/licenses`, fetchOpts),
  ]);

  let recentOrders: Order[] = [];
  let totalOrders = 0;
  let licenses: License[] = [];

  if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
    const json = await ordersRes.value.json();
    if (json.success) {
      recentOrders = json.data ?? [];
      totalOrders = json.pagination?.total ?? recentOrders.length;
    }
  }

  if (licensesRes.status === "fulfilled" && licensesRes.value.ok) {
    const json = await licensesRes.value.json();
    if (json.success) {
      licenses = json.data ?? [];
    }
  }

  const activeLicenses = licenses.filter((l) => l.status === "active").length;

  return { recentOrders, totalOrders, activeLicenses, totalLicenses: licenses.length };
}

// ---------------------------------------------------------------------------
// Quick link card
// ---------------------------------------------------------------------------

function QuickLink({
  href,
  label,
  sublabel,
  icon,
}: {
  href: string;
  label: string;
  sublabel: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group glass flex items-center gap-4 p-5 transition-all duration-200 hover:border-emerald/25 hover:bg-emerald/[0.03]"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center border border-[oklch(72%_0.19_160/0.15)] text-sm text-emerald-dim transition-colors group-hover:border-emerald/30 group-hover:text-emerald"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <p className="text-[0.58rem] uppercase tracking-[0.32em] text-text-hi" style={{ fontFamily: "var(--font-mono)" }}>
          {label}
        </p>
        <p className="mt-0.5 text-[0.5rem] uppercase tracking-[0.25em] text-text-lo" style={{ fontFamily: "var(--font-mono)" }}>
          {sublabel}
        </p>
      </div>
      <span className="ml-auto text-xs text-text-lo transition-colors group-hover:text-emerald" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const { user } = await getSession();
  const displayName = user?.name ?? user?.email ?? "there";

  const { recentOrders, totalOrders, activeLicenses, totalLicenses } =
    await fetchDashboardData(user?.id ?? "");

  const STATS = [
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      href: "/dashboard/orders",
    },
    {
      label: "Active Licenses",
      value: activeLicenses.toString(),
      href: "/dashboard/licenses",
    },
    {
      label: "Total Licenses",
      value: totalLicenses.toString(),
      href: "/dashboard/licenses",
    },
    {
      label: "Downloads",
      value: "—",
      href: "/dashboard/downloads",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="section-label mb-3">Dashboard</div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Overview
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          Welcome back,{" "}
          <span className="text-emerald">{displayName}</span>. Here&apos;s your account at a glance.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Account statistics">
        {STATS.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass group flex flex-col p-6 transition-all duration-200 hover:border-emerald/25 hover:bg-emerald/[0.03]"
            role="listitem"
          >
            <span
              className="block text-[0.5rem] uppercase tracking-[0.4em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {stat.label}
            </span>
            <span className="mt-3 text-3xl font-black tabular-nums text-text-hi transition-colors group-hover:text-emerald">
              {stat.value}
            </span>
          </Link>
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
            href="/dashboard/orders"
            className="text-[0.5rem] uppercase tracking-[0.3em] text-emerald-dim transition-colors hover:text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="glass p-10 text-center">
            <p
              className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              No orders yet. Browse our{" "}
              <Link href="/products" className="text-emerald hover:underline">
                products
              </Link>{" "}
              to get started.
            </p>
          </div>
        ) : (
          <div className="glass divide-y divide-[oklch(72%_0.19_160/0.06)]">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-2 w-2 shrink-0 rounded-none bg-emerald-dim" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-hi">
                    {order.items.map((i) => i.productName).join(", ") || "Order"}
                  </p>
                  <p
                    className="mt-0.5 text-[0.5rem] uppercase tracking-[0.25em] text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 border px-2 py-0.5 text-[0.48rem] uppercase tracking-[0.28em] ${ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES.pending}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {order.status}
                </span>
                <span
                  className="shrink-0 text-[0.55rem] tabular-nums text-text-mid"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2
          className="mb-4 text-[0.55rem] uppercase tracking-[0.4em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Quick Navigation
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/dashboard/orders"    label="Orders"    sublabel="View history"        icon="◎" />
          <QuickLink href="/dashboard/licenses"  label="Licenses"  sublabel="Manage activations"  icon="◉" />
          <QuickLink href="/dashboard/downloads" label="Downloads" sublabel="Get your files"      icon="◐" />
          <QuickLink href="/dashboard/settings"  label="Settings"  sublabel="Account & security"  icon="◧" />
        </div>
      </div>
    </div>
  );
}
