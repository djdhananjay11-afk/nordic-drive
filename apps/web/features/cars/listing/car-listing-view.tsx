"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import type { CarSearchResult } from "@/features/cars/search/search-types";
import { type Locale } from "@/lib/i18n/config";
import type { ListingDictionary } from "@/lib/i18n/dictionaries";

import { FilterPanel, type ListingFilters } from "./filter-panel";
import { ListingCard } from "./listing-card";

type CarListingViewProps = {
  copy: ListingDictionary;
  initialResult: CarSearchResult;
  initialFilters: ListingFilters;
  title: string;
  description: string;
  eyebrow: string;
  locale: Locale;
  lockedBrand?: string;
  lockedBodyType?: string;
};

export function CarListingView({
  copy,
  description,
  eyebrow,
  initialFilters,
  initialResult,
  locale,
  lockedBodyType,
  lockedBrand,
  title,
}: CarListingViewProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState(initialResult);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      brand: lockedBrand ?? filters.brand,
      bodyType: lockedBodyType ?? filters.bodyType,
    }),
    [filters, lockedBodyType, lockedBrand],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = buildParams(effectiveFilters, 1);
      startTransition(async () => {
        const response = await fetch(`/api/cars/search?${params.toString()}`);
        const payload = (await response.json()) as { data: CarSearchResult };
        setResult(payload.data);
        router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [effectiveFilters, pathname, router]);

  async function goToPage(page: number) {
    const params = buildParams(effectiveFilters, page);
    const response = await fetch(`/api/cars/search?${params.toString()}`);
    const payload = (await response.json()) as { data: CarSearchResult };
    setResult(payload.data);
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }

  function updateFilters(next: Partial<ListingFilters>) {
    setFilters((current) => ({ ...current, ...next }));
  }

  function clearFilters() {
    setFilters({
      query: "",
      brand: lockedBrand ?? "",
      bodyType: lockedBodyType ?? "",
      minRange: "",
      maxPrice: "",
      sort: "recommended",
    });
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f7_58%,#ffffff_100%)] px-5 pb-24 pt-24">
      <section className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-normal md:text-7xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/70 bg-white/66 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex h-14 flex-1 items-center rounded-xl bg-white px-4">
              <Search className="mr-3 size-5 text-slate-400" />
              <input
                className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400"
                onChange={(event) => updateFilters({ query: event.target.value })}
                placeholder={copy.searchPlaceholder}
                value={filters.query}
              />
            </label>
            <select
              className="h-14 rounded-xl border-0 bg-white px-4 text-sm font-semibold outline-none"
              onChange={(event) => updateFilters({ sort: event.target.value })}
              value={filters.sort}
            >
              <option value="recommended">{copy.options.recommended}</option>
              <option value="price-asc">{copy.options.priceAsc}</option>
              <option value="price-desc">{copy.options.priceDesc}</option>
              <option value="range-desc">{copy.options.rangeDesc}</option>
              <option value="charging-asc">{copy.options.chargingAsc}</option>
            </select>
            <Button
              className="h-14 rounded-xl bg-slate-950 text-white hover:bg-slate-800 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
              type="button"
            >
              <Filter className="mr-2 size-4" />
              {copy.filters}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="sticky top-20 hidden self-start lg:block">
            <FilterPanel
              copy={copy}
              facets={result.facets}
              filters={{
                ...filters,
                brand: lockedBrand ?? filters.brand,
                bodyType: lockedBodyType ?? filters.bodyType,
              }}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between text-sm text-slate-500">
              <span>
                {result.total} {copy.found} /{" "}
                {result.source === "algolia" ? "Algolia" : copy.sourceLocal}
              </span>
              {isPending ? <span>{copy.updating}</span> : null}
            </div>
            {result.hits.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.hits.map((car, index) => (
                  <ListingCard
                    car={car}
                    copy={copy}
                    index={index}
                    key={`${car.brandSlug}-${car.modelSlug}`}
                    locale={locale}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-semibold">{copy.noResultsTitle}</h2>
                <p className="mt-2 text-slate-500">{copy.noResultsDescription}</p>
                <Button
                  className="mt-6 bg-slate-950 text-white hover:bg-slate-800"
                  onClick={clearFilters}
                >
                  {copy.clear}
                </Button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                disabled={result.page <= 1}
                onClick={() => void goToPage(result.page - 1)}
                type="button"
                variant="glass"
              >
                {copy.previous}
              </Button>
              <span className="text-sm font-semibold text-slate-600">
                {copy.page} {result.page} {copy.of} {result.totalPages}
              </span>
              <Button
                disabled={result.page >= result.totalPages}
                onClick={() => void goToPage(result.page + 1)}
                type="button"
                variant="glass"
              >
                {copy.next}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] bg-slate-950/40 p-4 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ y: 0 }}
              className="absolute inset-x-3 bottom-3 max-h-[82vh] overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl"
              exit={{ y: 40 }}
              initial={{ y: 40 }}
            >
              <FilterPanel
                copy={copy}
                facets={result.facets}
                filters={{
                  ...filters,
                  brand: lockedBrand ?? filters.brand,
                  bodyType: lockedBodyType ?? filters.bodyType,
                }}
                onChange={updateFilters}
                onClear={clearFilters}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function buildParams(filters: ListingFilters, page: number) {
  const params = new URLSearchParams();
  const entries = {
    q: filters.query,
    brand: filters.brand,
    bodyType: filters.bodyType,
    minRange: filters.minRange,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    page: `${page}`,
    pageSize: "6",
  };

  Object.entries(entries).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params;
}
