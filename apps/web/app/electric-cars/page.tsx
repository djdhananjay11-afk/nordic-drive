import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { CarListingView } from "@/features/cars/listing/car-listing-view";
import { searchCars } from "@/features/cars/search/algolia-car-search";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { carListJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return createPageMetadata({
    description: dictionary.listing.electricCars.metaDescription,
    locale,
    path: "/electric-cars",
    title: dictionary.listing.electricCars.metaTitle,
  });
}

type ElectricCarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ElectricCarsPage({ searchParams }: ElectricCarsPageProps) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const raw = await searchParams;
  const initialResult = await searchCars({
    query: getString(raw.q),
    brand: getString(raw.brand),
    bodyType: getString(raw.bodyType),
    minRange: getNumber(raw.minRange),
    maxPrice: getNumber(raw.maxPrice),
    sort: "range-desc",
    page: getNumber(raw.page) ?? 1,
    pageSize: 6,
  });

  return (
    <>
      <JsonLd data={carListJsonLd(nordicCars)} id="nordicdrive-electric-cars-schema" />
      <CarListingView
        copy={dictionary.listing}
        description={dictionary.listing.electricCars.description}
        eyebrow={dictionary.listing.electricCars.eyebrow}
        initialFilters={{
          query: getString(raw.q) ?? "",
          brand: getString(raw.brand) ?? "",
          bodyType: getString(raw.bodyType) ?? "",
          minRange: getNumber(raw.minRange)?.toString() ?? "",
          maxPrice: getNumber(raw.maxPrice)?.toString() ?? "",
          sort: "range-desc",
        }}
        initialResult={initialResult}
        locale={locale}
        title={dictionary.listing.electricCars.title}
      />
    </>
  );
}

function getString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumber(value: string | string[] | undefined) {
  const raw = getString(value);
  if (!raw) return undefined;
  const number = Number(raw);
  return Number.isFinite(number) ? number : undefined;
}
