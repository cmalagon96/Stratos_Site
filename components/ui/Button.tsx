import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Render as an anchor tag (pass href via `asChild` pattern or `as`) */
  asChild?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.10)] text-emerald " +
    "hover:border-[oklch(72%_0.19_160/0.85)] hover:bg-[oklch(72%_0.19_160/0.16)] " +
    "hover:shadow-[0_0_20px_oklch(72%_0.19_160/0.18)] " +
    "focus-visible:ring-2 focus-visible:ring-[oklch(72%_0.19_160/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-abyss " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",

  secondary:
    "border border-[oklch(22%_0.015_160)] bg-[oklch(10%_0.010_160)] text-text-mid " +
    "hover:border-[oklch(32%_0.015_160)] hover:text-text-hi " +
    "focus-visible:ring-2 focus-visible:ring-[oklch(40%_0.01_160/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-abyss " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",

  ghost:
    "border border-transparent bg-transparent text-text-mid " +
    "hover:border-[oklch(22%_0.015_160)] hover:text-text-hi " +
    "focus-visible:ring-2 focus-visible:ring-[oklch(40%_0.01_160/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-abyss " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",

  danger:
    "border border-[oklch(62%_0.22_25/0.40)] bg-[oklch(62%_0.22_25/0.08)] text-[oklch(62%_0.22_25)] " +
    "hover:border-[oklch(62%_0.22_25/0.75)] hover:bg-[oklch(62%_0.22_25/0.14)] " +
    "focus-visible:ring-2 focus-visible:ring-[oklch(62%_0.22_25/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-abyss " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[0.52rem] tracking-[0.38em]",
  md: "px-5 py-2   text-[0.58rem] tracking-[0.38em]",
  lg: "px-8 py-3   text-[0.6rem]  tracking-[0.4em]",
};

export function Button({
  variant = "primary",
  size    = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-none uppercase transition-all duration-300 outline-none",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ].join(" ")}
      style={{ fontFamily: "var(--font-mono)", ...props.style }}
    >
      {loading && (
        <span
          className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

/** Anchor variant — same visual treatment as Button */
export function ButtonLink({
  variant = "primary",
  size    = "md",
  children,
  className = "",
  href,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <a
      href={href}
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-none uppercase transition-all duration-300 outline-none",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      ].join(" ")}
      style={{ fontFamily: "var(--font-mono)", ...props.style }}
    >
      {children}
    </a>
  );
}
