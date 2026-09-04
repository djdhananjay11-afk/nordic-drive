import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { localizePath, type Locale } from "@/lib/i18n/config";

type InformationalPageProps = {
  ctaLabel: string;
  ctaPath: string;
  description: string;
  eyebrow: string;
  locale: Locale;
  sections: Array<{
    body: string;
    title: string;
  }>;
  title: string;
};

export function InformationalPage({
  ctaLabel,
  ctaPath,
  description,
  eyebrow,
  locale,
  sections,
  title,
}: InformationalPageProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef3f7_55%,#ffffff_100%)] px-5 pb-24 pt-28 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
          <Button asChild className="mt-8 rounded-md bg-slate-950 text-white hover:bg-slate-800">
            <Link href={localizePath(locale, ctaPath) as Route}>
              {ctaLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <GlassCard className="bg-white/74 p-6 shadow-sm" key={section.title}>
              <CheckCircle2 className="size-5 text-slate-400" />
              <h2 className="mt-8 text-2xl font-semibold">{section.title}</h2>
              <p className="mt-4 leading-7 text-slate-600">{section.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </main>
  );
}
