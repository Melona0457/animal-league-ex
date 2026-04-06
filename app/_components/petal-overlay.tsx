"use client";

import { type CSSProperties } from "react";
import type { PetalPlacement } from "../_lib/petal-state";

type PetalOverlayProps = {
  petals: PetalPlacement[];
  className?: string;
};

export function PetalOverlay({ petals, className = "" }: PetalOverlayProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat"
          style={
            {
              left: `${petal.xPercent}%`,
              top: `${petal.yPercent}%`,
              transform: `translate(-50%, -50%) rotate(${petal.rotation}deg) scale(${petal.scale})`,
              backgroundImage: "url('/images/petals/petal.png')",
            } as CSSProperties
          }
        >
          <span className="flex h-full w-full items-center justify-center text-lg text-rose-100/90">
            🌸
          </span>
        </div>
      ))}
    </div>
  );
}
