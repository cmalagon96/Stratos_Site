"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/db/types";

interface CategoryOption {
  name: string;
  slug: string;
}

interface ProductFiltersBarProps {
  categories: CategoryOption[];
  typeLabels: Record<Product["type"], string>;
  activeCategory?: string;
  activeType?: Product["type"];
  activeSearch?: string;
}

export function ProductFiltersBar({
  categories,
  typeLabels,
  activeCategory,
  activeType,
  activeSearch,
}: ProductFiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = React.useState(activeSearch ?? "");

  function navigate(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 when filters change
    params.delete("page");

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate("search", searchValue.trim() || undefined);
  }

  const productTypes = Object.entries(typeLabels) as [Product["type"], string][];

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-none border border-[oklch(22%_0.015_160)] bg-[oklch(10%_0.010_160)] px-3 py-2.5 text-xs text-text-hi placeholder:text-text-lo transition-all duration-200 outline-none focus:border-[oklch(72%_0.19_160/0.6)] focus:shadow-[0_0_0_1px_oklch(72%_0.19_160/0.25)]"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="flex-shrink-0 border border-[oklch(72%_0.19_160/0.25)] bg-[oklch(72%_0.19_160/0.06)] px-4 py-2.5 text-[0.52rem] uppercase tracking-[0.38em] text-emerald transition-colors hover:bg-[oklch(72%_0.19_160/0.14)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Search
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-6">
        {/* Category filters */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[0.5rem] uppercase tracking-[0.42em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Category
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => navigate("category", undefined)}
              className={[
                "px-3 py-1.5 text-[0.52rem] uppercase tracking-[0.35em] transition-colors",
                !activeCategory
                  ? "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.12)] text-emerald"
                  : "border border-[oklch(22%_0.015_160)] text-text-mid hover:border-[oklch(40%_0.015_160)] hover:text-text-hi",
              ].join(" ")}
              style={{ fontFamily: "var(--font-mono)" }}
              aria-pressed={!activeCategory}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() =>
                  navigate(
                    "category",
                    activeCategory === cat.slug ? undefined : cat.slug,
                  )
                }
                className={[
                  "px-3 py-1.5 text-[0.52rem] uppercase tracking-[0.35em] transition-colors",
                  activeCategory === cat.slug
                    ? "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.12)] text-emerald"
                    : "border border-[oklch(22%_0.015_160)] text-text-mid hover:border-[oklch(40%_0.015_160)] hover:text-text-hi",
                ].join(" ")}
                style={{ fontFamily: "var(--font-mono)" }}
                aria-pressed={activeCategory === cat.slug}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Type filters */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[0.5rem] uppercase tracking-[0.42em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Type
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => navigate("type", undefined)}
              className={[
                "px-3 py-1.5 text-[0.52rem] uppercase tracking-[0.35em] transition-colors",
                !activeType
                  ? "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.12)] text-emerald"
                  : "border border-[oklch(22%_0.015_160)] text-text-mid hover:border-[oklch(40%_0.015_160)] hover:text-text-hi",
              ].join(" ")}
              style={{ fontFamily: "var(--font-mono)" }}
              aria-pressed={!activeType}
            >
              All
            </button>
            {productTypes.map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  navigate("type", activeType === value ? undefined : value)
                }
                className={[
                  "px-3 py-1.5 text-[0.52rem] uppercase tracking-[0.35em] transition-colors",
                  activeType === value
                    ? "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.12)] text-emerald"
                    : "border border-[oklch(22%_0.015_160)] text-text-mid hover:border-[oklch(40%_0.015_160)] hover:text-text-hi",
                ].join(" ")}
                style={{ fontFamily: "var(--font-mono)" }}
                aria-pressed={activeType === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
