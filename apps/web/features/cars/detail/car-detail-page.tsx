import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  BatteryCharging,
  BrainCircuit,
  Calendar,
  Gauge,
  Play,
  Snowflake,
  Sparkles,
  Truck,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatNok,
  getEfficiencyScore,
  nordicCars,
  type NordicCar,
} from "@/features/cars/data/nordic-cars";
import { VehicleImage } from "@/features/cars/components/vehicle-image";
import { CarViewerLoader } from "@/features/cars/detail/car-viewer-loader";
import { getCarDetailExperience } from "@/features/cars/detail/car-detail-data";

type CarDetailPageProps = {
  car: NordicCar;
};

export function PremiumCarDetailPage({ car }: CarDetailPageProps) {
  const experience = getCarDetailExperience(car);
  const similarVehicles = nordicCars
    .filter((candidate) => candidate.segment === car.segment && candidate.modelSlug !== car.modelSlug)
    .slice(0, 3);

  const specs = [
    { icon: BatteryCharging, label: "WLTP range", value: `${car.rangeWltpKm} km`, detail: "pending source verification" },
    { icon: Snowflake, label: "Winter range", value: `${car.winterRangeKm} km`, detail: "Nordic estimate" },
    { icon: Zap, label: "10-80% charging", value: `${car.chargingMinutes} min`, detail: `${car.fastChargingKw} kW peak` },
    { icon: Gauge, label: "0-100 km/h", value: `${car.accelerationSeconds.toFixed(1)} s`, detail: car.drivetrain },
    { icon: Truck, label: "Towing", value: `${car.towingKg} kg`, detail: "braked trailer" },
    { icon: Users, label: "Seats", value: `${car.seats}`, detail: "passengers" },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_42%,#ffffff_100%)] text-slate-950">
      <section className="relative overflow-hidden px-5 pb-12 pt-24">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-70", car.colorClass)} />
        <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent" />

        <div className="relative mx-auto max-w-7xl">
          <Button asChild className="mb-8 bg-white/72 text-slate-900 hover:bg-white" size="sm" variant="glass">
            <Link href={"/cars" as Route}>
              <ArrowLeft className="mr-2 size-4" />
              All cars
            </Link>
          </Button>

          <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.78fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{car.brand}</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-normal text-slate-950 md:text-7xl">
                {car.model}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{car.tagline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-slate-950 text-white hover:bg-slate-800" size="xl">
                  <Link href={`/compare?add=${car.brandSlug}-${car.modelSlug}` as Route}>Compare now</Link>
                </Button>
                <Button className="bg-white/72 text-slate-950 hover:bg-white" size="xl" type="button" variant="glass">
                  <BrainCircuit className="mr-2 size-4" />
                  Ask Nordic AI
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <HeroMetric label="From" value={formatNok(car.priceNok)} />
              <HeroMetric label="Monthly estimate" value={formatNok(car.monthlyNok)} />
              <HeroMetric label="Winter efficiency" value={`${getEfficiencyScore(car)} km/kWh`} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <CarViewerLoader config={experience.viewer} label={`${car.brand} ${car.model}`} />
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {specs.map((spec) => (
            <GlassCard className="bg-white/78 p-5 shadow-sm" key={spec.label}>
              <spec.icon className="size-5 text-slate-500" />
              <div className="mt-6 text-2xl font-semibold text-slate-950">{spec.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{spec.label}</div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{spec.detail}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <GlassCard className="bg-slate-950 p-7 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-white/48">
              <Sparkles className="size-4" />
              AI summary
            </div>
            <p className="mt-6 text-2xl font-semibold leading-9">{experience.aiSummary}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {car.highlights.map((highlight) => (
                <div className="rounded-md border border-white/10 bg-white/10 p-4 text-sm font-semibold" key={highlight}>
                  {highlight}
                </div>
              ))}
            </div>
          </GlassCard>

          <div>
            <SectionHeader eyebrow="Lineup" title="Variants" />
            <div className="mt-4 grid gap-3">
              {experience.variants.map((variant) => (
                <GlassCard
                  className="grid gap-4 bg-white/78 p-5 shadow-sm md:grid-cols-[1fr_auto_auto_auto]"
                  key={variant.name}
                >
                  <div>
                    <div className="text-lg font-semibold text-slate-950">{variant.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{variant.drivetrain}</div>
                  </div>
                  <VariantMetric label="Price" value={formatNok(variant.priceNok)} />
                  <VariantMetric label="Range" value={`${variant.rangeKm} km`} />
                  <VariantMetric label="0-100" value={`${variant.accelerationSeconds.toFixed(1)} s`} />
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Studio" title="Gallery" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {experience.gallery.map((item) => (
              <GlassCard className="overflow-hidden bg-white/78 shadow-sm" key={item.title}>
                <div className={cn("h-56 bg-gradient-to-br", item.gradient)} />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Video" title="Watch the drive" />
            <div className="mt-5 grid gap-4">
              {experience.videos.map((video) => (
                <GlassCard className="grid gap-4 bg-white/78 p-4 shadow-sm sm:grid-cols-[180px_1fr]" key={video.title}>
                  <div className="grid aspect-video place-items-center rounded-md bg-slate-950 text-white">
                    <Play className="size-8 fill-white" />
                  </div>
                  <div className="self-center">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      <Calendar className="size-4" />
                      {video.duration}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{video.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{video.description}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader eyebrow="Reviews" title="Independent reviews" />
            <p className="mt-5 text-sm leading-6 text-slate-600">
              No verified independent reviews are available for this configuration yet.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Alternative picks" title="Similar vehicles" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {similarVehicles.map((vehicle) => (
              <Link
                className="group block"
                href={`/cars/${vehicle.brandSlug}/${vehicle.modelSlug}` as Route}
                key={`${vehicle.brandSlug}-${vehicle.modelSlug}`}
              >
                <GlassCard className="overflow-hidden bg-white/78 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:bg-white">
                  <VehicleImage car={vehicle} className="h-36 rounded-none" />
                  <div className="p-5">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{vehicle.brand}</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{vehicle.model}</h3>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>{formatNok(vehicle.priceNok)}</span>
                      <span>{vehicle.rangeWltpKm} km</span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 pt-10">
        <div className="mx-auto max-w-7xl">
          <GlassCard className="relative overflow-hidden bg-slate-950 p-8 text-white shadow-sm md:p-12">
            <div className={cn("absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l opacity-30", car.colorClass)} />
            <div className="relative max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/48">Comparison studio</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Compare {car.model} against Norway's best EVs.</h2>
              <p className="mt-4 text-base leading-7 text-white/62">
                Benchmark price, winter range, charging speed, towing, and ownership practicality in one premium view.
              </p>
              <Button asChild className="mt-7 bg-white text-slate-950 hover:bg-white/88" size="xl">
                <Link href={`/compare?add=${car.brandSlug}-${car.modelSlug}` as Route}>Open comparison</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="bg-white/72 p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-950">{value}</div>
    </GlassCard>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">{title}</h2>
    </div>
  );
}

function VariantMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-slate-950">{value}</div>
    </div>
  );
}
