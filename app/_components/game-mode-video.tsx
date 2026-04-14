"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isConstrainedMediaDevice } from "../_lib/media-mode";

type GameModeVideoProps = {
  src: string;
  title: string;
  poster?: string;
};

export function GameModeVideo({ src, title, poster }: GameModeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldRenderVideo(!isConstrainedMediaDevice());
  }, []);

  useEffect(() => {
    if (!shouldRenderVideo) {
      return;
    }

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
  }, [src, shouldRenderVideo]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.1rem] bg-stone-900/10">
      {!shouldRenderVideo && poster ? (
        <Image
          src={poster}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 50vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {!shouldRenderVideo && !poster ? (
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
      ) : null}
      {shouldRenderVideo && (!isReady || hasError) ? (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
      ) : null}
      {shouldRenderVideo && hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 px-4 text-center text-sm font-medium text-stone-700">
          영상 대신 텍스트 프리뷰로 표시 중
        </div>
      ) : null}
      {shouldRenderVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          aria-label={`${title} 미리보기 영상`}
          className={`relative h-full w-full object-cover transition-opacity duration-200 ${
            isReady && !hasError ? "opacity-100" : "opacity-0"
          }`}
          onLoadStart={() => {
            setIsReady(false);
            setHasError(false);
          }}
          onCanPlay={() => setIsReady(true)}
          onLoadedData={() => setIsReady(true)}
          onError={() => {
            setHasError(true);
            setIsReady(false);
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
