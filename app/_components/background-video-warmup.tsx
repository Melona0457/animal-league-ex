"use client";

import { useEffect } from "react";

type BackgroundVideoWarmupProps = {
  sources: readonly string[];
  preload?: "metadata" | "auto";
};

export function BackgroundVideoWarmup({
  sources,
  preload = "metadata",
}: BackgroundVideoWarmupProps) {
  useEffect(() => {
    const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
    const videos: HTMLVideoElement[] = [];
    let timeoutId: number | null = null;

    const warmup = () => {
      uniqueSources.forEach((src) => {
        const video = document.createElement("video");
        const source = document.createElement("source");

        video.preload = preload;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("aria-hidden", "true");
        video.disablePictureInPicture = true;
        video.style.position = "absolute";
        video.style.width = "1px";
        video.style.height = "1px";
        video.style.opacity = "0";
        video.style.pointerEvents = "none";
        video.style.left = "-9999px";
        video.style.top = "-9999px";

        source.src = src;
        source.type = "video/mp4";
        video.appendChild(source);
        document.body.appendChild(video);
        video.load();
        videos.push(video);
      });
    };

    timeoutId = window.setTimeout(() => {
      warmup();
    }, 700);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
      });
    };
  }, [preload, sources]);

  return null;
}
