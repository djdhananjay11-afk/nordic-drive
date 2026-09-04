"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

import type { NordicCar } from "@/features/cars/data/nordic-cars";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { HomeDictionary } from "@/lib/i18n/dictionaries";

export function HomeSearch({
  cars,
  copy,
  locale,
}: {
  cars: NordicCar[];
  copy: HomeDictionary["search"];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return cars.slice(0, 4);
    }

    return cars
      .filter((car) =>
        `${car.brand} ${car.model} ${car.segment}`.toLowerCase().includes(normalized),
      )
      .slice(0, 4);
  }, [cars, query]);

  return (
    <motion.div
      className="mx-auto w-full max-w-4xl rounded-2xl border border-white/70 bg-white/58 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 24 }}
      transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex h-14 flex-1 items-center rounded-xl bg-white px-4">
          <Search className="mr-3 size-5 text-slate-400" />
          <input
            className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            value={query}
          />
        </label>
        <Link
          className="inline-flex h-14 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          href={localizePath(locale, "/cars") as Route}
        >
          <SlidersHorizontal className="mr-2 size-4" />
          {copy.advanced}
        </Link>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {results.map((car) => (
          <Link
            className="rounded-xl bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
            href={localizePath(locale, `/cars/${car.brandSlug}/${car.modelSlug}`) as Route}
            key={`${car.brandSlug}-${car.modelSlug}`}
          >
            <div className="text-xs font-medium text-slate-500">{car.brand}</div>
            <div className="truncate text-sm font-semibold">{car.model}</div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
