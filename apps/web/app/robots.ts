import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: [
          "/",
          "/cars",
          "/brands",
          "/electric-cars",
          "/compare",
          "/launches",
          "/ev-guide",
          "/ai",
        ],
        disallow: ["/admin", "/api/admin", "/api/auth", "/api/monitoring"],
        userAgent: "*",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
