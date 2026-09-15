import type { MetadataRoute } from "next";
import { isCuratedRelease } from "@/features/catalogue/config";
import { getCatalogue } from "@/features/catalogue/repository";
import { vehiclePath } from "@nordicdrive/database/catalogue";

import { nordicCars } from "@/features/cars/data/nordic-cars";
import { locales, localizePath } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isCuratedRelease()) {
    const vehicles = await getCatalogue();
    const checked = new Date("2026-09-12T00:00:00Z");
    return [
      ...["/", "/cars", "/electric-cars", "/compare", "/disclaimer"].flatMap((path) =>
        localizedSitemapEntries(path, checked, 0.8, "weekly"),
      ),
      ...vehicles.flatMap((v) =>
        localizedSitemapEntries(vehiclePath(v), new Date(v.checkedOn), 0.8, "weekly"),
      ),
      ...[...new Set(vehicles.map((v) => v.brandSlug))].flatMap((brand) =>
        localizedSitemapEntries(`/brands/${brand}`, checked, 0.7, "weekly"),
      ),
    ];
  }
  const now = new Date();
  const brands = Array.from(new Set(nordicCars.map((car) => car.brandSlug)));
  const staticPaths = [
    { changeFrequency: "daily" as const, path: "/", priority: 1 },
    { changeFrequency: "daily" as const, path: "/cars", priority: 0.92 },
    { changeFrequency: "daily" as const, path: "/electric-cars", priority: 0.9 },
    { changeFrequency: "weekly" as const, path: "/compare", priority: 0.82 },
    { changeFrequency: "weekly" as const, path: "/launches", priority: 0.74 },
    { changeFrequency: "monthly" as const, path: "/ev-guide", priority: 0.68 },
    { changeFrequency: "weekly" as const, path: "/ai", priority: 0.72 },
    { changeFrequency: "monthly" as const, path: "/about", priority: 0.64 },
    { changeFrequency: "monthly" as const, path: "/disclaimer", priority: 0.5 },
    { changeFrequency: "monthly" as const, path: "/advertise", priority: 0.56 },
  ];

  return [
    ...staticPaths.flatMap((entry) =>
      localizedSitemapEntries(entry.path, now, entry.priority, entry.changeFrequency),
    ),
    ...brands.flatMap((brand) => localizedSitemapEntries(`/brands/${brand}`, now, 0.82, "daily")),
    ...nordicCars.flatMap((car) =>
      localizedSitemapEntries(`/cars/${car.brandSlug}/${car.modelSlug}`, now, 0.86, "weekly"),
    ),
  ];
}

function localizedSitemapEntries(
  path: string,
  lastModified: Date,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
) {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(localizePath(locale, path))]),
  );

  return locales.map((locale) => ({
    alternates: {
      languages,
    },
    changeFrequency,
    lastModified,
    priority,
    url: absoluteUrl(localizePath(locale, path)),
  }));
}
