"use client";

import { useEffect } from "react";

type BackgroundImageWarmupProps = {
  sources: readonly string[];
};

export function BackgroundImageWarmup({
  sources,
}: BackgroundImageWarmupProps) {
  useEffect(() => {
    const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
    const warmedImages: HTMLImageElement[] = [];
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const warmup = () => {
      uniqueSources.forEach((src) => {
        const image = new window.Image();

        image.decoding = "async";
        image.src = src;
        warmedImages.push(image);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          warmup();
        },
        { timeout: 1500 },
      );
    } else {
      timeoutId = window.setTimeout(() => {
        warmup();
      }, 500);
    }

    return () => {
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      warmedImages.forEach((image) => {
        image.src = "";
      });
    };
  }, [sources]);

  return null;
}
