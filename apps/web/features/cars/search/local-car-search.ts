import { nordicCars } from "@/features/cars/data/nordic-cars";

import type { CarSearchParams, CarSearchResult } from "./search-types";

export function searchCarsLocally(params: CarSearchParams): CarSearchResult {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, params.pageSize ?? 6));
  const normalizedQuery = params.query?.trim().toLowerCase();

  let results = nordicCars.filter((car) => {
    const matchesQuery = normalizedQuery
      ? `${car.brand} ${car.model} ${car.segment} ${car.tagline} ${car.highlights.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      : true;
    const matchesBrand = params.brand ? car.brandSlug === params.brand : true;
    const matchesBody = params.bodyType ? car.segment.toLowerCase() === params.bodyType.toLowerCase() : true;
    const matchesRange = params.minRange ? car.rangeWltpKm >= params.minRange : true;
    const matchesPrice = params.maxPrice ? car.priceNok <= params.maxPrice : true;

    return matchesQuery && matchesBrand && matchesBody && matchesRange && matchesPrice;
  });

  results = sortCars(results, params.sort ?? "recommended");

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    hits: results.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
    facets: buildFacets(),
    source: "local",
  };
}

export function buildFacets() {
  const brands = Array.from(new Set(nordicCars.map((car) => car.brandSlug))).map((brandSlug) => {
    const car = nordicCars.find((item) => item.brandSlug === brandSlug);
    return {
      value: brandSlug,
      count: nordicCars.filter((item) => item.brandSlug === brandSlug).length,
      label: car?.brand ?? brandSlug,
    };
  });

  const bodyTypes = Array.from(new Set(nordicCars.map((car) => car.segment))).map((segment) => ({
    value: segment,
    count: nordicCars.filter((item) => item.segment === segment).length,
  }));

  return {
    brands,
    bodyTypes,
    range: {
      min: Math.min(...nordicCars.map((car) => car.rangeWltpKm)),
      max: Math.max(...nordicCars.map((car) => car.rangeWltpKm)),
    },
    price: {
      min: Math.min(...nordicCars.map((car) => car.priceNok)),
      max: Math.max(...nordicCars.map((car) => car.priceNok)),
    },
  };
}

function sortCars(cars: typeof nordicCars, sort: NonNullable<CarSearchParams["sort"]>) {
  return [...cars].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.priceNok - b.priceNok;
      case "price-desc":
        return b.priceNok - a.priceNok;
      case "range-desc":
        return b.rangeWltpKm - a.rangeWltpKm;
      case "charging-asc":
        return a.chargingMinutes - b.chargingMinutes;
      case "recommended":
      default:
        return b.winterRangeKm / b.priceNok - a.winterRangeKm / a.priceNok;
    }
  });
}
