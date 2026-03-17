import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
  title: "Account Settings — Stratos Strategies",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-10">
        <div className="section-label mb-3">Dashboard</div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Account Settings
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          Manage your account details, security, and preferences.
        </p>
      </div>

      <SettingsClient />
    </div>
  );
}
