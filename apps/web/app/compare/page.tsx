import type { Metadata } from "next";

import { createComparisonFromParams } from "@/features/cars/comparison/comparison-engine";
import { ComparisonPageView } from "@/features/cars/comparison/comparison-page-view";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  description:
    "Compare up to four electric cars by Norwegian price, winter range, battery, charging, safety, interior, dimensions, warranty, and performance.",
  path: "/compare",
  title: "Compare Electric Cars in Norway",
});

type ComparePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const comparison = createComparisonFromParams({
    vehicles: params.vehicles ?? null,
    add: params.add ?? null,
  });

  return <ComparisonPageView allCars={nordicCars} initialComparison={comparison} />;
}
