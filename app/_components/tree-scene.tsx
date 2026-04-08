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
  fillContainer?: boolean;
  backgroundMode?: "contain" | "cover";
  showPetals?: boolean;
};

export function TreeScene({
  treeLevel,
  petals,
  children,
  className = "",
  fillContainer = false,
  backgroundMode = "contain",
  showPetals = true,
}: TreeSceneProps) {
  return (
    <div
      className={
        fillContainer
          ? `relative h-full w-full ${className}`
          : `relative mx-auto aspect-[4/5] h-full max-w-full ${className}`
      }
    >
      <div
        className={`absolute inset-0 bg-no-repeat ${
          fillContainer
            ? backgroundMode === "cover"
              ? "bg-cover bg-center"
              : "bg-contain bg-center"
            : "bg-contain bg-bottom"
        }`}
        style={{ backgroundImage: `url('${getTreeImage(treeLevel)}')` }}
      />
      {showPetals ? <PetalOverlay petals={petals} className="z-10" /> : null}
      {children}
    </div>
  );
}
