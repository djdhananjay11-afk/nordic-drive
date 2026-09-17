"use client";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  filterVehicles,
  metricLabels,
  selectVehicles,
  vehiclePath,
  type CatalogueVehicle,
  type CatalogueLocale,
} from "@nordicdrive/database/catalogue";
import { localizePath } from "@/lib/i18n/config";
import { CatalogueMedia } from "./vehicle-media";
import { FactValue } from "./fact-value";
import { catalogueCopy } from "./copy";

const inputClass =
  "mt-2 min-h-11 w-full min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700";
export function CatalogueBrowser({
  vehicles,
  locale,
  initialQuery = "",
  initialBrand = "",
  initialIds = [],
}: {
  vehicles: CatalogueVehicle[];
  locale: CatalogueLocale;
  initialQuery?: string;
  initialBrand?: string;
  initialIds?: string[];
}) {
  const copy = catalogueCopy[locale];
  const [query, setQuery] = useState(initialQuery);
  const [brand, setBrand] = useState(initialBrand);
  const [budget, setBudget] = useState("");
  const [range, setRange] = useState("");
  const [sort, setSort] = useState("name");
  const [selected, setSelected] = useState(() =>
    selectVehicles(vehicles, initialIds).map((v) => v.id),
  );
  const results = filterVehicles(
    vehicles,
    query,
    brand,
    budget ? Number(budget) : undefined,
    range ? Number(range) : undefined,
  ).sort((a, b) => {
    if (sort === "price")
      return Number(a.facts.price?.value ?? Infinity) - Number(b.facts.price?.value ?? Infinity);
    if (sort === "range")
      return Number(b.facts.range?.value ?? -Infinity) - Number(a.facts.range?.value ?? -Infinity);
    return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "nb-NO");
  });
  const compareHref = localizePath(
    locale,
    `/verified-compare?vehicles=${encodeURIComponent(selected.join(","))}`,
  ) as Route;
  return (
    <>
      <section
        aria-label={copy.search}
        className="my-8 grid gap-4 border-y border-zinc-200 py-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className="text-sm font-medium">
          {copy.search}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium">
          {copy.brand}
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass}>
            <option value="">{copy.all}</option>
            {[...new Map(vehicles.map((v) => [v.brandSlug, v.brand])).entries()].map(
              ([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="text-sm font-medium">
          {copy.budget}
          <input
            type="number"
            min="0"
            step="10000"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium">
          {copy.range}
          <input
            type="number"
            min="0"
            step="10"
            inputMode="numeric"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium">
          {copy.sort}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass}>
            <option value="name">{copy.name}</option>
            <option value="price">{copy.price}</option>
            <option value="range">{copy.longest}</option>
          </select>
        </label>
      </section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p aria-live="polite" role="status" className="text-sm text-zinc-600">
          {results.length} {copy.count}
        </p>
        <button
          type="button"
          className="min-h-11 text-sm underline underline-offset-4"
          onClick={() => {
            setQuery("");
            setBrand("");
            setBudget("");
            setRange("");
            setSort("name");
          }}
        >
          {copy.clear}
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {results.map((vehicle) => (
          <article
            key={vehicle.id}
            className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white"
          >
            <CatalogueMedia vehicle={vehicle} locale={locale} />
            <div className="p-5 sm:p-6">
              <h2 className="text-2xl font-semibold">
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">{vehicle.variant}</p>
              <dl className="my-6 grid grid-cols-2 gap-5">
                {(["price", "range"] as const).map((metric) => (
                  <div key={metric}>
                    <dt className="text-xs text-zinc-600">{metricLabels[metric][locale]}</dt>
                    <dd className="mt-1 text-lg font-semibold">
                      <FactValue vehicle={vehicle} metric={metric} locale={locale} />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-zinc-600">
                {copy.checked}: <time dateTime={vehicle.checkedOn}>{vehicle.checkedOn}</time>
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-5 accent-emerald-700"
                    checked={selected.includes(vehicle.id)}
                    disabled={!selected.includes(vehicle.id) && selected.length >= 4}
                    onChange={(e) =>
                      setSelected((current) =>
                        e.target.checked
                          ? [...new Set([...current, vehicle.id])].slice(0, 4)
                          : current.filter((id) => id !== vehicle.id),
                      )
                    }
                  />
                  {copy.choose}
                </label>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-800"
                  href={localizePath(locale, vehiclePath(vehicle)) as Route}
                >
                  {copy.details}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!results.length && (
        <p className="py-12 text-center text-zinc-600">
          {vehicles.length ? copy.empty : copy.incomplete}
        </p>
      )}
      {selected.length > 0 && (
        <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg">
          <p className="text-sm" aria-live="polite">
            {selected.length}/4 {copy.selected}
          </p>
          <Link
            href={compareHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white"
          >
            {copy.compare}
          </Link>
        </div>
      )}
    </>
  );
}
