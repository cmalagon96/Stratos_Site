import type { Metadata } from "next";
import { LicensesClient } from "./licenses-client";

export const metadata: Metadata = {
  title: "Licenses — Stratos Strategies",
  robots: { index: false, follow: false },
};

export default function LicensesPage() {
  return (
    <div>
      <div className="mb-10">
        <div className="section-label mb-3">Dashboard</div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Licenses
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          Active and expired software licenses tied to your account.
        </p>
      </div>

      <LicensesClient />
    </div>
  );
}
