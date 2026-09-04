import { cn } from "@/lib/utils";

export function AnimatedGradient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "luxury-light-bg pointer-events-none absolute inset-0 -z-20 bg-[length:180%_180%] opacity-95 animate-gradient-shift dark:bg-cinematic-radial",
        className,
      )}
    />
  );
}
