import type { CatalogueLocale, CatalogueVehicle, Metric } from "@nordicdrive/database/catalogue";
import { catalogueCopy } from "./copy";

export function FactValue({
  vehicle,
  metric,
  locale,
}: {
  vehicle: CatalogueVehicle;
  metric: Metric;
  locale: CatalogueLocale;
}) {
  const fact = vehicle.facts[metric];
  const copy = catalogueCopy[locale];
  if (!fact) return <span className="text-sm font-normal text-zinc-500">{copy.unknown}</span>;
  const value =
    typeof fact.value === "number"
      ? new Intl.NumberFormat(locale === "no" ? "nb-NO" : "en-GB").format(fact.value)
      : fact.value;
  return (
    <span>
      {metric === "price"
        ? `${copy.from} `
        : metric === "range" || metric === "dc"
          ? `${copy.upto} `
          : ""}
      {value} {fact.unit}
    </span>
  );
}
