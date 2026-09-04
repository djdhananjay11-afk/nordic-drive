"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { localeLabels, locales, localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ activeLocale }: { activeLocale: Locale }) {
  const pathname = usePathname();

  return (
    <div
      aria-label="Language"
      className="flex rounded-full border border-slate-950/10 bg-white/50 p-0.5 text-[11px] font-semibold backdrop-blur"
    >
      {locales.map((locale) => (
        <Link
          aria-label={localeLabels[locale]}
          className={cn(
            "rounded-full px-2.5 py-1 transition",
            locale === activeLocale
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-slate-950/5 hover:text-slate-950",
          )}
          href={localizePath(locale, pathname) as Route}
          key={locale}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
