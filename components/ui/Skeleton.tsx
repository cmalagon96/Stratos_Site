import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width — accepts any CSS value or Tailwind class override via className */
  width?: string | number;
  /** Height — accepts any CSS value or number (px) */
  height?: string | number;
  /** Renders as a circle (for avatars) */
  circle?: boolean;
}

/** Single skeleton line / block */
export function Skeleton({
  width,
  height,
  circle = false,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={[
        "animate-pulse bg-surface rounded-none",
        circle && "rounded-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width:  typeof width  === "number" ? `${width}px`  : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
    />
  );
}

/** Pre-built skeleton for a card block */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={["glass p-6 md:p-8", className].join(" ")} aria-hidden="true">
      <Skeleton height={12} width="40%" className="mb-4" />
      <Skeleton height={20} width="70%" className="mb-6" />
      <div className="space-y-2">
        <Skeleton height={10} width="100%" />
        <Skeleton height={10} width="90%" />
        <Skeleton height={10} width="75%" />
      </div>
      <Skeleton height={36} className="mt-6" />
    </div>
  );
}

/** Pre-built skeleton for a table row */
export function SkeletonRow({
  cols = 4,
  className = "",
}: {
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex items-center gap-4 border-b border-[oklch(72%_0.19_160/0.05)] px-4 py-3",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          height={10}
          className="flex-1"
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  );
}

/** Pre-built skeleton for stat metric */
export function SkeletonStat({ className = "" }: { className?: string }) {
  return (
    <div className={["glass p-6", className].join(" ")} aria-hidden="true">
      <Skeleton height={8} width={80} className="mb-3" />
      <Skeleton height={32} width={64} />
    </div>
  );
}
