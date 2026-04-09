"use client";

import dynamic from "next/dynamic";

type LandingIntroVideoProps = {
  src: string;
  fallbackImage: string;
};

const LandingIntroVideo = dynamic(
  () => import("./landing-intro-video").then((module) => module.LandingIntroVideo),
  { ssr: false },
);

export function LandingIntroVideoNoSsr(props: LandingIntroVideoProps) {
  return <LandingIntroVideo {...props} />;
}
