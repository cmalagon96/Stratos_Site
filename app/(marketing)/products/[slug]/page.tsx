import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  getAllProductSlugs,
} from "@/lib/services/products";
import {
  SoftwareApplicationSchema,
  BreadcrumbSchema,
} from "@/components/JsonLd";
import { Badge } from "@/components/ui/Badge";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Product Not Found -- Stratos Strategies" };
  }
  return {
    title: `${product.name} -- Stratos Strategies`,
    description: product.shortDescription ?? product.description ?? undefined,
    openGraph: {
      title: `${product.name} -- Stratos Strategies`,
      description: product.shortDescription ?? product.description ?? undefined,
      url: `https://stratosstrat.com/products/${slug}`,
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  saas: "SaaS",
  desktop: "Desktop App",
  cli: "CLI Tool",
  template: "Template Pack",
  report: "Report",
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const priceForSchema = (product.price / 100).toFixed(2);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <SoftwareApplicationSchema
        name={product.name}
        description={product.description ?? product.shortDescription ?? ""}
        url={`https://stratosstrat.com/products/${product.slug}`}
        applicationCategory={TYPE_LABELS[product.type] ?? "Software"}
        offers={{
          price: priceForSchema,
          priceCurrency: product.currency.toUpperCase(),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://stratosstrat.com" },
          { name: "Products", url: "https://stratosstrat.com/products" },
          {
            name: product.name,
            url: `https://stratosstrat.com/products/${product.slug}`,
          },
        ]}
      />

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2">
            {[
              { href: "/", label: "Home" },
              { href: "/products", label: "Products" },
              { href: null, label: product.name },
            ].map((crumb, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span
                    className="text-[0.5rem] text-text-lo"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    /
                  </span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[0.55rem] uppercase tracking-[0.35em] text-text-lo transition-colors hover:text-emerald"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className="text-[0.55rem] uppercase tracking-[0.35em] text-emerald"
                    style={{ fontFamily: "var(--font-mono)" }}
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero */}
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="section-label">
                {product.category?.name ?? "Product"}
              </div>
              <Badge variant="default">
                {TYPE_LABELS[product.type] ?? product.type}
              </Badge>
            </div>

            <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-text-hi md:text-6xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-sm leading-relaxed text-text-mid">
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing CTA */}
          <div className="glass flex flex-col gap-4 p-8 lg:min-w-[280px]">
            <span
              className="text-[0.5rem] uppercase tracking-[0.42em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Starting at
            </span>
            <span className="text-4xl font-black text-text-hi">
              {product.displayPrice}
            </span>
            <span
              className="text-[0.5rem] uppercase tracking-[0.35em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {product.type === "template" ? "one-time" : "/month"}
            </span>
            <a
              href="/contact"
              className="mt-2 flex items-center justify-center border border-[oklch(72%_0.19_160/0.55)] bg-[oklch(72%_0.19_160/0.12)] px-5 py-3 text-[0.58rem] uppercase tracking-[0.38em] text-emerald transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.9)] hover:bg-[oklch(72%_0.19_160/0.20)] hover:shadow-[0_0_20px_oklch(72%_0.19_160/0.20)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Features */}
        {product.features.length > 0 && (
          <div className="mb-16">
            <h2
              className="mb-8 text-[0.55rem] uppercase tracking-[0.45em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Key Features
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {product.features.map((feature, i) => (
                <div
                  key={i}
                  className="glass flex items-start gap-4 p-6"
                >
                  <span
                    className="mt-0.5 flex-shrink-0 text-sm text-emerald"
                    aria-hidden="true"
                  >
                    +
                  </span>
                  <span className="text-xs leading-relaxed text-text-mid">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screenshots gallery */}
        {product.screenshots.length > 0 && (
          <div className="mb-16">
            <h2
              className="mb-8 text-[0.55rem] uppercase tracking-[0.45em] text-text-lo"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Screenshots
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {product.screenshots.map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden border border-[oklch(22%_0.015_160)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${product.name} screenshot ${i + 1}`}
                    className="h-auto w-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing section */}
        <div className="mb-16">
          <h2
            className="mb-8 text-[0.55rem] uppercase tracking-[0.45em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Pricing
          </h2>
          <div className="glass p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold text-text-hi">
                  {product.name}
                </p>
                <p className="text-xs text-text-mid">
                  {product.shortDescription}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-text-hi">
                  {product.displayPrice}
                </p>
                <p
                  className="text-[0.5rem] uppercase tracking-[0.35em] text-text-lo"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {product.type === "template" ? "one-time purchase" : "per month"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[0.55rem] uppercase tracking-[0.38em] text-text-lo transition-colors hover:text-emerald"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Back to Products
        </Link>
      </section>
    </>
  );
}
