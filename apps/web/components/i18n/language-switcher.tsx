"use client";

import { usePathname } from "next/navigation";

import { localeLabels, locales, localizePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ activeLocale }: { activeLocale: Locale }) {
  const pathname = usePathname();

  return (
    <div
      aria-label="Language"
      role="group"
      className="flex rounded-full border border-slate-950/10 bg-white/50 p-0.5 text-[11px] font-semibold backdrop-blur"
    >
      {locales.map((locale) => (
        <a
          aria-label={localeLabels[locale]}
          aria-current={locale === activeLocale ? "true" : undefined}
          lang={locale === "no" ? "nb" : "en"}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2.5 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
            locale === activeLocale
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-slate-950/5 hover:text-slate-950",
          )}
          href={localizePath(locale, pathname)}
          onClick={(event) => {
            // A document navigation refreshes the server-localized shared layout.
            event.currentTarget.href = `${localizePath(locale, window.location.pathname)}${window.location.search}${window.location.hash}`;
          }}
          key={locale}
        >
          {locale.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
