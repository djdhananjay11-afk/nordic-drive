"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Menu, Search, UserRound } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-foreground backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex min-h-14 max-w-[1560px] items-center justify-between gap-2 px-3 py-1 sm:px-5 md:px-8">
        <Link
          className="shrink-0 font-display text-base font-semibold tracking-normal sm:text-lg"
          href={localizePath(locale, "/") as Route}
        >
          NordicDrive
        </Link>
        <nav className="hidden items-center gap-3 text-sm font-semibold text-foreground/80 xl:flex">
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
            className="hidden h-11 w-11 shrink-0 bg-transparent p-0 sm:inline-flex"
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
            className="hidden h-11 w-11 shrink-0 bg-transparent p-0 sm:inline-flex"
            size="icon"
            variant="ghost"
          >
            <Link href="/admin">
              <UserRound aria-hidden="true" className="size-5" />
            </Link>
          </Button>
          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger asChild>
              <Button
                aria-label={dictionary.menu}
                className="h-11 w-11 bg-transparent p-0 xl:hidden"
                size="icon"
                variant="ghost"
              >
                <Menu className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="max-h-[85dvh] overflow-y-auto bg-white text-slate-950"
            >
              <DialogTitle>{dictionary.menu}</DialogTitle>
              <nav aria-label={dictionary.menu} className="grid gap-1">
                {items.map((item) => {
                  const href = localizePath(locale, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={href as Route}
                      aria-current={pathname === href ? "page" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center rounded-md px-3 font-medium hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 aria-[current=page]:bg-slate-100"
                    >
                      {dictionary[item.key]}
                    </Link>
                  );
                })}
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center border-t border-slate-200 px-3 font-medium"
                >
                  {dictionary.signIn}
                </Link>
              </nav>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <nav
        aria-label={dictionary.menu}
        className="grid grid-cols-3 border-t border-slate-100 px-3 xl:hidden"
      >
        {items.slice(0, 3).map((item) => {
          const href = localizePath(locale, item.href);
          return (
            <Link
              key={item.href}
              href={href as Route}
              aria-current={pathname === href ? "page" : undefined}
              className="flex min-h-12 items-center justify-center border-b-2 border-transparent px-2 py-2 text-center text-sm font-semibold leading-5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 aria-[current=page]:border-slate-950"
            >
              {dictionary[item.key]}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
