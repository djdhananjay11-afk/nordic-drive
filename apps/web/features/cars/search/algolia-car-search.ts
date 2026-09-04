import { searchCarsLocally } from "./local-car-search";
import type { CarSearchParams, CarSearchResult } from "./search-types";

export async function searchCars(params: CarSearchParams): Promise<CarSearchResult> {
  const appId = process.env.ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_SEARCH_API_KEY;
  const indexName = process.env.ALGOLIA_CARS_INDEX_NAME ?? "nordicdrive_cars";

  if (!appId || !apiKey) {
    return searchCarsLocally(params);
  }

  try {
    const { algoliasearch } = await import("algoliasearch");
    const client = algoliasearch(appId, apiKey);
    const page = Math.max(0, (params.page ?? 1) - 1);
    const pageSize = Math.min(24, Math.max(1, params.pageSize ?? 6));
    const filters = buildAlgoliaFilters(params);
    const result = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query: params.query ?? "",
        filters: filters.length ? filters.join(" AND ") : undefined,
        page,
        hitsPerPage: pageSize,
        facets: ["brandSlug", "segment"],
        numericFilters: [
          params.minRange ? `rangeWltpKm>=${params.minRange}` : "",
          params.maxPrice ? `priceNok<=${params.maxPrice}` : "",
        ].filter(Boolean),
      },
    });

    return {
      hits: result.hits as unknown as CarSearchResult["hits"],
      total: result.nbHits ?? 0,
      page: (result.page ?? 0) + 1,
      pageSize,
      totalPages: result.nbPages ?? 1,
      facets: searchCarsLocally({}).facets,
      source: "algolia",
    };
  } catch {
    return searchCarsLocally(params);
  }
}

function buildAlgoliaFilters(params: CarSearchParams) {
  return [
    params.brand ? `brandSlug:${escapeFilter(params.brand)}` : "",
    params.bodyType ? `segment:${escapeFilter(params.bodyType)}` : "",
  ].filter(Boolean);
}

function escapeFilter(value: string) {
  return value.replace(/"/g, '\\"');
}
