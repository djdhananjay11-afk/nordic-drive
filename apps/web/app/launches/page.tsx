import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { GlassCard } from "@/components/ui/card";
import { formatNok, nordicLaunches } from "@/features/cars/data/nordic-cars";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  description:
    "Track future electric car launches for Norway with expected arrival windows, estimated pricing, and launch confidence.",
  path: "/launches",
  title: "Future Electric Car Launches in Norway",
});

export default function LaunchesPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f7_58%,#ffffff_100%)] px-5 pb-24 pt-24">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/55">
          Launches
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-normal md:text-7xl">
          The next wave of EVs.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-foreground/62">
          Track upcoming EV launches, expected Norwegian pricing, estimated arrival windows, and
          confidence signals.
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-5xl gap-4">
        {nordicLaunches.map((launch) => (
          <GlassCard
            className="grid gap-5 bg-white/72 p-6 shadow-sm md:grid-cols-[1fr_auto]"
            key={`${launch.brand}-${launch.model}`}
          >
            <div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <CalendarDays className="size-4" />
                {launch.expected}
              </div>
              <h2 className="mt-3 text-3xl font-semibold">
                {launch.brand} {launch.model}
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{launch.note}</p>
            </div>
            <div className="rounded-md bg-slate-900 p-5 text-white md:min-w-56">
              <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                Estimated from
              </div>
              <div className="mt-2 text-2xl font-semibold">{formatNok(launch.estimateNok)}</div>
              <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-center text-xs font-semibold">
                {launch.confidence}
              </div>
            </div>
          </GlassCard>
        ))}
      </section>
    </main>
  );
}
