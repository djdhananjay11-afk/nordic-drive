import { ArrowRight, BatteryCharging, CarFront, Gauge, Snowflake } from "lucide-react";

import { AppShell, Section } from "@/components/design-system/app-shell";
import { HeroFramework } from "@/components/design-system/hero-framework";
import { ShowcaseModal } from "@/components/design-system/showcase-modal";
import { MotionItem, StaggeredReveal } from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  GlassCard,
} from "@/components/ui/card";
import { CarCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { designTokens } from "@/lib/theme/design-tokens";

const palette = [
  ["Cyan", "bg-neon-cyan", designTokens.color.neon.cyan],
  ["Green", "bg-neon-green", designTokens.color.neon.green],
  ["Violet", "bg-neon-violet", designTokens.color.neon.violet],
  ["Amber", "bg-neon-amber", designTokens.color.neon.amber],
];

const specs = [
  { icon: BatteryCharging, label: "Charging", value: "10-80% / 24 min" },
  { icon: Snowflake, label: "Winter estimate", value: "488 km" },
  { icon: Gauge, label: "Performance", value: "3.9 s" },
];

export default function DesignSystemPage() {
  return (
    <AppShell>
      <HeroFramework
        eyebrow="NordicDrive design system"
        title="Reusable luxury interface primitives."
        description="A dark, cinematic, glass-based system for premium automotive browsing, comparison, AI recommendations, admin workflows, and future 3D experiences."
      />

      <Section className="pt-0">
        <StaggeredReveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {palette.map(([name, className, value]) => (
            <MotionItem
              className="glass-panel rounded-lg p-5"
              key={name}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            >
              <div className={`h-24 rounded-md ${className} shadow-glow`} />
              <div className="mt-4 font-semibold">{name}</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">{value}</div>
            </MotionItem>
          ))}
        </StaggeredReveal>
      </Section>

      <Section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Controls</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Buttons, modal, and cards.</h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            The system uses crisp radii, strong focus states, luminous action affordances, and
            glass panels tuned for dark-mode contrast.
          </p>
        </div>
        <GlassCard className="grid gap-6 p-6">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="neon">Neon</Button>
            <Button variant="luxury">Luxury</Button>
            <Button size="icon" variant="secondary">
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <ShowcaseModal />
          <div className="grid gap-4 md:grid-cols-3">
            {specs.map((spec) => (
              <Card className="border-white/10 bg-white/[0.04]" key={spec.label}>
                <CardHeader>
                  <spec.icon className="size-5 text-primary" />
                  <CardTitle className="text-base">{spec.value}</CardTitle>
                  <CardDescription>{spec.label}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </GlassCard>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard className="overflow-hidden lg:col-span-2">
            <div className="aspect-[16/8] bg-gradient-to-br from-primary/30 via-white/[0.05] to-neon-violet/20 p-6">
              <div className="flex h-full items-end">
                <div>
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-muted-foreground">
                    <CarFront className="mr-2 size-3 text-primary" />
                    Hero media framework
                  </div>
                  <h3 className="mt-4 max-w-xl text-3xl font-semibold md:text-5xl">
                    Built for cinematic car detail pages.
                  </h3>
                </div>
              </div>
            </div>
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              {specs.map((spec) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4" key={spec.label}>
                  <spec.icon className="size-4 text-primary" />
                  <div className="mt-3 text-lg font-semibold">{spec.value}</div>
                  <div className="text-xs text-muted-foreground">{spec.label}</div>
                </div>
              ))}
            </CardContent>
          </GlassCard>
          <div className="grid gap-4">
            <CarCardSkeleton />
            <GlassCard className="p-5">
              <div className="text-sm font-semibold">Loading states</div>
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="mt-3 h-4 w-1/2" />
              <Skeleton className="mt-5 h-10 w-full" />
            </GlassCard>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}
