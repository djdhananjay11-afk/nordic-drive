import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/cars", label: "Cars" },
  { href: "/compare", label: "Compare" },
  { href: "/ai", label: "AI advisor" },
  { href: "/launches", label: "Launches" },
  { href: "/ev-guide", label: "EV guide" },
] as const;

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link className="text-lg font-semibold tracking-normal" href="/">
          NordicDrive
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link className="transition hover:text-foreground" href={item.href as Route} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" variant="secondary">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </header>
  );
}
