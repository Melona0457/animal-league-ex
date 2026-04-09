import { BackgroundImageWarmup } from "./_components/background-image-warmup";
import { BackgroundVideoWarmup } from "./_components/background-video-warmup";
import { LandingIntroVideo } from "./_components/landing-intro-video";
import { getLandingBackgroundImage } from "./_lib/mock-data";
import { GAME_MODE_VIDEOS, MAIN_TREE_VIDEOS } from "./_lib/video-assets";
import { HomeEntryClient } from "./home-entry-client";

export default function Home() {
  const landingBackgroundImage = getLandingBackgroundImage();

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-900 text-white">
      <HomeEntryClient>
        <BackgroundVideoWarmup
          groups={[
            { sources: MAIN_TREE_VIDEOS, preload: "metadata", delayMs: 300 },
            { sources: GAME_MODE_VIDEOS, preload: "metadata", delayMs: 1200 },
            { sources: ["/videos/intro.mp4"], preload: "metadata", delayMs: 1800 },
          ]}
        />
        <BackgroundImageWarmup
          sources={[
            landingBackgroundImage,
            "/images/backgrounds/main-background.png",
            "/images/game/prototype1/background/sky.png",
            "/images/game/prototype1/background/upper-green.png",
            "/images/game/prototype1/background/lower-green.png",
          ]}
        />
        <LandingIntroVideo
          src="/videos/intro.mp4"
          fallbackImage={landingBackgroundImage}
        />
        <div
          className="home-entry-bg-overlay home-entry-bg-zoom absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(33, 17, 25, 0.38), rgba(33, 17, 25, 0.74)), url('${landingBackgroundImage}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />

        <div className="home-entry-shell-content relative z-10 flex min-h-screen w-full flex-col items-center justify-between px-5 py-8 sm:px-8">
          <div className="flex w-full justify-between text-xs font-semibold tracking-[0.24em] text-rose-100 sm:text-sm">
            <span>SPRING LEAGUE</span>
            <span>2026 SEASON</span>
          </div>

          <div className="relative flex w-full flex-1 flex-col items-center justify-center">
            <div className="absolute inset-x-0 top-[16%] mx-auto h-40 w-40 rounded-full bg-white/15 blur-3xl sm:h-56 sm:w-56" />
            <div className="absolute bottom-[18%] left-[8%] h-24 w-24 rounded-full bg-rose-300/20 blur-2xl" />
            <div className="absolute right-[10%] top-[24%] h-28 w-28 rounded-full bg-pink-100/20 blur-2xl" />

            <div className="home-entry-focus relative mx-auto flex w-full max-w-3xl flex-col items-center rounded-[2rem] border border-white/10 bg-black/20 px-5 py-10 text-center backdrop-blur-sm">
              <div className="mb-6 flex items-end gap-3">
                <span className="text-4xl sm:text-5xl">🌸</span>
                <span className="text-5xl sm:text-6xl">🌸</span>
                <span className="text-4xl sm:text-5xl">🌸</span>
              </div>

              <p className="text-sm font-semibold tracking-[0.36em] text-rose-100 sm:text-base">
                시험기간 집중력 파괴 프로젝트
              </p>
              <h1 className="mt-4 text-[3.2rem] font-black tracking-[-0.08em] text-white sm:text-[5.4rem]">
                벚꽃살리기
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/78 sm:max-w-xl sm:text-lg sm:leading-8">
              우리 학교 벚꽃은 살리고, 남의 학교는 흔들고.<br />
              랭킹은 끝까지 확인하게 되는 봄 시즌 대항전.
              </p>
              <div className="mt-10 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur transition group-hover:scale-[1.02] sm:text-base">
                화면 아무 곳이나 눌러 입장하기
              </div>
            </div>
          </div>

          <div className="w-full text-center text-xs text-white/70 sm:text-sm">
            친구와 함께 우리 학교 벚꽃 수명 연장하기
          </div>
        </div>
      </HomeEntryClient>
    </main>
  );
}
