import { NextResponse } from "next/server";

import { searchCars } from "@/features/cars/search/algolia-car-search";
import type { CarSort } from "@/features/cars/search/search-types";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const result = await searchCars({
    query: getString(searchParams, "q"),
    brand: getString(searchParams, "brand"),
    bodyType: getString(searchParams, "bodyType"),
    minRange: getNumber(searchParams, "minRange"),
    maxPrice: getNumber(searchParams, "maxPrice"),
    sort: (getString(searchParams, "sort") as CarSort | undefined) ?? "recommended",
    page: getNumber(searchParams, "page") ?? 1,
    pageSize: getNumber(searchParams, "pageSize") ?? 6,
  });

  return NextResponse.json(
    {
      data: result,
      meta: {
        source: result.source,
        revalidate,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}

function getString(params: URLSearchParams, key: string) {
  const value = params.get(key)?.trim();
  return value || undefined;
}

function getNumber(params: URLSearchParams, key: string) {
  const value = params.get(key);
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
