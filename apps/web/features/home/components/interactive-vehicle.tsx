"use client";

import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

type PointerState = {
  x: number;
  y: number;
};

export function InteractiveVehicle({ className }: { className?: string }) {
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
      className={cn("relative mx-auto h-[310px] w-full max-w-5xl touch-pan-y md:h-[430px]", className)}
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
        className="absolute inset-x-[4%] bottom-16 h-48 [transform-style:preserve-3d] md:bottom-20 md:h-64"
        style={{ rotateX, rotateY }}
      >
        <div className="absolute inset-x-[8%] bottom-14 h-20 rounded-[48%] bg-slate-400/20 blur-2xl [transform:translateZ(-80px)]" />
        <div className="absolute inset-x-[7%] bottom-16 h-20 rounded-t-[120px] border border-white/70 bg-gradient-to-r from-slate-200 via-white to-slate-100 shadow-[0_48px_100px_rgba(15,23,42,0.20)] [transform:translateZ(30px)] md:h-28" />
        <div className="absolute left-[27%] right-[29%] bottom-[128px] h-20 rounded-t-[140px] border border-white/80 bg-gradient-to-r from-slate-50 via-white to-sky-100 [transform:translateZ(48px)] md:bottom-[162px] md:h-28" />
        <div className="absolute left-[35%] right-[51%] bottom-[148px] h-10 rounded-t-[80px] bg-slate-950/12 backdrop-blur [transform:translateZ(60px)] md:bottom-[190px] md:h-14" />
        <div className="absolute left-[50%] right-[34%] bottom-[148px] h-10 rounded-t-[80px] bg-slate-950/12 backdrop-blur [transform:translateZ(60px)] md:bottom-[190px] md:h-14" />
        <div className="absolute inset-x-[12%] bottom-[70px] h-4 rounded-full bg-gradient-to-r from-slate-500 via-white to-slate-500 [transform:translateZ(64px)] md:bottom-[86px]" />
        <div className="absolute bottom-8 left-[17%] size-20 rounded-full border-[12px] border-slate-950 bg-slate-200 shadow-xl [transform:translateZ(72px)] md:size-28 md:border-[17px]" />
        <div className="absolute bottom-8 right-[17%] size-20 rounded-full border-[12px] border-slate-950 bg-slate-200 shadow-xl [transform:translateZ(72px)] md:size-28 md:border-[17px]" />
        <div className="absolute left-[10%] bottom-[92px] h-3 w-20 rounded-full bg-cyan-300/80 shadow-glow [transform:translateZ(90px)] md:bottom-[122px]" />
        <div className="absolute right-[10%] bottom-[92px] h-3 w-14 rounded-full bg-rose-300/70 [transform:translateZ(90px)] md:bottom-[122px]" />
      </motion.div>
      <motion.div
        animate={{ opacity: active ? 1 : 0.55 }}
        className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xl"
      >
        Drag your cursor to inspect
      </motion.div>
    </div>
  );
}
