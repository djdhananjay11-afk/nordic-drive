"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  size: 2 + (index % 4),
  delay: (index % 6) * 0.35,
  duration: 5 + (index % 5),
}));

export function FloatingParticles({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {particles.map((particle) => (
        <motion.span
          className="absolute rounded-full bg-primary/40 shadow-glow"
          initial={{ opacity: 0.12, y: 0 }}
          animate={{ opacity: [0.12, 0.8, 0.12], y: [-8, -28, -8] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          key={particle.id}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
}
