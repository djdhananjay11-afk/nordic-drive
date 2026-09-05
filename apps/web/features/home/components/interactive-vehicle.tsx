"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { VehicleImage } from "@/features/cars/components/vehicle-image";
import type { NordicCar } from "@/features/cars/data/nordic-cars";
import { cn } from "@/lib/utils";

type PointerState = {
  x: number;
  y: number;
};

export function InteractiveVehicle({ car, className }: { car: NordicCar; className?: string }) {
  const [active, setActive] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), {
    stiffness: 160,
    damping: 22,
  });

  function updatePointer({ x, y }: PointerState) {
    pointerX.set(x);
    pointerY.set(y);
  }

  return (
    <div
      className={cn(
        "relative mx-auto h-[310px] w-full max-w-5xl touch-pan-y md:h-[430px]",
        className,
      )}
      onMouseLeave={() => {
        setActive(false);
        updatePointer({ x: 0, y: 0 });
      }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setActive(true);
        updatePointer({
          x: (event.clientX - bounds.left) / bounds.width - 0.5,
          y: (event.clientY - bounds.top) / bounds.height - 0.5,
        });
      }}
    >
      <div className="absolute inset-x-[4%] bottom-8 h-28 rounded-[50%] bg-slate-900/12 blur-3xl" />
      <motion.div
        className="absolute inset-x-[2%] bottom-14 h-52 [transform-style:preserve-3d] md:bottom-16 md:h-72"
        style={{ rotateX, rotateY }}
      >
        <div className="absolute inset-x-[8%] bottom-4 h-24 rounded-[50%] bg-slate-400/20 blur-2xl [transform:translateZ(-80px)]" />
        <VehicleImage
          car={car}
          className="absolute inset-x-0 bottom-4 h-48 rounded-[1.25rem] border border-white/70 bg-white/42 shadow-[0_48px_100px_rgba(15,23,42,0.20)] [transform:translateZ(42px)] md:h-64"
          imageClassName="object-contain p-5"
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
        />
      </motion.div>
      <motion.div
        animate={{ opacity: active ? 1 : 0.55 }}
        className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xl"
      >
        Move cursor to tilt preview
      </motion.div>
      <div className="absolute inset-x-4 bottom-0 mx-auto max-w-xl rounded-xl border border-white/70 bg-white/60 px-4 py-3 text-center shadow-sm backdrop-blur-xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Featured hero car
        </div>
        <div className="mt-1 text-lg font-semibold text-slate-950">
          {car.brand} {car.model}
        </div>
      </div>
    </div>
  );
}
