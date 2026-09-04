import type { NordicCar } from "@/features/cars/data/nordic-cars";

export type CarSort = "recommended" | "price-asc" | "price-desc" | "range-desc" | "charging-asc";

export type CarSearchParams = {
  query?: string | undefined;
  brand?: string | undefined;
  bodyType?: string | undefined;
  minRange?: number | undefined;
  maxPrice?: number | undefined;
  sort?: CarSort | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
};

export type CarSearchResult = {
  hits: NordicCar[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    brands: Array<{ value: string; count: number }>;
    bodyTypes: Array<{ value: string; count: number }>;
    range: { min: number; max: number };
    price: { min: number; max: number };
  };
  source: "algolia" | "local";
};
