import * as React from "react";

type CardVariant = "glass" | "solid" | "outline";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Add emerald glow on hover */
  hoverable?: boolean;
  /** Remove internal padding */
  noPadding?: boolean;
}

const VARIANT_STYLES: Record<CardVariant, string> = {
  glass:
    "bg-[oklch(10%_0.010_160/0.70)] backdrop-blur-xl border border-[oklch(72%_0.19_160/0.12)]",
  solid:
    "bg-[oklch(10%_0.010_160)] border border-[oklch(22%_0.015_160)]",
  outline:
    "bg-transparent border border-[oklch(22%_0.015_160)]",
};

export function Card({
  variant   = "glass",
  hoverable = false,
  noPadding = false,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        "relative overflow-hidden rounded-none",
        VARIANT_STYLES[variant],
        hoverable &&
          "transition-all duration-300 cursor-pointer " +
          "hover:border-[oklch(72%_0.19_160/0.35)] " +
          "hover:shadow-[0_0_30px_oklch(72%_0.19_160/0.08)]",
        !noPadding && "p-6 md:p-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

/** Convenience sub-components for common card anatomy */
export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={["mb-4 flex flex-col gap-1", className].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={[
        "text-base font-bold uppercase tracking-wide text-text-hi",
        className,
      ].join(" ")}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={["text-xs leading-relaxed text-text-mid", className].join(" ")}
    >
      {children}
    </p>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={[
        "mt-6 flex items-center gap-3 border-t border-[oklch(72%_0.19_160/0.07)] pt-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
