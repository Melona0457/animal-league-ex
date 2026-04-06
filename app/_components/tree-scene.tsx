"use client";

import { ReactNode } from "react";
import { getTreeImage } from "../_lib/mock-data";
import type { PetalPlacement } from "../_lib/petal-state";
import { PetalOverlay } from "./petal-overlay";

type TreeSceneProps = {
  treeLevel: number;
  petals: PetalPlacement[];
  children?: ReactNode;
  className?: string;
};

export function TreeScene({
  treeLevel,
  petals,
  children,
  className = "",
}: TreeSceneProps) {
  return (
    <div className={`relative mx-auto aspect-[4/5] h-full max-w-full ${className}`}>
      <div
        className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
        style={{ backgroundImage: `url('${getTreeImage(treeLevel)}')` }}
      />
      <PetalOverlay petals={petals} className="z-10" />
      {children}
    </div>
  );
}
