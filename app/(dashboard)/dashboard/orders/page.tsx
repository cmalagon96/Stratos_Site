import type { Metadata } from "next";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = {
  title: "Orders — Stratos Strategies",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <div>
      <div className="mb-10">
        <div className="section-label mb-3">Dashboard</div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Order History
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          All past and pending purchases for your account.
        </p>
      </div>

      <OrdersClient />
    </div>
  );
}
