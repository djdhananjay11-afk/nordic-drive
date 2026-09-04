import type * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.08] before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

function CarCardSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-4">
      <Skeleton className="aspect-[16/10] w-full" />
      <Skeleton className="mt-5 h-5 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </div>
  );
}

export { CarCardSkeleton, Skeleton };
