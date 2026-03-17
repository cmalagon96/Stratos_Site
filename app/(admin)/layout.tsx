import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/**
 * Admin layout with server-side session + role check.
 *
 * CVE-2025-29927: Full session validation here, not just middleware.
 * Requires both:
 *   1. Valid authenticated session
 *   2. user.role === "admin"
 *
 * Non-admin users are redirected to /dashboard.
 * Unauthenticated users are redirected to /login.
 */

const ADMIN_NAV = [
  { href: "/admin",          label: "Dashboard", icon: "\u25C8" },
  { href: "/admin/users",    label: "Users",     icon: "\u25CE" },
  { href: "/admin/products", label: "Products",  icon: "\u25C9" },
  { href: "/admin/orders",   label: "Orders",    icon: "\u25D0" },
  { href: "/admin/licenses", label: "Licenses",  icon: "\u25E7" },
  { href: "/admin/settings", label: "Settings",  icon: "\u25EB" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-void">
      {/* Admin sidebar -- distinct from dashboard sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-52 flex-col border-r border-[oklch(62%_0.22_25/0.12)] bg-[oklch(4%_0.005_160)] md:flex"
        aria-label="Admin navigation"
      >
        {/* Logo + admin badge */}
        <div className="flex h-20 shrink-0 items-center gap-3 px-5">
          <div className="relative h-9 w-28">
            <Image
              src="/Stratos_Logo.png"
              alt="Stratos Strategies"
              fill
              className="object-contain object-left opacity-60"
              priority
            />
          </div>
          <span
            className="border border-[oklch(62%_0.22_25/0.35)] bg-[oklch(62%_0.22_25/0.08)] px-1.5 py-0.5 text-[0.42rem] uppercase tracking-[0.35em] text-[oklch(62%_0.22_25)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Admin
          </span>
        </div>

        <div className="mx-5 h-[1px] bg-[oklch(62%_0.22_25/0.08)]" />

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-6" aria-label="Admin sections">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 transition-all duration-200 hover:bg-[oklch(62%_0.22_25/0.06)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="text-[0.7rem] text-text-lo group-hover:text-[oklch(62%_0.22_25)]" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-[0.58rem] uppercase tracking-[0.28em] text-text-lo transition-colors group-hover:text-text-mid">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom: exit admin */}
        <div className="p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-[oklch(72%_0.19_160/0.12)] px-3 py-2 transition-all hover:border-[oklch(72%_0.19_160/0.3)]"
          >
            <span className="text-[0.55rem] uppercase tracking-[0.3em] text-text-lo" style={{ fontFamily: "var(--font-mono)" }}>
              {"\u2190"} Exit Admin
            </span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col md:pl-52">
        {/* Top bar */}
        <div className="flex h-12 items-center justify-between border-b border-[oklch(62%_0.22_25/0.10)] bg-[oklch(4%_0.005_160)] px-6">
          <span
            className="text-[0.52rem] uppercase tracking-[0.42em] text-[oklch(62%_0.22_25/0.6)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Admin Panel
          </span>
          <span
            className="text-[0.48rem] uppercase tracking-[0.2em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {user.email}
          </span>
        </div>

        <main id="main-content" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
