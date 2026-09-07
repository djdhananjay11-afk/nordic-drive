import Link from "next/link";
import type { Route } from "next";
import { Menu, Search, UserRound } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { localizePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const items = [
  { href: "/cars", key: "cars" },
  { href: "/compare", key: "compare" },
  { href: "/ai", key: "ai" },
  { href: "/launches", key: "launches" },
  { href: "/ev-guide", key: "evGuide" },
  { href: "/about", key: "about" },
] as const;

export function PremiumNav({
  className,
  dictionary,
  locale,
}: {
  className?: string;
  dictionary: Dictionary["nav"];
  locale: Locale;
}) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-white/45 text-foreground backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex min-h-14 max-w-[1560px] flex-wrap items-center justify-between gap-2 px-5 py-1 md:px-8">
        <Link
          className="font-display text-lg font-semibold tracking-[0.18em]"
          href={localizePath(locale, "/") as Route}
        >
          NordicDrive
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-foreground/80 lg:flex">
          {items.map((item) => (
            <Link
              className="rounded-md px-2 py-1 transition hover:bg-foreground/5 hover:text-foreground"
              href={localizePath(locale, item.href) as Route}
              key={item.href}
            >
              {dictionary[item.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher activeLocale={locale} />
          <Button
            asChild
            aria-label={dictionary.search}
            title={dictionary.search}
            className="h-11 w-11 shrink-0 bg-transparent p-0"
            size="icon"
            variant="ghost"
          >
            <Link href={localizePath(locale, "/cars") as Route}>
              <Search aria-hidden="true" className="size-5" />
            </Link>
          </Button>
          <Button
            asChild
            aria-label={dictionary.signIn}
            title={dictionary.signIn}
            className="h-11 w-11 shrink-0 bg-transparent p-0"
            size="icon"
            variant="ghost"
          >
            <Link href="/admin">
              <UserRound aria-hidden="true" className="size-5" />
            </Link>
          </Button>
          <Button
            aria-label={dictionary.menu}
            className="bg-transparent lg:hidden"
            size="icon"
            variant="ghost"
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
