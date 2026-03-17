import type { Metadata } from "next";
import { DownloadsClient } from "./downloads-client";

export const metadata: Metadata = {
  title: "Downloads — Stratos Strategies",
  robots: { index: false, follow: false },
};

export default function DownloadsPage() {
  return (
    <div>
      <div className="mb-10">
        <div className="section-label mb-3">Dashboard</div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-text-hi">
          Downloads
        </h1>
        <p className="mt-1 text-xs text-text-mid">
          Available software downloads linked to your active licenses.
        </p>
      </div>

      <DownloadsClient />
    </div>
  );
}
