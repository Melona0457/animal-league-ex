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
};

export function TreeScene({
  treeLevel,
  petals,
  children,
  className = "",
  fillContainer = false,
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
          fillContainer ? "bg-contain bg-center" : "bg-contain bg-bottom"
        }`}
        style={{ backgroundImage: `url('${getTreeImage(treeLevel)}')` }}
      />
      <PetalOverlay petals={petals} className={fillContainer ? "z-10" : "z-10"} />
      {children}
    </div>
  );
}
