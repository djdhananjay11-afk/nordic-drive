import { cn } from "@/lib/utils";
import type { NordicCar } from "@/features/cars/data/nordic-cars";

import { VehicleImage } from "./vehicle-image";

export function MiniVehicle({
  car,
  className,
  colorClass,
}: {
  car?: NordicCar;
  className?: string;
  colorClass: string;
}) {
  if (car) {
    return <VehicleImage car={car} className={cn("h-36", className)} />;
  }

  return (
    <div className={cn("relative h-36 overflow-hidden rounded-md bg-gradient-to-br p-4", colorClass, className)}>
      <div className="absolute inset-x-10 bottom-8 h-12 rounded-[50%] bg-slate-400/20 blur-xl" />
      <div className="absolute inset-x-8 bottom-12 h-9 rounded-t-[56px] border border-slate-300/70 bg-white/70 shadow-xl" />
      <div className="absolute left-[34%] right-[34%] bottom-[84px] h-8 rounded-t-[48px] border border-slate-300/60 bg-white/80" />
      <div className="absolute bottom-9 left-12 size-10 rounded-full border-[7px] border-slate-900 bg-slate-200" />
      <div className="absolute bottom-9 right-12 size-10 rounded-full border-[7px] border-slate-900 bg-slate-200" />
      <div className="absolute inset-x-6 bottom-8 h-px bg-gradient-to-r from-transparent via-slate-400/80 to-transparent" />
    </div>
  );
}
