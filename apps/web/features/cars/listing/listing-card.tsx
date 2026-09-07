"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";
import type { ComponentType } from "react";
import { BatteryCharging, Gauge, Snowflake, Zap, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNok, type NordicCar } from "@/features/cars/data/nordic-cars";
import { VehicleImage } from "@/features/cars/components/vehicle-image";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { ListingDictionary } from "@/lib/i18n/dictionaries";

export function ListingCard({
  car,
  copy,
  index,
  locale,
}: {
  car: NordicCar;
  copy: ListingDictionary;
  index: number;
  locale: Locale;
}) {
  const router = useRouter();
  const [limitReached, setLimitReached] = useState(false);

  function addToComparison() {
    const params = new URLSearchParams(window.location.search);
    const selected = [...new Set((params.get("vehicles") ?? "").split(",").filter(Boolean))];
    const key = `${car.brandSlug}:${car.modelSlug}`;
    if (!selected.includes(key) && selected.length >= 4) {
      setLimitReached(true);
      return;
    }
    const vehicles = [...new Set([...selected, key])];
    router.push(
      `${localizePath(locale, "/compare")}?${new URLSearchParams({ vehicles: vehicles.join(",") })}` as Route,
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      transition={{
        delay: Math.min(index * 0.035, 0.25),
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <GlassCard className="group h-full overflow-hidden bg-white/76 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <VehicleImage car={car} className="h-48" />
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{car.brand}</p>
              <h2 className="mt-1 text-2xl font-semibold">{car.model}</h2>
            </div>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              {car.segment}
            </span>
          </div>
          <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{car.tagline}</p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric icon={BatteryCharging} label="WLTP" value={`${car.rangeWltpKm} km`} />
            <Metric icon={Snowflake} label={copy.winter} value={`${car.winterRangeKm} km`} />
            <Metric icon={Zap} label="10-80%" value={`${car.chargingMinutes}m`} />
            <Metric icon={Gauge} label="0-100" value={`${car.accelerationSeconds.toFixed(1)}s`} />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">{copy.from}</div>
              <div className="text-lg font-semibold">{formatNok(car.priceNok)}</div>
            </div>
            <Button asChild className="bg-slate-950 text-white hover:bg-slate-800" size="sm">
              <Link href={localizePath(locale, `/cars/${car.brandSlug}/${car.modelSlug}`) as Route}>
                {copy.details}
              </Link>
            </Button>
          </div>
          <Button
            className="mt-4 h-auto min-h-11 w-full whitespace-normal border border-slate-300 bg-white text-slate-950 hover:bg-slate-100"
            onClick={addToComparison}
            type="button"
            variant="secondary"
          >
            <Plus aria-hidden="true" className="mr-2 size-4 shrink-0" />
            {locale === "no" ? "Legg til sammenligning" : "Add to comparison"}
          </Button>
          {limitReached ? (
            <p role="status" className="mt-2 text-sm text-slate-600">
              {locale === "no"
                ? "Maks 4 biler. Fjern en bil fra sammenligningen først."
                : "Maximum 4 cars. Remove a car from your comparison first."}{" "}
              <Link
                className="underline"
                href={
                  `${localizePath(locale, "/compare")}?${new URLSearchParams({ vehicles: new URLSearchParams(window.location.search).get("vehicles") ?? "" })}` as Route
                }
              >
                {locale === "no" ? "Se sammenligning" : "View comparison"}
              </Link>
            </p>
          ) : null}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <Icon className="size-4 text-slate-400" />
      <div className="mt-2 truncate text-sm font-semibold">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
