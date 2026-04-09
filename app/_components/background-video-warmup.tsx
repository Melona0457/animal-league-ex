"use client";

import { useEffect } from "react";

type VideoWarmupGroup = {
  sources: readonly string[];
  preload?: "metadata" | "auto";
  delayMs?: number;
};

type BackgroundVideoWarmupProps = {
  sources?: readonly string[];
  preload?: "metadata" | "auto";
  groups?: readonly VideoWarmupGroup[];
};

export function BackgroundVideoWarmup({
  sources = [],
  preload = "metadata",
  groups,
}: BackgroundVideoWarmupProps) {
  useEffect(() => {
    const videos: HTMLVideoElement[] = [];
    const timeoutIds: number[] = [];
    const seenSources = new Set<string>();

    const normalizedGroups =
      groups && groups.length > 0
        ? groups
        : [{ sources, preload, delayMs: 700 satisfies number | undefined }];

    const warmupGroup = ({
      sources: groupSources,
      preload: groupPreload = preload,
    }: VideoWarmupGroup) => {
      groupSources.forEach((src) => {
        if (!src || seenSources.has(src)) {
          return;
        }

        seenSources.add(src);

        const video = document.createElement("video");
        const source = document.createElement("source");

        video.preload = groupPreload;
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

    normalizedGroups.forEach((group) => {
      const delayMs = group.delayMs ?? 0;
      const timeoutId = window.setTimeout(() => {
        warmupGroup(group);
      }, delayMs);

      timeoutIds.push(timeoutId);
    });

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));

      videos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.remove();
      });
    };
  }, [groups, preload, sources]);

  return null;
}
