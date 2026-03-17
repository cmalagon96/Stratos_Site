"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";

/**
 * User card in dashboard sidebar -- shows name/email and sign out button.
 * This is a client component because sign-out requires client-side interaction.
 */
export function DashboardUserCard({
  userName,
  userEmail,
}: {
  userName: string | null;
  userEmail: string;
}) {
  const router = useRouter();

  const initials = (userName ?? userEmail)
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="border border-[oklch(72%_0.19_160/0.07)] p-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <span
          className="flex h-7 w-7 items-center justify-center bg-[oklch(72%_0.19_160/0.12)] text-[0.45rem] font-bold uppercase text-emerald"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[0.52rem] font-bold uppercase tracking-[0.15em] text-text-hi"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {userName ?? "User"}
          </p>
          <p className="truncate text-[0.45rem] text-text-lo">
            {userEmail}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="mt-3 w-full border border-[oklch(62%_0.22_25/0.15)] px-2 py-1.5 text-[0.48rem] uppercase tracking-[0.3em] text-text-lo transition-all hover:border-[oklch(62%_0.22_25/0.4)] hover:text-[oklch(62%_0.22_25)]"
        style={{ fontFamily: "var(--font-mono)" }}
        onClick={async () => {
          await signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/login");
              },
            },
          });
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
