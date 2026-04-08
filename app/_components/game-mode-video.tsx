"use client";

import { useEffect, useRef, useState } from "react";

type GameModeVideoProps = {
  src: string;
  title: string;
};

export function GameModeVideo({ src, title }: GameModeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.load();

    const playPromise = video.play();

    if (playPromise) {
      playPromise.catch(() => {
        // autoplay may be delayed by the browser until media is buffered enough
      });
    }
  }, [src]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.1rem] bg-stone-900/10">
      {!isReady ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
      ) : null}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-label={`${title} 미리보기 영상`}
        className={`relative h-full w-full object-cover transition-opacity duration-200 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        onLoadedData={() => setIsReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
