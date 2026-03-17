/**
 * JsonLd — reusable JSON-LD structured data component.
 *
 * Usage:
 *   <JsonLd schema={{ "@context": "https://schema.org", "@type": "Organization", ... }} />
 *
 * Security: The schema object is developer-owned (never user input).
 * We replace `<` with its unicode escape as an extra layer of defense
 * against XSS via malicious string injection into the JSON payload
 * (per https://nextjs.org/docs/app/guides/json-ld).
 *
 * DOMPurify is not used here because JSON-LD is injected as raw JSON text
 * inside a <script> tag, not rendered as HTML — HTML sanitizers are not
 * applicable to this pattern. The \u003c replacement is the correct mitigation.
 */

type SchemaObject = Record<string, unknown>;

function sanitizeJsonLd(schema: SchemaObject): string {
  // Replace < to prevent script injection via unicode escape
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export function JsonLd({ schema }: { schema: SchemaObject }) {
  return (
    <script
      type="application/ld+json"
      // Safe: schema is developer-owned; < chars are unicode-escaped above
      // nosec: dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(schema) }}
    />
  );
}

// ─── Typed helpers for common schema types ───────────────────────────────────

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs = [],
}: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}) {
  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        ...(logo && { logo }),
        ...(description && { description }),
        ...(sameAs.length > 0 && { sameAs }),
      }}
    />
  );
}

export function WebSiteSchema({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description?: string;
}) {
  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        ...(description && { description }),
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function SoftwareApplicationSchema({
  name,
  description,
  url,
  applicationCategory,
  offers,
}: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  offers?: { price: string; priceCurrency: string };
}) {
  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name,
        description,
        url,
        ...(applicationCategory && { applicationCategory }),
        ...(offers && {
          offers: {
            "@type": "Offer",
            price: offers.price,
            priceCurrency: offers.priceCurrency,
          },
        }),
      }}
    />
  );
}
