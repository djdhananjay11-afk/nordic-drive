import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CarListingView } from "@/features/cars/listing/car-listing-view";
import { nordicCars } from "@/features/cars/data/nordic-cars";
import { searchCars } from "@/features/cars/search/algolia-car-search";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/server";
import { breadcrumbJsonLd, carListJsonLd, createPageMetadata } from "@/lib/seo";

export const revalidate = 300;

type BrandPageProps = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { brand } = await params;
  const label = getBrandLabel(brand);

  return {
    ...createPageMetadata({
      description:
        locale === "no"
          ? `Se ${label} elbiler i Norge med rekkevidde, pris, lading og sammenligningsfiltre.`
          : `Browse ${label} electric cars in Norway with range, price, charging, and comparison filters.`,
      locale,
      path: `/brands/${brand}`,
      title: locale === "no" ? `${label} elbiler` : `${label} Electric Cars`,
    }),
  };
}

export function generateStaticParams() {
  return Array.from(new Set(nordicCars.map((car) => car.brandSlug))).map((brand) => ({ brand }));
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);
  const { brand } = await params;
  const raw = await searchParams;
  const initialResult = await searchCars({
    query: getString(raw.q),
    brand,
    bodyType: getString(raw.bodyType),
    minRange: getNumber(raw.minRange),
    maxPrice: getNumber(raw.maxPrice),
    sort: "recommended",
    page: getNumber(raw.page) ?? 1,
    pageSize: 6,
  });
  const label = getBrandLabel(brand);
  const brandCars = nordicCars.filter((car) => car.brandSlug === brand);

  return (
    <>
      <JsonLd
        data={[
          carListJsonLd(brandCars),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: label, path: `/brands/${brand}` },
          ]),
        ]}
        id="nordicdrive-brand-schema"
      />
      <CarListingView
        copy={dictionary.listing}
        description={
          locale === "no"
            ? `Se ${label} elbiler med nordisk rekkevidde, pris, lading og karosserifiltre.`
            : `Browse ${label} EVs with Nordic range, price, charging, and body-type filters.`
        }
        eyebrow={dictionary.listing.brand}
        initialFilters={{
          query: getString(raw.q) ?? "",
          brand,
          bodyType: getString(raw.bodyType) ?? "",
          minRange: getNumber(raw.minRange)?.toString() ?? "",
          maxPrice: getNumber(raw.maxPrice)?.toString() ?? "",
          sort: "recommended",
        }}
        initialResult={initialResult}
        locale={locale}
        lockedBrand={brand}
        title={locale === "no" ? `${label} elbiler` : `${label} electric cars`}
      />
    </>
  );
}

function getBrandLabel(brandSlug: string) {
  return nordicCars.find((car) => car.brandSlug === brandSlug)?.brand ?? brandSlug;
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
