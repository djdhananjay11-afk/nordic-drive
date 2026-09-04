import Link from "next/link";
import type { Route } from "next";
import type * as React from "react";
import { BatteryCharging, Snowflake, Zap } from "lucide-react";

import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NordicCar } from "@/features/cars/data/nordic-cars";
import { formatNok } from "@/features/cars/data/nordic-cars";

import { MiniVehicle } from "./mini-vehicle";

export function CarCard({ car }: { car: NordicCar }) {
  const href = `/cars/${car.brandSlug}/${car.modelSlug}` as Route;

  return (
    <GlassCard className="group overflow-hidden bg-white/72 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <MiniVehicle car={car} colorClass={car.colorClass} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground/55">{car.brand}</p>
            <h2 className="mt-1 text-xl font-semibold">{car.model}</h2>
          </div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {car.segment}
          </div>
        </div>
        <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{car.tagline}</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Spec icon={BatteryCharging} label="WLTP" value={`${car.rangeWltpKm} km`} />
          <Spec icon={Snowflake} label="Winter" value={`${car.winterRangeKm} km`} />
          <Spec icon={Zap} label="10-80%" value={`${car.chargingMinutes} min`} />
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">From</div>
            <div className="font-semibold">{formatNok(car.priceNok)}</div>
          </div>
          <Button asChild className="rounded-md bg-slate-900 text-white hover:bg-slate-800" size="sm">
            <Link href={href}>View details</Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-white/70 p-3">
      <Icon className="size-4 text-foreground/50" />
      <div className="mt-2 text-sm font-semibold">{value}</div>
      <div className="text-[11px] text-foreground/50">{label}</div>
    </div>
  );
}
