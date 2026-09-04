import { Check, Minus } from "lucide-react";
import { Fragment } from "react";

import type { NordicCar } from "@/features/cars/data/nordic-cars";
import { formatNok, getEfficiencyScore } from "@/features/cars/data/nordic-cars";

const rows = [
  { label: "Price from", getValue: (car: NordicCar) => formatNok(car.priceNok) },
  { label: "Monthly estimate", getValue: (car: NordicCar) => formatNok(car.monthlyNok) },
  { label: "WLTP range", getValue: (car: NordicCar) => `${car.rangeWltpKm} km` },
  { label: "Winter estimate", getValue: (car: NordicCar) => `${car.winterRangeKm} km` },
  { label: "Fast charging", getValue: (car: NordicCar) => `${car.fastChargingKw} kW` },
  { label: "10-80% charging", getValue: (car: NordicCar) => `${car.chargingMinutes} min` },
  { label: "Battery", getValue: (car: NordicCar) => `${car.batteryKwh} kWh` },
  { label: "0-100 km/h", getValue: (car: NordicCar) => `${car.accelerationSeconds.toFixed(1)} s` },
  { label: "Winter efficiency", getValue: (car: NordicCar) => `${getEfficiencyScore(car)} km/kWh` },
  { label: "Towing", getValue: (car: NordicCar) => `${car.towingKg} kg` },
  {
    label: "Heat pump",
    getValue: (car: NordicCar) =>
      car.heatPump ? <Check className="mx-auto size-5 text-emerald-600" /> : <Minus className="mx-auto size-5" />,
  },
];

export function CompareTable({ cars }: { cars: NordicCar[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-foreground/10 bg-white/72 shadow-sm backdrop-blur">
      <div className="grid" style={{ gridTemplateColumns: `minmax(150px, 0.75fr) repeat(${cars.length}, minmax(160px, 1fr))` }}>
        <div className="border-b border-foreground/10 bg-slate-50 p-4 text-sm font-semibold text-muted-foreground">
          Specification
        </div>
        {cars.map((car) => (
          <div className="border-b border-l border-foreground/10 bg-slate-50 p-4" key={car.modelSlug}>
            <div className="text-sm text-muted-foreground">{car.brand}</div>
            <div className="font-semibold">{car.model}</div>
          </div>
        ))}
        {rows.map((row) => (
          <Fragment key={row.label}>
            <div className="border-b border-foreground/10 p-4 text-sm font-medium text-muted-foreground">
              {row.label}
            </div>
            {cars.map((car) => (
              <div className="border-b border-l border-foreground/10 p-4 text-center text-sm font-semibold" key={`${row.label}-${car.modelSlug}`}>
                {row.getValue(car)}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
