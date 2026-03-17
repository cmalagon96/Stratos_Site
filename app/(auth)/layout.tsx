import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-abyss px-4 py-16"
      style={{ isolation: "isolate" }}
    >
      {/* Background grid texture */}
      <div className="pointer-events-none fixed inset-0 grid-texture opacity-20" aria-hidden="true" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: "oklch(72% 0.19 160)" }}
        aria-hidden="true"
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative mb-10 block h-14 w-52"
        aria-label="Stratos Strategies home"
      >
        <Image
          src="/Stratos_Logo.png"
          alt="Stratos Strategies"
          fill
          className="object-contain"
          priority
        />
      </Link>

      {/* Auth card */}
      <main id="main-content" className="relative z-10 w-full max-w-md">
        {children}
      </main>

      {/* Footer links */}
      <nav
        className="relative z-10 mt-10 flex items-center gap-6"
        aria-label="Auth footer navigation"
      >
        {[
          { href: "/",        label: "Home" },
          { href: "/pricing", label: "Pricing" },
          { href: "/about",   label: "About" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[0.52rem] uppercase tracking-[0.38em] text-text-lo transition-colors hover:text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
