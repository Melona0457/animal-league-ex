"use client";

import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

type HomeEntryClientProps = {
  children: React.ReactNode;
};

const TRANSITION_DELAY_MS = 1100;

export function HomeEntryClient({ children }: HomeEntryClientProps) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleEnter() {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    timeoutRef.current = window.setTimeout(() => {
      router.push("/select-school");
    }, TRANSITION_DELAY_MS);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleEnter();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleEnter}
      onKeyDown={handleKeyDown}
      className={`home-entry-scene group relative z-10 flex min-h-screen w-full flex-col items-center justify-between text-left ${
        isTransitioning ? "home-entry-scene-active" : ""
      } ${
        isTransitioning ? "pointer-events-none" : ""
      }`}
    >
      <div
        className={`home-entry-overlay ${isTransitioning ? "home-entry-overlay-active" : ""}`}
        aria-hidden="true"
      />
      <div
        className={`home-entry-transition-curtain ${
          isTransitioning ? "home-entry-transition-curtain-active" : ""
        }`}
        aria-hidden="true"
      />
      <div className="home-entry-shell">
        {children}
      </div>
    </div>
  );
}
