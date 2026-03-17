import * as React from "react";

type BadgeVariant =
  | "default"   // emerald ghost
  | "success"   // emerald solid
  | "warning"   // amber
  | "danger"    // red/error
  | "muted"     // neutral
  | "outline";  // transparent with border

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default:
    "border border-[oklch(72%_0.19_160/0.25)] bg-[oklch(72%_0.19_160/0.06)] text-emerald",
  success:
    "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.14)] text-emerald-bright",
  warning:
    "border border-[oklch(78%_0.17_85/0.35)] bg-[oklch(78%_0.17_85/0.08)] text-[oklch(78%_0.17_85)]",
  danger:
    "border border-[oklch(62%_0.22_25/0.35)] bg-[oklch(62%_0.22_25/0.08)] text-[oklch(62%_0.22_25)]",
  muted:
    "border border-[oklch(22%_0.015_160)] bg-[oklch(13%_0.010_160)] text-text-lo",
  outline:
    "border border-[oklch(32%_0.015_160)] bg-transparent text-text-mid",
};

export function Badge({
  variant  = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        "inline-flex items-center px-2 py-0.5",
        "text-[0.5rem] uppercase tracking-[0.38em]",
        VARIANT_STYLES[variant],
        className,
      ].join(" ")}
      style={{ fontFamily: "var(--font-mono)", ...props.style }}
    >
      {children}
    </span>
  );
}
