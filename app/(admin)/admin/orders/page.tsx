import type { Metadata } from "next";
import { OrdersAdminClient } from "./orders-admin-client";

export const metadata: Metadata = {
  title: "Orders — Admin — Stratos Strategies",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-[1px] w-6 bg-[oklch(62%_0.22_25/0.5)]" aria-hidden="true" />
          <span
            className="text-[0.55rem] uppercase tracking-[0.45em] text-error"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Admin / Orders
          </span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Order Management
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          View all orders, filter by status, and process refunds.
        </p>
      </div>

      <OrdersAdminClient />
    </div>
  );
}
