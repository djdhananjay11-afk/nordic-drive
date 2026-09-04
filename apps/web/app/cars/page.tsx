import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { CarListingView } from "@/features/cars/listing/car-listing-view";
import { searchCars } from "@/features/cars/search/algolia-car-search";
import type { CarSearchParams, CarSort } from "@/features/cars/search/search-types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { carListJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return createPageMetadata({
    description: dictionary.listing.cars.metaDescription,
    locale,
    path: "/cars",
    title: dictionary.listing.cars.title,
  });
}

type CarsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const params = normalizeSearchParams(await searchParams);
  const initialResult = await searchCars(params);

  return (
    <>
      <JsonLd data={carListJsonLd(nordicCars)} id="nordicdrive-cars-schema" />
      <CarListingView
        copy={dictionary.listing}
        description={dictionary.listing.cars.description}
        eyebrow={dictionary.listing.cars.eyebrow}
        initialFilters={{
          query: params.query ?? "",
          brand: params.brand ?? "",
          bodyType: params.bodyType ?? "",
          minRange: params.minRange ? `${params.minRange}` : "",
          maxPrice: params.maxPrice ? `${params.maxPrice}` : "",
          sort: params.sort ?? "recommended",
        }}
        initialResult={initialResult}
        locale={locale}
        title={dictionary.listing.cars.title}
      />
    </>
  );
}

function normalizeSearchParams(
  params: Record<string, string | string[] | undefined>,
): CarSearchParams {
  return {
    query: getString(params.q),
    brand: getString(params.brand),
    bodyType: getString(params.bodyType),
    minRange: getNumber(params.minRange),
    maxPrice: getNumber(params.maxPrice),
    sort: (getString(params.sort) as CarSort | undefined) ?? "recommended",
    page: getNumber(params.page) ?? 1,
    pageSize: 6,
  };
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
