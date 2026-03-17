import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/services/products";
import { PricingCard, type PricingFeature } from "@/components/PricingCard";

export const metadata: Metadata = {
  title: "Pricing -- Stratos Strategies",
  description:
    "Transparent pricing for BillFlow, RosaBio, GenThrust, and Automation Toolkit. Choose the product that fits your needs.",
  openGraph: {
    title: "Pricing -- Stratos Strategies",
    description:
      "Transparent pricing for all Stratos Strategies software products.",
    url: "https://stratosstrat.com/pricing",
  },
};

// Force dynamic rendering — pricing fetches products from the database
// and cannot be statically generated without NEON_DATABASE_URL.
export const dynamic = "force-dynamic";

function formatPrice(priceInCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceInCents / 100);
}

// FAQ data
const FAQ_ITEMS = [
  {
    question: "Can I try a product before committing?",
    answer:
      "Yes. Contact us for a demo or trial period. We want you to be confident in your choice before any commitment.",
  },
  {
    question: "Do you offer custom enterprise pricing?",
    answer:
      "Absolutely. For teams of 10+ or organizations with specific compliance requirements, reach out for a tailored quote.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards through Stripe. Enterprise clients can arrange invoicing with net-30 terms.",
  },
  {
    question: "Can I switch products or plans?",
    answer:
      "Yes. You can upgrade, downgrade, or switch products at any time. Prorated credits are applied automatically.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a 30-day money-back guarantee on all SaaS subscriptions. Template packs are non-refundable after download.",
  },
];

export default async function PricingPage() {
  // Fetch all active products directly from the database
  const result = await getProducts({}, { page: 1, pageSize: 50 });
  const allProducts = result.data;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
      {/* Header */}
      <div className="section-label mb-6">Pricing</div>

      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-text-hi md:text-6xl">
        Plans & Pricing
      </h1>
      <p className="mb-16 max-w-2xl text-sm leading-relaxed text-text-mid">
        Straightforward pricing for every product. No hidden fees, no surprise
        charges. Every plan includes direct access to engineering support.
      </p>

      {/* Pricing cards grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {allProducts.map((product, index) => {
          // Convert product features to PricingFeature format
          const features: PricingFeature[] = (product as unknown as { features?: string[] }).features
            ? []
            : [];

          return (
            <PricingCard
              key={product.id}
              tier={product.category?.name ?? "Product"}
              price={formatPrice(product.price, product.currency)}
              period={product.type === "template" ? " one-time" : "/month"}
              description={product.shortDescription ?? ""}
              features={features}
              ctaLabel="Learn More"
              ctaHref={`/products/${product.slug}`}
              featured={index === 1} // Highlight the second product (RosaBio)
              badge={index === 1 ? "Most Popular" : undefined}
            />
          );
        })}
      </div>

      {/* Feature comparison table */}
      {allProducts.length > 0 && (
        <div className="mt-20">
          <h2
            className="mb-8 text-[0.55rem] uppercase tracking-[0.45em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Product Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-[oklch(22%_0.015_160)] p-4 text-left text-[0.52rem] uppercase tracking-[0.38em] text-text-lo" style={{ fontFamily: "var(--font-mono)" }}>
                    Feature
                  </th>
                  {allProducts.map((p) => (
                    <th
                      key={p.id}
                      className="border-b border-[oklch(22%_0.015_160)] p-4 text-center text-[0.52rem] uppercase tracking-[0.38em] text-text-lo"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Type", key: "type" },
                  { label: "Price", key: "price" },
                  { label: "Category", key: "category" },
                ].map((row) => (
                  <tr key={row.key}>
                    <td className="border-b border-[oklch(22%_0.015_160/0.5)] p-4 text-xs text-text-mid">
                      {row.label}
                    </td>
                    {allProducts.map((p) => (
                      <td
                        key={p.id}
                        className="border-b border-[oklch(22%_0.015_160/0.5)] p-4 text-center text-xs text-text-mid"
                      >
                        {row.key === "type" &&
                          ({ saas: "SaaS", desktop: "Desktop", cli: "CLI", template: "Template", report: "Report" }[p.type] ?? p.type)}
                        {row.key === "price" && p.displayPrice}
                        {row.key === "category" && (p.category?.name ?? "--")}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="border-b border-[oklch(22%_0.015_160/0.5)] p-4 text-xs text-text-mid">
                    Billing
                  </td>
                  {allProducts.map((p) => (
                    <td
                      key={p.id}
                      className="border-b border-[oklch(22%_0.015_160/0.5)] p-4 text-center text-xs text-text-mid"
                    >
                      {p.type === "template" ? "One-time" : "Monthly"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-xs text-text-mid">
                    Support
                  </td>
                  {allProducts.map((p) => (
                    <td
                      key={p.id}
                      className="p-4 text-center text-xs text-emerald"
                    >
                      Included
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-20">
        <h2
          className="mb-8 text-[0.55rem] uppercase tracking-[0.45em] text-text-lo"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="glass p-6">
              <h3 className="mb-3 text-sm font-bold text-text-hi">
                {item.question}
              </h3>
              <p className="text-xs leading-relaxed text-text-mid">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 flex flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight text-text-hi md:text-3xl">
          Ready to get started?
        </h2>
        <p className="max-w-lg text-sm leading-relaxed text-text-mid">
          Explore our products or contact us for a personalized demo.
        </p>
        <div className="flex gap-4">
          <Link
            href="/products"
            className="border border-[oklch(72%_0.19_160/0.55)] bg-[oklch(72%_0.19_160/0.12)] px-6 py-3 text-[0.58rem] uppercase tracking-[0.38em] text-emerald transition-all duration-300 hover:border-[oklch(72%_0.19_160/0.9)] hover:bg-[oklch(72%_0.19_160/0.20)] hover:shadow-[0_0_20px_oklch(72%_0.19_160/0.20)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            View Products
          </Link>
          <Link
            href="/contact"
            className="border border-[oklch(22%_0.015_160)] bg-transparent px-6 py-3 text-[0.58rem] uppercase tracking-[0.38em] text-text-mid transition-all duration-300 hover:border-[oklch(40%_0.015_160)] hover:text-text-hi"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
