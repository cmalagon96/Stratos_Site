import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/services/products";
import { ProductCard } from "@/components/ProductCard";
import { ProductFiltersBar } from "@/components/ProductFiltersBar";
import type { Product } from "@/lib/db/types";

export const metadata: Metadata = {
  title: "Products -- Stratos Strategies",
  description:
    "Software products built by Stratos Strategies for billing, bioinformatics, developer tools, and workflow automation.",
  openGraph: {
    title: "Products -- Stratos Strategies",
    description:
      "Software products for billing, bioinformatics, developer tools, and workflow automation.",
    url: "https://stratosstrat.com/products",
  },
};

// ISR: revalidate every 60 seconds
export const revalidate = 60;

const TYPE_LABELS: Record<Product["type"], string> = {
  saas: "SaaS",
  desktop: "Desktop",
  cli: "CLI",
  template: "Template",
  report: "Report",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const category = typeof params.category === "string" ? params.category : undefined;
  const type = typeof params.type === "string" ? (params.type as Product["type"]) : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const pageStr = typeof params.page === "string" ? params.page : "1";
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  // Fetch data server-side (direct DB, not API routes)
  const [result, allCategories] = await Promise.all([
    getProducts({ category, type, search }, { page, pageSize: 12 }),
    getCategories(),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
      <div className="section-label mb-6">Products</div>

      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-text-hi md:text-6xl">
        Product Catalog
      </h1>
      <p className="mb-12 max-w-2xl text-sm leading-relaxed text-text-mid">
        Purpose-built software for billing, bioinformatics pipelines, developer
        tools, and workflow automation. Every product is born from real
        operational experience.
      </p>

      {/* Filters */}
      <ProductFiltersBar
        categories={allCategories.map((c) => ({
          name: c.name,
          slug: c.slug,
        }))}
        typeLabels={TYPE_LABELS}
        activeCategory={category}
        activeType={type}
        activeSearch={search}
      />

      {/* Product grid */}
      {result.data.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              description={product.shortDescription ?? ""}
              category={product.category?.name ?? "Uncategorized"}
              highlights={[]}
              status="available"
              startingPrice={product.displayPrice}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-4 py-20">
          <p className="text-sm text-text-mid">No products found matching your filters.</p>
          <a
            href="/products"
            className="text-[0.55rem] uppercase tracking-[0.38em] text-emerald-dim transition-colors hover:text-emerald"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Clear Filters
          </a>
        </div>
      )}

      {/* Pagination */}
      {result.totalPages > 1 && (
        <nav
          className="mt-12 flex items-center justify-center gap-2"
          aria-label="Product pagination"
        >
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
            (p) => {
              const params = new URLSearchParams();
              if (category) params.set("category", category);
              if (type) params.set("type", type);
              if (search) params.set("search", search);
              if (p > 1) params.set("page", String(p));
              const href = `/products${params.toString() ? `?${params.toString()}` : ""}`;

              return (
                <a
                  key={p}
                  href={href}
                  className={[
                    "flex h-9 w-9 items-center justify-center text-xs transition-colors",
                    p === page
                      ? "border border-[oklch(72%_0.19_160/0.50)] bg-[oklch(72%_0.19_160/0.12)] text-emerald"
                      : "border border-[oklch(22%_0.015_160)] text-text-mid hover:border-[oklch(40%_0.015_160)] hover:text-text-hi",
                  ].join(" ")}
                  aria-current={p === page ? "page" : undefined}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p}
                </a>
              );
            },
          )}
        </nav>
      )}
    </section>
  );
}
