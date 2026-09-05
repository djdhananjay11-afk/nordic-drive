"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
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
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Loading 3D studio
          </p>
        </div>
      </GlassCard>
    ),
    ssr: false,
  },
);

const isThreeViewerEnabled = process.env.NEXT_PUBLIC_ENABLE_R3F_VIEWER === "true";

export function CarViewerLoader({ config, label }: { config: CarViewerConfig; label: string }) {
  if (!isThreeViewerEnabled) {
    return <CarViewerFallback config={config} label={label} />;
  }

  return (
    <CarViewerErrorBoundary config={config} label={label}>
      <Car3DViewer config={config} label={label} />
    </CarViewerErrorBoundary>
  );
}

type CarViewerErrorBoundaryProps = {
  children: ReactNode;
  config: CarViewerConfig;
  label: string;
};

type CarViewerErrorBoundaryState = {
  hasError: boolean;
};

class CarViewerErrorBoundary extends Component<
  CarViewerErrorBoundaryProps,
  CarViewerErrorBoundaryState
> {
  state: CarViewerErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): CarViewerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("3D viewer fallback activated", error, errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return <CarViewerFallback config={this.props.config} label={this.props.label} />;
    }

    return this.props.children;
  }
}

function CarViewerFallback({ config, label }: { config: CarViewerConfig; label: string }) {
  const accentColor = config.defaultColor;

  return (
    <div className="relative min-h-[680px] overflow-hidden rounded-lg border border-white/70 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98),rgba(226,232,240,0.72)_44%,rgba(203,213,225,0.55)_100%)] shadow-[0_36px_120px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.75)_48%,rgba(255,255,255,0)_72%)] opacity-50" />
      <div className="absolute left-1/2 top-16 h-72 w-[720px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

      <div className="absolute inset-x-6 top-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-md border border-white/70 bg-white/62 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-xl">
          <span className="block text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
            Studio preview
          </span>
          {label}
        </div>
        <div className="rounded-full border border-white/70 bg-white/62 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-xl">
          Studio render
        </div>
      </div>

      <div className="grid min-h-[680px] place-items-center px-6 py-24">
        <div className="relative w-full max-w-4xl">
          <div className="absolute left-1/2 top-1/2 h-36 w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400/18 blur-3xl" />
          <div
            className="relative mx-auto h-44 max-w-3xl rounded-[2.5rem] border border-white/70 shadow-[0_42px_120px_rgba(15,23,42,0.22)]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #ffffff 48%, #cbd5e1)`,
            }}
          >
            <div className="absolute left-[18%] top-[-32px] h-24 w-[42%] rounded-t-[4rem] border border-white/70 bg-white/45 backdrop-blur-md" />
            <div className="absolute bottom-[-32px] left-[15%] size-20 rounded-full border-[14px] border-slate-950 bg-slate-600 shadow-xl" />
            <div className="absolute bottom-[-32px] right-[15%] size-20 rounded-full border-[14px] border-slate-950 bg-slate-600 shadow-xl" />
            <div className="absolute right-6 top-1/2 h-8 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.9)]" />
            <div className="absolute left-6 top-1/2 h-8 w-3 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.75)]" />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Interactive 3D ready
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          This stable preview keeps the vehicle page fast and reliable. Enable
          NEXT_PUBLIC_ENABLE_R3F_VIEWER after aligning the React Three Fiber renderer with the
          current React version.
        </p>
      </div>
    </div>
  );
}
