import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { DashboardUserCard } from "@/components/DashboardUserCard";

/**
 * Dashboard layout with server-side auth guard.
 *
 * CVE-2025-29927: This layout performs FULL session validation via
 * Better Auth (not just cookie check). Middleware provides optimistic
 * redirect, but this is the authoritative gate.
 */

const DASHBOARD_NAV = [
  { href: "/dashboard",            label: "Overview",  icon: "\u25C8" },
  { href: "/dashboard/orders",     label: "Orders",    icon: "\u25CE" },
  { href: "/dashboard/licenses",   label: "Licenses",  icon: "\u25C9" },
  { href: "/dashboard/downloads",  label: "Downloads", icon: "\u25D0" },
  { href: "/dashboard/settings",   label: "Settings",  icon: "\u25E7" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-abyss">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-[oklch(72%_0.19_160/0.07)] bg-void md:flex"
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex h-20 shrink-0 items-center px-6"
          aria-label="Stratos Strategies home"
        >
          <div className="relative h-10 w-36">
            <Image
              src="/Stratos_Logo.png"
              alt="Stratos Strategies"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Divider */}
        <div className="mx-6 h-[1px] bg-[oklch(72%_0.19_160/0.06)]" />

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-6" aria-label="Dashboard sections">
          {DASHBOARD_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 transition-all duration-200 hover:bg-[oklch(72%_0.19_160/0.05)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="text-[0.7rem] text-text-lo group-hover:text-emerald" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.3em] text-text-lo transition-colors group-hover:text-text-mid">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom: user card with sign out */}
        <div className="p-4">
          <DashboardUserCard
            userName={user.name}
            userEmail={user.email}
          />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-56">
        {/* Mobile topbar */}
        <div className="flex h-14 items-center justify-between border-b border-[oklch(72%_0.19_160/0.07)] bg-void px-4 md:hidden">
          <Link href="/" aria-label="Stratos Strategies home">
            <div className="relative h-8 w-28">
              <Image src="/Stratos_Logo.png" alt="Stratos Strategies" fill className="object-contain object-left" />
            </div>
          </Link>
          {/* Mobile sidebar toggle */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center"
            aria-label="Open navigation"
          >
            <span className="text-[0.6rem] text-text-lo" aria-hidden="true">{"\u2261"}</span>
          </button>
        </div>

        <main id="main-content" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
