"use client";

import { useState } from "react";

type LandingIntroVideoProps = {
  src: string;
  fallbackImage: string;
};

export function LandingIntroVideo({ src, fallbackImage }: LandingIntroVideoProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFallbackLoaded, setIsFallbackLoaded] = useState(false);

  return (
    <>
      <div
        className="home-entry-bg home-entry-bg-zoom absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 24% 18%, rgba(255, 208, 226, 0.32), rgba(255, 208, 226, 0) 32%), linear-gradient(180deg, #7fb6e9 0%, #9fd2f7 42%, #d8e8f8 100%)",
        }}
      />
      <img
        src={fallbackImage}
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        className={`home-entry-bg home-entry-bg-zoom absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isReady && !hasError ? "opacity-0" : isFallbackLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIsFallbackLoaded(true);
        }}
        onError={() => {
          setIsFallbackLoaded(false);
        }}
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={fallbackImage}
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
