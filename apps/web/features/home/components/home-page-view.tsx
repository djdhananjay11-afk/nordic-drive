"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  BatteryCharging,
  Bot,
  BrainCircuit,
  CalendarDays,
  Gauge,
  Newspaper,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { FloatingParticles } from "@/components/design-system/floating-particles";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNok, type NordicCar, type NordicLaunch } from "@/features/cars/data/nordic-cars";
import { VehicleImage } from "@/features/cars/components/vehicle-image";
import type { HomeArticle, HomeComparison } from "@/features/home/data/home-data";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { HomeDictionary } from "@/lib/i18n/dictionaries";
import { HomeSearch } from "./home-search";
import { InteractiveVehicle } from "./interactive-vehicle";

type HomePageViewProps = {
  copy: HomeDictionary;
  featuredCars: NordicCar[];
  launches: NordicLaunch[];
  trendingComparisons: HomeComparison[];
  brands: Array<{ name: string; slug: string; count: number }>;
  articles: HomeArticle[];
  locale: Locale;
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function HomePageView({
  copy,
  featuredCars,
  launches,
  trendingComparisons,
  brands,
  articles,
  locale,
}: HomePageViewProps) {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.38]);

  return (
    <main className="overflow-hidden bg-[#f6f8fb] text-slate-950">
      <section className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-5 pb-8 pt-24 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7f9fc_0%,#e8f1f8_52%,#f9fafb_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[52vh] bg-[radial-gradient(circle_at_50%_0%,rgba(118,176,214,0.42),transparent_62%)]" />
        <FloatingParticles className="z-0 opacity-55" />
        <motion.div
          className="relative z-10 mx-auto max-w-6xl"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.7 }}
          >
            {copy.hero.eyebrow}
          </motion.p>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-5xl text-5xl font-semibold leading-[0.96] tracking-normal md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 24 }}
            transition={{ delay: 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {copy.hero.title}
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-600 md:text-xl"
            initial={{ opacity: 0, y: 24 }}
            transition={{ delay: 0.18, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {copy.hero.description}
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 24 }}
            transition={{ delay: 0.28, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              asChild
              className="flex-1 rounded-md bg-slate-950 text-white hover:bg-slate-800"
              size="lg"
            >
              <Link href={localizePath(locale, "/cars") as Route}>{copy.cta.explore}</Link>
            </Button>
            <Button
              asChild
              className="flex-1 rounded-md bg-white/80 text-slate-950 hover:bg-white"
              size="lg"
              variant="glass"
            >
              <Link href={localizePath(locale, "/compare") as Route}>{copy.cta.compare}</Link>
            </Button>
          </motion.div>
        </motion.div>

        <div className="relative z-10 w-full">
          <InteractiveVehicle className="mt-6" />
          <HomeSearch cars={featuredCars} copy={copy.search} locale={locale} />
          <div className="mx-auto mt-4 flex max-w-4xl flex-col items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur md:flex-row md:gap-4">
            <span>{copy.trust.disclaimer}</span>
            <Link
              className="inline-flex items-center text-slate-950 transition hover:text-slate-600"
              href={localizePath(locale, "/disclaimer") as Route}
            >
              {copy.trust.learnMore}
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
            <Link
              className="inline-flex items-center text-slate-950 transition hover:text-slate-600"
              href={localizePath(locale, "/advertise") as Route}
            >
              {copy.trust.advertise}
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <HomeSection
        eyebrow={copy.featured.eyebrow}
        title={copy.featured.title}
        description={copy.featured.description}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredCars.map((car, index) => (
            <MotionCard delay={index * 0.05} key={`${car.brandSlug}-${car.modelSlug}`}>
              <Link href={localizePath(locale, `/cars/${car.brandSlug}/${car.modelSlug}`) as Route}>
                <GlassCard className="group h-full overflow-hidden bg-white/72 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <VehicleImage car={car} className="h-48" priority={index === 0} />
                  <div className="p-2 pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{car.brand}</p>
                        <h3 className="mt-1 text-2xl font-semibold">{car.model}</h3>
                      </div>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {car.segment}
                      </span>
                    </div>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{car.tagline}</p>
                    <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                      <Metric
                        icon={BatteryCharging}
                        label={copy.metrics.wltp}
                        value={`${car.rangeWltpKm} km`}
                      />
                      <Metric
                        icon={Zap}
                        label={copy.metrics.charging}
                        value={`${car.chargingMinutes}m`}
                      />
                      <Metric
                        icon={Gauge}
                        label={copy.metrics.from}
                        value={formatNok(car.priceNok).replace("kr", "")}
                      />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </MotionCard>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        dark
        eyebrow={copy.launches.eyebrow}
        title={copy.launches.title}
        description={copy.launches.description}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {launches.map((launch, index) => (
            <MotionCard delay={index * 0.06} key={`${launch.brand}-${launch.model}`}>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] p-6 text-white backdrop-blur-xl">
                <CalendarDays className="size-5 text-white/50" />
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                  {launch.expected}
                </p>
                <h3 className="mt-3 text-3xl font-semibold">
                  {launch.brand} {launch.model}
                </h3>
                <p className="mt-4 leading-7 text-white/60">{launch.note}</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm text-white/50">{copy.launches.estimatedFrom}</span>
                  <span className="font-semibold">{formatNok(launch.estimateNok)}</span>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow={copy.comparisons.eyebrow}
        title={copy.comparisons.title}
        description={copy.comparisons.description}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {trendingComparisons.map((comparison, index) => (
            <MotionCard delay={index * 0.05} key={comparison.slug}>
              <GlassCard className="h-full bg-white/74 p-6 shadow-sm">
                <BrainCircuit className="size-5 text-slate-400" />
                <h3 className="mt-8 text-2xl font-semibold">{comparison.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{comparison.signal}</p>
                <div className="mt-6 grid gap-2">
                  {comparison.cars.map((car) => (
                    <div
                      className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium"
                      key={car}
                    >
                      {car}
                    </div>
                  ))}
                </div>
                <Link
                  className="mt-6 inline-flex items-center text-sm font-semibold text-slate-950"
                  href={localizePath(locale, "/compare") as Route}
                >
                  {copy.comparisons.open}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </GlassCard>
            </MotionCard>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow={copy.brands.eyebrow}
        title={copy.brands.title}
        description={copy.brands.description}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand, index) => (
            <MotionCard delay={index * 0.025} key={brand.slug}>
              <div className="grid h-32 place-items-center rounded-lg border border-slate-200 bg-white/74 p-4 text-center shadow-sm backdrop-blur">
                <div>
                  <div className="text-xl font-semibold">{brand.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {brand.count} {copy.brands.models}
                  </div>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow={copy.articles.eyebrow}
        title={copy.articles.title}
        description={copy.articles.description}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article, index) => (
            <MotionCard delay={index * 0.06} key={article.slug}>
              <GlassCard className="h-full bg-white/74 p-6 shadow-sm">
                <Newspaper className="size-5 text-slate-400" />
                <div className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {article.category} / {article.readTime}
                </div>
                <h3 className="mt-3 text-2xl font-semibold">{article.title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{article.excerpt}</p>
              </GlassCard>
            </MotionCard>
          ))}
        </div>
      </HomeSection>

      <section className="relative overflow-hidden bg-slate-950 px-5 py-28 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.24),transparent_55%)]" />
        <FloatingParticles className="opacity-30" />
        <motion.div
          className="relative mx-auto max-w-4xl"
          initial="hidden"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          viewport={{ once: true, margin: "-120px" }}
          whileInView="visible"
        >
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-white text-slate-950">
            <Bot className="size-6" />
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-white/50">
            {copy.ai.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            {copy.ai.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/62">{copy.ai.description}</p>
          <Button
            asChild
            className="mt-9 rounded-md bg-white text-slate-950 hover:bg-white/90"
            size="xl"
          >
            <Link href={localizePath(locale, "/compare") as Route}>
              {copy.ai.button}
              <Sparkles className="ml-2 size-4" />
            </Link>
          </Button>
        </motion.div>
      </section>
    </main>
  );
}

function HomeSection({
  children,
  dark = false,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  dark?: boolean;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className={dark ? "bg-slate-950 px-5 py-28 text-white" : "px-5 py-28"}>
      <motion.div
        className="mx-auto max-w-7xl"
        initial="hidden"
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        variants={fadeUp}
        viewport={{ once: true, margin: "-120px" }}
        whileInView="visible"
      >
        <div className="mb-14 max-w-3xl">
          <p
            className={
              dark
                ? "text-sm font-semibold uppercase tracking-[0.22em] text-white/45"
                : "text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"
            }
          >
            {eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">{title}</h2>
          <p
            className={
              dark
                ? "mt-5 max-w-2xl leading-8 text-white/62"
                : "mt-5 max-w-2xl leading-8 text-slate-600"
            }
          >
            {description}
          </p>
        </div>
        {children}
      </motion.div>
    </section>
  );
}

function MotionCard({
  children,
  delay = 0,
}: Readonly<{
  children: ReactNode;
  delay?: number;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <Icon className="size-4 text-slate-400" />
      <div className="mt-2 truncate text-sm font-semibold">{value}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
