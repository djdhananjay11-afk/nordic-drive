import type { Metadata } from "next";
import { isCuratedRelease } from "@/features/catalogue/config";
import { CatalogueComparison } from "@/features/catalogue/pages";
import { getRequestLocale } from "@/lib/i18n/server";
import { catalogueCopy } from "@/features/catalogue/copy";

import { createComparisonFromParams } from "@/features/cars/comparison/comparison-engine";
import { ComparisonPageView } from "@/features/cars/comparison/comparison-page-view";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata({
    description: catalogueCopy[locale].intro,
    locale,
    path: "/compare",
    title: catalogueCopy[locale].compare,
  });
}

type ComparePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  if (isCuratedRelease()) return <CatalogueComparison params={await searchParams} />;
  const params = await searchParams;
  const comparison = createComparisonFromParams({
    vehicles: params.vehicles ?? null,
    add: params.add ?? null,
  });

  return <ComparisonPageView allCars={nordicCars} initialComparison={comparison} />;
}
