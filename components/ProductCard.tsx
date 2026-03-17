import * as React from "react";
import Link from "next/link";
import { Badge, type BadgeProps } from "@/components/ui/Badge";

export interface ProductCardProps {
  slug: string;
  name: string;
  description: string;
  category: string;
  /** Short list of capability bullets */
  highlights?: string[];
  status?: "available" | "beta" | "coming-soon";
  /** Optional numeric price string, e.g. "$99" or "Free" */
  startingPrice?: string;
}

const STATUS_BADGE: Record<
  NonNullable<ProductCardProps["status"]>,
  { label: string; variant: BadgeProps["variant"] }
> = {
  "available":    { label: "Available",    variant: "success"  },
  "beta":         { label: "Beta",         variant: "warning"  },
  "coming-soon":  { label: "Coming Soon",  variant: "muted"    },
};

export function ProductCard({
  slug,
  name,
  description,
  category,
  highlights = [],
  status = "available",
  startingPrice,
}: ProductCardProps) {
  const badge = STATUS_BADGE[status];

  return (
    <article
      className="glass group relative flex flex-col gap-0 overflow-hidden transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.35)] hover:shadow-[0_0_30px_oklch(72%_0.19_160/0.07)]"
    >
      {/* Category + status */}
      <div className="flex items-center justify-between border-b border-[oklch(72%_0.19_160/0.06)] px-6 py-3">
        <span
          className="text-[0.5rem] uppercase tracking-[0.42em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {category}
        </span>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="text-base font-black uppercase tracking-wide text-text-hi transition-colors duration-200 group-hover:text-emerald">
          {name}
        </h3>
        <p className="text-xs leading-relaxed text-text-mid">{description}</p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <ul className="flex flex-col gap-2" aria-label="Key capabilities">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[0.7rem] text-text-mid">
                <span className="h-[1px] w-3 shrink-0 bg-[oklch(72%_0.19_160/0.35)]" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[oklch(72%_0.19_160/0.06)] px-6 py-4">
        {startingPrice ? (
          <span className="text-xs font-bold text-text-hi">
            From {startingPrice}
          </span>
        ) : (
          <span />
        )}

        <Link
          href={`/products/${slug}`}
          className="inline-flex items-center gap-2 text-[0.52rem] uppercase tracking-[0.38em] text-emerald-dim transition-colors hover:text-emerald focus-visible:outline focus-visible:outline-2 focus-visible:outline-[oklch(72%_0.19_160/0.5)]"
          style={{ fontFamily: "var(--font-mono)" }}
          aria-label={`Learn more about ${name}`}
        >
          Details →
        </Link>
      </div>
    </article>
  );
}
