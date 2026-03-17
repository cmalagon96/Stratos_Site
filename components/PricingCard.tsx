import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Highlights this card as the recommended / featured tier */
  featured?: boolean;
  badge?: string;
}

export function PricingCard({
  tier,
  price,
  period = "/month",
  description,
  features,
  ctaLabel = "Get Started",
  ctaHref  = "/signup",
  featured = false,
  badge,
}: PricingCardProps) {
  return (
    <article
      className={[
        "relative flex flex-col gap-0 overflow-hidden transition-all duration-300",
        featured
          ? "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(10%_0.010_160/0.80)] backdrop-blur-xl shadow-[0_0_40px_oklch(72%_0.19_160/0.10)]"
          : "border border-[oklch(22%_0.015_160)] bg-[oklch(10%_0.010_160)]",
      ].join(" ")}
      aria-label={`${tier} pricing plan`}
    >
      {/* Top glow line on featured */}
      {featured && (
        <div
          className="absolute left-0 right-0 top-0 h-[1px]"
          style={{
            background:
              "linear-gradient(to right, transparent, oklch(72% 0.19 160 / 0.6), transparent)",
          }}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <div className="p-7 pb-6">
        <div className="mb-4 flex items-center gap-3">
          <span
            className="text-[0.55rem] uppercase tracking-[0.45em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {tier}
          </span>
          {badge && <Badge variant={featured ? "success" : "default"}>{badge}</Badge>}
        </div>

        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-black text-text-hi">{price}</span>
          {price !== "Custom" && (
            <span
              className="mb-1 text-[0.55rem] uppercase tracking-[0.35em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {period}
            </span>
          )}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-text-mid">{description}</p>
      </div>

      {/* Divider */}
      <div className="mx-7 h-[1px] bg-[oklch(72%_0.19_160/0.06)]" />

      {/* Features */}
      <ul
        className="flex flex-1 flex-col gap-3 p-7 pt-6"
        aria-label={`${tier} plan features`}
      >
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={[
                "mt-0.5 flex-shrink-0 text-[0.7rem]",
                feature.included ? "text-emerald" : "text-text-lo line-through",
              ].join(" ")}
              aria-hidden="true"
            >
              {feature.included ? "✓" : "–"}
            </span>
            <span
              className={[
                "text-[0.75rem] leading-snug",
                feature.included ? "text-text-mid" : "text-text-lo",
              ].join(" ")}
            >
              {feature.text}
              {!feature.included && (
                <span className="sr-only"> (not included)</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="p-7 pt-0">
        <a
          href={ctaHref}
          className={[
            "flex w-full items-center justify-center gap-2 px-5 py-3 text-[0.58rem] uppercase tracking-[0.38em] transition-all duration-300 outline-none",
            "focus-visible:ring-2 focus-visible:ring-[oklch(72%_0.19_160/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-abyss",
            featured
              ? "border border-[oklch(72%_0.19_160/0.55)] bg-[oklch(72%_0.19_160/0.12)] text-emerald hover:border-[oklch(72%_0.19_160/0.9)] hover:bg-[oklch(72%_0.19_160/0.20)] hover:shadow-[0_0_20px_oklch(72%_0.19_160/0.20)]"
              : "border border-[oklch(22%_0.015_160)] bg-transparent text-text-mid hover:border-[oklch(40%_0.015_160)] hover:text-text-hi",
          ].join(" ")}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}
