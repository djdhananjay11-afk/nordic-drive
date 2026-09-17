import Link from "next/link";
import type { Route } from "next";
import {
  metricLabels,
  selectVehicles,
  vehiclePath,
  type CatalogueVehicle,
  type Metric,
} from "@nordicdrive/database/catalogue";
import { JsonLd } from "@/components/seo/json-ld";
import { getRequestLocale } from "@/lib/i18n/server";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";
import { CatalogueBrowser } from "./catalogue-browser";
import { catalogueCopy } from "./copy";
import { FactValue } from "./fact-value";
import { getCatalogue } from "./repository";
import { CatalogueMedia } from "./vehicle-media";

const shell = "mx-auto w-full max-w-6xl px-5 py-10 text-zinc-950 sm:px-8 sm:py-14";
export type CatalogueParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : (value?.[0] ?? "");

export async function CatalogueLanding({
  home = false,
  params = {},
  brand,
}: {
  home?: boolean;
  params?: CatalogueParams;
  brand?: string;
}) {
  const locale = await getRequestLocale();
  const vehicles = await getCatalogue();
  const copy = catalogueCopy[locale];
  return (
    <main id="main-content" className={shell}>
      <p className="mb-3 text-xs font-semibold uppercase text-emerald-800">
        {home ? copy.title : "NordicDrive"}
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
        {home ? "NordicDrive" : copy.title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600">{copy.intro}</p>
      <CatalogueBrowser
        vehicles={vehicles}
        locale={locale}
        initialQuery={first(params.q)}
        initialBrand={brand ?? first(params.brand)}
        initialIds={first(params.vehicles).split(",")}
      />
      <p className="mt-10 max-w-3xl border-t border-zinc-200 pt-6 text-sm leading-6 text-zinc-600">
        {copy.conditions}
      </p>
    </main>
  );
}

export function CatalogueDetail({
  vehicle,
  locale,
}: {
  vehicle: CatalogueVehicle;
  locale: Locale;
}) {
  const copy = catalogueCopy[locale];
  const metrics = Object.keys(metricLabels) as Metric[];
  return (
    <main id="main-content" className={shell}>
      <JsonLd
        id="source-backed-vehicle"
        data={{
          "@context": "https://schema.org",
          "@type": "Car",
          name: `${vehicle.brand} ${vehicle.model} ${vehicle.variant}`,
          brand: { "@type": "Brand", name: vehicle.brand },
          url: absoluteUrl(localizePath(locale, vehiclePath(vehicle))),
          citation: vehicle.sources.map((source) => source.url),
        }}
      />
      <Link
        href={localizePath(locale, "/verified-cars") as Route}
        className="inline-flex min-h-11 items-center text-sm text-emerald-800 underline"
      >
        {copy.back}
      </Link>
      <h1 className="mt-4 text-4xl font-semibold">
        {vehicle.brand} {vehicle.model}
      </h1>
      <p className="mt-2 text-xl text-zinc-600">{vehicle.variant}</p>
      <p className="mb-6 mt-4 text-sm text-zinc-600">
        {copy.checked}: <time dateTime={vehicle.checkedOn}>{vehicle.checkedOn}</time>.{" "}
        {copy.unknownYear}
      </p>
      <CatalogueMedia key={vehicle.id} vehicle={vehicle} locale={locale} />
      <div className="my-8 flex flex-wrap gap-4">
        <Link
          className="inline-flex min-h-11 items-center rounded-md bg-emerald-800 px-5 font-semibold text-white"
          href={localizePath(locale, `/verified-compare?vehicles=${vehicle.id}`) as Route}
        >
          {copy.compare}
        </Link>
        <a
          href={vehicle.galleryUrl}
          className="inline-flex min-h-11 items-center text-emerald-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {copy.photos}
        </a>
      </div>
      <h2 className="mt-10 text-2xl font-semibold">{copy.specifications}</h2>
      <dl className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
        {metrics.map((metric) => {
          const fact = vehicle.facts[metric];
          return (
            <div key={metric} className="grid gap-2 py-4 sm:grid-cols-2 sm:gap-8">
              <dt className="text-sm text-zinc-600">{metricLabels[metric][locale]}</dt>
              <dd>
                <span className="font-semibold">
                  <FactValue vehicle={vehicle} metric={metric} locale={locale} />
                </span>
                {fact && (
                  <a
                    href={vehicle.sources[fact.source]!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-xs text-emerald-800 underline"
                    aria-label={`${copy.sources}: ${metricLabels[metric][locale]}`}
                  >
                    [{fact.source + 1}]
                  </a>
                )}
                {fact?.note && (
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{fact.note[locale]}</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="my-6 max-w-3xl text-sm leading-6 text-zinc-600">{copy.conditions}</p>
      <h2 className="text-xl font-semibold">{copy.sources}</h2>
      <ol className="mt-3 list-inside list-decimal space-y-2">
        {vehicle.sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm text-emerald-800 underline"
            >
              {source.title}
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}

export async function CatalogueComparison({ params }: { params: CatalogueParams }) {
  const locale = await getRequestLocale();
  const copy = catalogueCopy[locale];
  const vehicles = await getCatalogue();
  const selected = selectVehicles(vehicles, [
    ...first(params.vehicles).split(","),
    first(params.add),
  ]);
  return (
    <main id="main-content" className={shell}>
      <h1 className="text-3xl font-semibold">{copy.compare}</h1>
      <p className="mt-3 text-sm text-zinc-600">{copy.limit}</p>
      <Link
        href={
          localizePath(
            locale,
            `/verified-cars?vehicles=${encodeURIComponent(selected.map((v) => v.id).join(","))}`,
          ) as Route
        }
        className="my-6 inline-flex min-h-11 items-center rounded-md bg-emerald-800 px-5 font-semibold text-white"
      >
        {copy.add}
      </Link>
      {selected.length ? (
        <div
          role="region"
          aria-label={copy.compare}
          tabIndex={0}
          className="max-w-full overflow-x-auto rounded-lg border border-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
        >
          <table
            className="w-full table-fixed border-collapse text-left text-sm"
            style={{ minWidth: 112 + selected.length * 216 }}
          >
            <caption className="sr-only">{copy.specifications}</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-10 w-28 break-words border-b border-zinc-200 bg-zinc-50 p-3"
                >
                  {copy.specifications}
                </th>
                {selected.map((v) => (
                  <th
                    scope="col"
                    key={v.id}
                    className="border-b border-zinc-200 bg-zinc-50 p-4 align-top"
                  >
                    <Link
                      className="block text-lg font-semibold text-emerald-800 underline"
                      href={localizePath(locale, vehiclePath(v)) as Route}
                    >
                      {v.brand} {v.model}
                    </Link>
                    <span className="mt-1 block font-normal">{v.variant}</span>
                    <Link
                      className="mt-2 inline-flex min-h-11 items-center font-normal underline"
                      aria-label={`${copy.remove} ${v.brand} ${v.model}`}
                      href={
                        localizePath(
                          locale,
                          `/verified-compare?vehicles=${selected
                            .filter((item) => item.id !== v.id)
                            .map((item) => item.id)
                            .join(",")}`,
                        ) as Route
                      }
                    >
                      {copy.remove}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(metricLabels) as Metric[]).map((metric) => (
                <tr key={metric}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 break-words border-b border-zinc-200 bg-white p-3 font-medium"
                  >
                    {metricLabels[metric][locale]}
                  </th>
                  {selected.map((v) => (
                    <td key={v.id} className="border-b border-zinc-200 p-4 align-top">
                      <FactValue vehicle={v} metric={metric} locale={locale} />
                      {v.facts[metric]?.note && (
                        <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-600">
                          {v.facts[metric]!.note![locale]}
                        </p>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-10 text-zinc-600">{copy.selectPrompt}</p>
      )}
      <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-600">{copy.conditions}</p>
      {selected.map((vehicle) => (
        <div key={vehicle.id} className="mt-5 border-t border-zinc-200 pt-4 text-sm">
          <p>
            {vehicle.brand} {vehicle.model}: {copy.checked} {vehicle.checkedOn}
          </p>
          {vehicle.sources.map((source) => (
            <a
              key={source.url}
              className="mr-4 inline-flex min-h-11 items-center text-emerald-800 underline"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.title}
            </a>
          ))}
        </div>
      ))}
    </main>
  );
}
