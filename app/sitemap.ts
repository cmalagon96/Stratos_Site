import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://stratosstrat.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1
    }
  ];
}
