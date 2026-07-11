import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date("2026-07-10T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
