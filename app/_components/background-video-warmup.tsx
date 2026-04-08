"use client";

import { useEffect } from "react";

type BackgroundVideoWarmupProps = {
  sources: readonly string[];
};

export function BackgroundVideoWarmup({
  sources,
}: BackgroundVideoWarmupProps) {
  useEffect(() => {
    const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
    const videos: HTMLVideoElement[] = [];

    uniqueSources.forEach((src) => {
      const video = document.createElement("video");

      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("aria-hidden", "true");
      video.disablePictureInPicture = true;
      video.style.position = "absolute";
      video.style.width = "1px";
      video.style.height = "1px";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";

      const source = document.createElement("source");

      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
      document.body.appendChild(video);

      video.load();

      const playPromise = video.play();

      if (playPromise) {
        playPromise.catch(() => {
          // Browsers may defer autoplay, but the fetch is still warmed up.
        });
      }

      videos.push(video);
    });

    return () => {
      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
      });
    };
  }, [sources]);

  return null;
}
