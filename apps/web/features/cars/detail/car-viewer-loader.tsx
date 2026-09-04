"use client";

import dynamic from "next/dynamic";

import { GlassCard } from "@/components/ui/card";
import type { CarViewerConfig } from "@/features/cars/three/car-3d-viewer";

const Car3DViewer = dynamic(
  () => import("@/features/cars/three/car-3d-viewer").then((module) => module.Car3DViewer),
  {
    loading: () => (
      <GlassCard className="grid min-h-[680px] place-items-center bg-white/72 p-6 text-center shadow-sm">
        <div>
          <div className="mx-auto size-12 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Loading 3D studio</p>
        </div>
      </GlassCard>
    ),
    ssr: false,
  },
);

export function CarViewerLoader({ config, label }: { config: CarViewerConfig; label: string }) {
  return <Car3DViewer config={config} label={label} />;
}
