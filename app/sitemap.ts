import { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/services/products";

const BASE_URL = "https://stratosstrat.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core marketing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             BASE_URL,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        1.0,
    },
    {
      url:             `${BASE_URL}/products`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/pricing`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/about`,
      lastModified:    now,
      changeFrequency: "monthly",
      priority:        0.7,
    },
    // Phase 7: Legal pages
    {
      url:             `${BASE_URL}/privacy`,
      lastModified:    now,
      changeFrequency: "yearly",
      priority:        0.3,
    },
    {
      url:             `${BASE_URL}/terms`,
      lastModified:    now,
      changeFrequency: "yearly",
      priority:        0.3,
    },
    // Phase 7: Docs hub
    {
      url:             `${BASE_URL}/docs`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.6,
    },
    {
      url:             `${BASE_URL}/docs/billflow`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.5,
    },
    {
      url:             `${BASE_URL}/docs/rosabio`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.5,
    },
    {
      url:             `${BASE_URL}/docs/genthrust`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.5,
    },
    {
      url:             `${BASE_URL}/docs/api`,
      lastModified:    now,
      changeFrequency: "weekly",
      priority:        0.5,
    },
  ];

  // Dynamically fetch all active product slugs from the database
  let productSlugs: string[] = [];
  try {
    productSlugs = await getAllProductSlugs();
  } catch (error) {
    // Fallback: sitemap still generates without product pages if DB is unreachable
    console.error("[sitemap] Failed to fetch product slugs:", error);
  }

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map(
    (slug) => ({
      url:             `${BASE_URL}/products/${slug}`,
      lastModified:    now,
      changeFrequency: "weekly" as const,
      priority:        0.8,
    })
  );

  // Auth + dashboard pages are excluded (robots: noindex, private by nature)

  return [...staticRoutes, ...productRoutes];
}
