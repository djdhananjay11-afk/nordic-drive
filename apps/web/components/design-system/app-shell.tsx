import type * as React from "react";

import { cn } from "@/lib/utils";

import { AnimatedGradient } from "./animated-gradient";
import { FloatingParticles } from "./floating-particles";

export function AppShell({
  children,
  className,
  withAtmosphere = true,
}: Readonly<{ children: React.ReactNode; className?: string; withAtmosphere?: boolean }>) {
  return (
    <main className={cn("relative min-h-screen overflow-hidden", className)}>
      {withAtmosphere ? (
        <>
          <AnimatedGradient />
          <FloatingParticles />
        </>
      ) : null}
      {children}
    </main>
  );
}

export function Section({
  children,
  className,
  bleed = false,
}: Readonly<{ children: React.ReactNode; className?: string; bleed?: boolean }>) {
  return (
    <section className={cn(bleed ? "w-full" : "container", "py-16 md:py-24", className)}>
      {children}
    </section>
  );
}
