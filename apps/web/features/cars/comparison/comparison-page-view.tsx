"use client";

import { Fragment, useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Check,
  Gauge,
  Minus,
  Plus,
  ShieldCheck,
  Snowflake,
  Trash2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MiniVehicle } from "@/features/cars/components/mini-vehicle";
import {
  buildComparison,
  enrichCar,
  formatComparisonVehiclesParam,
  type ComparisonChartSeries,
  type ComparisonResult,
  type ComparisonVehicle,
} from "@/features/cars/comparison/comparison-engine";
import type { NordicCar } from "@/features/cars/data/nordic-cars";

type ComparisonPageViewProps = {
  initialComparison: ComparisonResult;
  allCars: NordicCar[];
};

export function ComparisonPageView({ allCars, initialComparison }: ComparisonPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const allVehicles = useMemo(() => allCars.map(enrichCar), [allCars]);
  const [selectedKeys, setSelectedKeys] = useState(initialComparison.vehicles.map((car) => car.key));
  const [remoteSummary, setRemoteSummary] = useState(initialComparison.summary);

  const selectedVehicles = useMemo(
    () =>
      selectedKeys
        .map((key) => allVehicles.find((car) => car.key === key))
        .filter((car): car is ComparisonVehicle => Boolean(car)),
    [allVehicles, selectedKeys],
  );

  const comparison = useMemo(() => buildComparison(selectedVehicles), [selectedVehicles]);
  const summary = remoteSummary ?? comparison.summary;
  const availableVehicles = allVehicles.filter((car) => !selectedKeys.includes(car.key));

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("vehicles", formatComparisonVehiclesParam(selectedKeys));
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }, [pathname, router, selectedKeys]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      try {
        const params = new URLSearchParams({ vehicles: formatComparisonVehiclesParam(selectedKeys) });
        const response = await fetch(`/api/compare?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }
        const nextComparison = (await response.json()) as ComparisonResult;
        setRemoteSummary(nextComparison.summary);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setRemoteSummary(comparison.summary);
        }
      }
    }

    loadSummary();
    return () => controller.abort();
  }, [comparison.summary, selectedKeys]);

  const addVehicle = (key: string) => {
    if (!key || selectedKeys.includes(key) || selectedKeys.length >= 4) {
      return;
    }
    setSelectedKeys((current) => [...current, key]);
  };

  const removeVehicle = (key: string) => {
    if (selectedKeys.length <= 2) {
      return;
    }
    setSelectedKeys((current) => current.filter((candidate) => candidate !== key));
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_44%,#ffffff_100%)] text-slate-950">
      <section className="relative overflow-hidden px-5 pb-10 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.92),rgba(219,234,254,0.58)_42%,rgba(241,245,249,0)_74%)]" />
        <div className="absolute left-1/2 top-0 h-72 w-[760px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-8 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Comparison engine</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal md:text-7xl">
              Decide with every meaningful metric visible.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Compare up to four EVs across Norwegian pricing, winter range, charging, safety, cabin quality, dimensions,
              warranty, and performance.
            </p>
          </div>

          <GlassCard className="bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/48">
              <BrainCircuit className="size-4" />
              Nordic AI summary
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{summary.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{summary.narrative}</p>
          </GlassCard>
        </div>
      </section>

      <section className="px-5 py-6">
        <div className="mx-auto max-w-7xl">
          <VehiclePicker
            availableVehicles={availableVehicles}
            canAdd={selectedKeys.length < 4}
            onAdd={addVehicle}
            selectedCount={selectedKeys.length}
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {comparison.vehicles.map((car) => {
                const score = comparison.scores.find((candidate) => candidate.carKey === car.key);
                return (
                  <SelectedVehicleCard
                    car={car}
                    key={car.key}
                    onRemove={() => removeVehicle(car.key)}
                    rank={score?.rank ?? 0}
                    score={score?.score ?? 0}
                    showRemove={comparison.vehicles.length > 2}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-4">
          <AnimatedStat icon={Snowflake} label="Range leader" value={getBestLabel(comparison, "winterRangeKm")} />
          <AnimatedStat icon={Zap} label="Fastest charge" value={getBestLabel(comparison, "chargingMinutes")} />
          <AnimatedStat icon={ShieldCheck} label="Safety leader" value={getBestLabel(comparison, "safetyScore")} />
          <AnimatedStat icon={Gauge} label="Performance" value={getBestLabel(comparison, "accelerationSeconds")} />
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-2">
            {comparison.charts.map((chart) => (
              <ComparisonChart chart={chart} key={chart.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Sticky table</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Deep specification view</h2>
            </div>
            <div className="text-sm text-slate-500">Best values are highlighted automatically.</div>
          </div>
          <ResponsiveComparisonTable comparison={comparison} />
        </div>
      </section>

      <section className="px-5 pb-24 pt-8">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="overflow-hidden bg-white/78 p-7 shadow-sm md:p-9">
            <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <BrainCircuit className="size-4" />
                  Recommendation signals
                </div>
                <h2 className="mt-4 text-3xl font-semibold">What NordicDrive would prioritize</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {summary.highlights.map((highlight) => (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700" key={highlight}>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}

function VehiclePicker({
  availableVehicles,
  canAdd,
  onAdd,
  selectedCount,
}: {
  availableVehicles: ComparisonVehicle[];
  canAdd: boolean;
  onAdd: (key: string) => void;
  selectedCount: number;
}) {
  return (
    <GlassCard className="flex flex-col gap-4 bg-white/78 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Vehicle slots</div>
        <div className="mt-1 text-xl font-semibold">{selectedCount}/4 selected</div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          className="h-11 min-w-72 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-slate-950"
          disabled={!canAdd}
          onChange={(event) => {
            onAdd(event.target.value);
            event.currentTarget.value = "";
          }}
        >
          <option value="">{canAdd ? "Add another vehicle" : "Maximum 4 vehicles"}</option>
          {availableVehicles.map((car) => (
            <option key={car.key} value={car.key}>
              {car.brand} {car.model}
            </option>
          ))}
        </select>
        <Button asChild className="bg-slate-950 text-white hover:bg-slate-800" size="lg">
          <Link href="/cars">
            <Plus className="mr-2 size-4" />
            Browse cars
          </Link>
        </Button>
      </div>
    </GlassCard>
  );
}

function SelectedVehicleCard({
  car,
  onRemove,
  rank,
  score,
  showRemove,
}: {
  car: ComparisonVehicle;
  onRemove: () => void;
  rank: number;
  score: number;
  showRemove: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      layout
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard className="h-full overflow-hidden bg-white/78 p-3 shadow-sm">
        <MiniVehicle car={car} colorClass={car.colorClass} />
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{car.brand}</p>
              <h2 className="mt-1 text-xl font-semibold">{car.model}</h2>
            </div>
            {showRemove ? (
              <button
                aria-label={`Remove ${car.brand} ${car.model}`}
                className="grid size-9 place-items-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                onClick={onRemove}
                type="button"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-500">Nordic score</span>
              <span className="font-semibold text-slate-950">#{rank}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                animate={{ width: `${score}%` }}
                className="h-full rounded-full bg-slate-950"
                initial={{ width: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-2 text-2xl font-semibold">{score}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AnimatedStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <GlassCard className="bg-white/78 p-5 shadow-sm">
      <Icon className="size-5 text-slate-400" />
      <div className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-xl font-semibold text-slate-950"
        initial={{ opacity: 0, y: 8 }}
        key={value}
        transition={{ duration: 0.35 }}
      >
        {value}
      </motion.div>
    </GlassCard>
  );
}

function ComparisonChart({ chart }: { chart: ComparisonChartSeries }) {
  const values = chart.points.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);

  return (
    <GlassCard className="bg-white/78 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            <BarChart3 className="size-4" />
            {chart.unit}
          </div>
          <h3 className="mt-2 text-2xl font-semibold">{chart.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{chart.description}</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {chart.points.map((point) => {
          const normalized =
            max === min
              ? 100
              : chart.direction === "lower"
                ? ((max - point.value) / (max - min)) * 78 + 22
                : ((point.value - min) / (max - min)) * 78 + 22;

          return (
            <div key={point.carKey}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="truncate font-semibold text-slate-700">{point.label}</span>
                <span className={cn("font-semibold", point.isBest ? "text-slate-950" : "text-slate-500")}>
                  {point.displayValue}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  animate={{ width: `${normalized}%` }}
                  className={cn("h-full rounded-full", point.isBest ? "bg-slate-950" : "bg-slate-300")}
                  initial={{ width: 0 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function ResponsiveComparisonTable({ comparison }: { comparison: ComparisonResult }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/78 shadow-sm backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="sticky top-20 z-20 bg-white/95 backdrop-blur-xl">
            <tr>
              <th className="sticky left-0 z-30 w-64 border-b border-r border-slate-200 bg-white/95 p-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Metric
              </th>
              {comparison.vehicles.map((car) => (
                <th className="min-w-48 border-b border-slate-200 p-4" key={car.key}>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{car.brand}</div>
                  <div className="mt-1 text-base font-semibold text-slate-950">{car.model}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.sections.map((section) => (
              <Fragment key={section.category}>
                <tr>
                  <td
                    className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
                    colSpan={comparison.vehicles.length + 1}
                  >
                    {section.category}
                  </td>
                </tr>
                {section.rows.map((row) => (
                  <tr className="group" key={row.id}>
                    <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white p-4">
                      <div className="font-semibold text-slate-800">{row.label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{row.description}</div>
                    </td>
                    {row.cells.map((cell) => (
                      <td
                        className={cn(
                          "border-b border-slate-200 p-4 text-sm font-semibold transition group-hover:bg-slate-50",
                          cell.isBest ? "bg-emerald-50 text-emerald-700" : "text-slate-700",
                        )}
                        key={`${row.id}-${cell.carKey}`}
                      >
                        <div className="flex items-center gap-2">
                          {cell.isBest ? <Check className="size-4" /> : row.direction === "neutral" ? <Minus className="size-4 text-slate-300" /> : null}
                          {cell.displayValue}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getBestLabel(comparison: ComparisonResult, metricId: string) {
  const row = comparison.rows.find((candidate) => candidate.id === metricId);
  const bestCell = row?.cells.find((cell) => cell.isBest);
  const vehicle = comparison.vehicles.find((car) => car.key === bestCell?.carKey);
  return vehicle ? `${vehicle.brand} ${vehicle.model}` : "Add vehicles";
}
