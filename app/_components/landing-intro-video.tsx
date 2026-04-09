"use client";

import { useState } from "react";

type LandingIntroVideoProps = {
  src: string;
  fallbackImage: string;
};

export function LandingIntroVideo({ src, fallbackImage }: LandingIntroVideoProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <div
        className={`home-entry-bg home-entry-bg-zoom absolute inset-0 transition-opacity duration-500 ${
          isReady && !hasError ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url('${fallbackImage}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`home-entry-bg home-entry-bg-zoom absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isReady && !hasError ? "opacity-100" : "opacity-0"
        }`}
        onCanPlay={() => {
          setIsReady(true);
        }}
        onLoadedData={() => {
          setIsReady(true);
        }}
        onError={() => {
          setHasError(true);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}

