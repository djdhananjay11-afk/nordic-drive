"use client";

import type * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CarSearchResult } from "@/features/cars/search/search-types";
import type { ListingDictionary } from "@/lib/i18n/dictionaries";

export type ListingFilters = {
  query: string;
  brand: string;
  bodyType: string;
  minRange: string;
  maxPrice: string;
  sort: string;
};

export function FilterPanel({
  copy,
  facets,
  filters,
  onChange,
  onClear,
  onClose,
}: {
  copy: ListingDictionary;
  facets: CarSearchResult["facets"];
  filters: ListingFilters;
  onChange: (next: Partial<ListingFilters>) => void;
  onClear: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/82 p-4 shadow-sm backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{copy.filters}</h2>
          <p className="text-xs text-slate-500">{copy.filtersHint}</p>
        </div>
        {onClose ? (
          <Button
            aria-label={copy.closeFilters}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5">
        <Field label={copy.brand}>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400"
            onChange={(event) => onChange({ brand: event.target.value })}
            value={filters.brand}
          >
            <option value="">{copy.options.allBrands}</option>
            {facets.brands.map((brand) => (
              <option key={brand.value} value={brand.value}>
                {brand.value} ({brand.count})
              </option>
            ))}
          </select>
        </Field>

        <Field label={copy.bodyType}>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400"
            onChange={(event) => onChange({ bodyType: event.target.value })}
            value={filters.bodyType}
          >
            <option value="">{copy.options.allBodyTypes}</option>
            {facets.bodyTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.value} ({type.count})
              </option>
            ))}
          </select>
        </Field>

        <Field helper={`${facets.range.min}-${facets.range.max} km WLTP`} label={copy.minRange}>
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400"
            min={0}
            onChange={(event) => onChange({ minRange: event.target.value })}
            placeholder="400"
            type="number"
            value={filters.minRange}
          />
        </Field>

        <Field
          helper={`${copy.upTo} ${facets.price.max.toLocaleString("nb-NO")} NOK`}
          label={copy.maxPrice}
        >
          <input
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400"
            min={0}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            placeholder="700000"
            type="number"
            value={filters.maxPrice}
          />
        </Field>

        <Button
          className="bg-slate-950 text-white hover:bg-slate-800"
          onClick={onClear}
          type="button"
        >
          {copy.clear}
        </Button>
      </div>
    </div>
  );
}

function Field({
  children,
  helper,
  label,
}: Readonly<{
  children: React.ReactNode;
  helper?: string;
  label: string;
}>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}
