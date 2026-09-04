import { ArrowRight, BatteryCharging, Gauge, Snowflake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { MotionItem, StaggeredReveal } from "@/components/motion/motion-primitives";
import { cn } from "@/lib/utils";

const metrics = [
  { icon: BatteryCharging, label: "WLTP + winter range", value: "642 km" },
  { icon: Gauge, label: "0-100 km/h", value: "3.8 s" },
  { icon: Snowflake, label: "Nordic readiness", value: "Heat pump" },
];

export function HeroFramework({
  eyebrow = "Futuristic Scandinavian luxury",
  title = "Designed for the next era of electric mobility.",
  description = "A cinematic, data-dense framework for premium car discovery, comparison, and EV ownership decisions in Norway.",
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("container grid min-h-[calc(100vh-64px)] items-center gap-12 py-14 lg:grid-cols-[1fr_0.86fr]", className)}>
      <StaggeredReveal className="max-w-4xl">
        <MotionItem variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        </MotionItem>
        <MotionItem variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>
          <h1 className="mt-5 max-w-5xl font-display text-5xl font-semibold leading-[0.95] tracking-normal cinematic-text md:text-7xl lg:text-8xl">
            {title}
          </h1>
        </MotionItem>
        <MotionItem variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>
          <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">{description}</p>
        </MotionItem>
        <MotionItem className="mt-9 flex flex-wrap gap-3" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>
          <Button size="xl">
            Compare EVs
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button size="xl" variant="glass">
            View launches
          </Button>
        </MotionItem>
      </StaggeredReveal>
      <GlassCard className="relative overflow-hidden p-4">
        <div className="absolute inset-x-10 top-8 h-24 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative aspect-[4/3] rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.16] via-white/5 to-transparent p-5">
          <div className="absolute inset-x-8 bottom-16 h-1 rounded-full bg-primary/70 shadow-glow" />
          <div className="absolute bottom-20 left-8 right-8 h-24 rounded-[50%] border border-white/20 bg-black/20 blur-sm" />
          <div className="absolute bottom-24 left-10 right-10 h-20 rounded-t-[90px] border border-white/20 bg-gradient-to-r from-white/[0.24] via-white/[0.08] to-white/20 backdrop-blur" />
          <div className="absolute bottom-20 left-16 size-14 rounded-full border border-primary/30 bg-background shadow-glow" />
          <div className="absolute bottom-20 right-16 size-14 rounded-full border border-primary/30 bg-background shadow-glow" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4" key={metric.label}>
              <metric.icon className="size-4 text-primary" />
              <div className="mt-4 text-xl font-semibold">{metric.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
