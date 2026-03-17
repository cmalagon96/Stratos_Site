"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/client";
import { useState, useRef, useEffect } from "react";

/**
 * Auth buttons for the Navbar -- shows login/signup when logged out,
 * user dropdown when logged in.
 */
export function AuthButtons() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Close on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

  // Loading state -- render nothing to avoid layout shift
  if (isPending) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        <div className="h-7 w-7 animate-pulse rounded-full bg-surface" />
      </div>
    );
  }

  // Logged out -- show sign-in / sign-up links
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.38em] text-text-lo transition-colors hover:text-text-hi"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="border border-[oklch(72%_0.19_160/0.35)] bg-[oklch(72%_0.19_160/0.06)] px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.38em] text-emerald transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.80)] hover:bg-[oklch(72%_0.19_160/0.12)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  // Logged in -- show user dropdown
  const initials = (session.user.name ?? session.user.email)
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((o) => !o)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-none border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(10%_0.010_160)] px-2.5 py-1.5 transition-all hover:border-[oklch(72%_0.19_160/0.35)]"
      >
        {/* Avatar initials */}
        <span
          className="flex h-6 w-6 items-center justify-center bg-[oklch(72%_0.19_160/0.12)] text-[0.5rem] font-bold uppercase text-emerald"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {initials}
        </span>
        <span
          className="hidden text-[0.52rem] uppercase tracking-[0.2em] text-text-mid sm:inline"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {session.user.name ?? session.user.email.split("@")[0]}
        </span>
        {/* Chevron */}
        <svg
          className={`h-3 w-3 text-text-lo transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {dropdownOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-48 border border-[oklch(72%_0.19_160/0.12)] bg-[oklch(8%_0.008_160/0.95)] backdrop-blur-xl"
          role="menu"
        >
          {/* User info */}
          <div className="border-b border-[oklch(72%_0.19_160/0.07)] px-3 py-2.5">
            <p
              className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-text-hi"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {session.user.name ?? "User"}
            </p>
            <p className="mt-0.5 truncate text-[0.5rem] text-text-lo">
              {session.user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-2 px-3 py-2 text-[0.52rem] uppercase tracking-[0.28em] text-text-mid transition-colors hover:bg-[oklch(72%_0.19_160/0.05)] hover:text-text-hi"
              style={{ fontFamily: "var(--font-mono)" }}
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex w-full items-center gap-2 px-3 py-2 text-[0.52rem] uppercase tracking-[0.28em] text-text-mid transition-colors hover:bg-[oklch(72%_0.19_160/0.05)] hover:text-text-hi"
              style={{ fontFamily: "var(--font-mono)" }}
              role="menuitem"
              onClick={() => setDropdownOpen(false)}
            >
              Settings
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-[oklch(72%_0.19_160/0.07)] py-1">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-[0.52rem] uppercase tracking-[0.28em] text-[oklch(62%_0.22_25)] transition-colors hover:bg-[oklch(62%_0.22_25/0.06)]"
              style={{ fontFamily: "var(--font-mono)" }}
              role="menuitem"
              onClick={async () => {
                setDropdownOpen(false);
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
        </div>
      )}
    </div>
  );
}

/**
 * Mobile auth buttons -- simplified for mobile menu.
 */
export function MobileAuthButtons({ onClose }: { onClose: () => void }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return null;

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Link
          href="/login"
          className="text-lg font-black uppercase tracking-[0.3em] text-[oklch(55%_0.01_160)] transition-colors hover:text-emerald"
          onClick={onClose}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center border border-[oklch(72%_0.19_160/0.45)] px-8 py-3 text-xs uppercase tracking-[0.38em] text-emerald"
          onClick={onClose}
        >
          Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Link
        href="/dashboard"
        className="text-lg font-black uppercase tracking-[0.3em] text-[oklch(55%_0.01_160)] transition-colors hover:text-emerald"
        onClick={onClose}
      >
        Dashboard
      </Link>
      <button
        type="button"
        className="inline-flex items-center border border-[oklch(62%_0.22_25/0.35)] px-8 py-3 text-xs uppercase tracking-[0.38em] text-[oklch(62%_0.22_25)]"
        onClick={async () => {
          onClose();
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
