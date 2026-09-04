import type { Metadata } from "next";
import { BatteryCharging, Gauge, Snowflake, WalletCards } from "lucide-react";

import { GlassCard } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = createPageMetadata({
  description:
    "Learn how to evaluate electric cars for Norwegian winters, charging speed, battery health, performance, towing, and ownership cost.",
  path: "/ev-guide",
  title: "Norway EV Buying Guide",
});

const guideItems = [
  {
    icon: Snowflake,
    title: "Winter range",
    body: "Expect a meaningful drop in cold weather. NordicDrive separates WLTP from winter estimates so the buying decision is grounded in real use.",
  },
  {
    icon: BatteryCharging,
    title: "Charging curve",
    body: "Peak kW is only part of the story. Charge time from 10-80% is usually the better comparison metric.",
  },
  {
    icon: Gauge,
    title: "Performance",
    body: "Acceleration, drivetrain, battery size, and towing capacity should be compared together, not as isolated numbers.",
  },
  {
    icon: WalletCards,
    title: "Ownership cost",
    body: "Norwegian EV ownership depends on price, financing, charging habits, tires, insurance, and winter efficiency.",
  },
];

export default function EvGuidePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f7_58%,#ffffff_100%)] px-5 pb-24 pt-24">
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-foreground/55">
          EV Guide
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-normal md:text-7xl">
          Confidence for Nordic driving.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-foreground/62">
          Understand winter range, charging speeds, heat pumps, battery health, and ownership costs
          before you buy.
        </p>
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-2">
        {guideItems.map((item) => (
          <GlassCard className="bg-white/72 p-7 shadow-sm" key={item.title}>
            <div className="grid size-11 place-items-center rounded-md bg-slate-900 text-white">
              <item.icon className="size-5" />
            </div>
            <h2 className="mt-8 text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
          </GlassCard>
        ))}
      </section>
    </main>
  );
}
