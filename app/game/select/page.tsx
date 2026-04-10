import Link from "next/link";
import { BackgroundVideoWarmup } from "../../_components/background-video-warmup";
import { GameModeVideo } from "../../_components/game-mode-video";
import { getSchoolById } from "../../_lib/mock-data";
import { resolveSchoolIdFromRequest } from "../../_lib/selected-school-server";
import { GAME_MODE_VIDEOS } from "../../_lib/video-assets";
import { redirect } from "next/navigation";

type GameSelectPageProps = {
  searchParams: Promise<{
    schoolId?: string;
  }>;
};

const COPY = {
  titleSuffix: " \ubc9a\uaf43 \ubd99\uc774\uae30",
  startMode: "\uc774 \ubaa8\ub4dc\ub85c \uc2dc\uc791\ud558\uae30",
  backToMainShort: "\ub4a4\ub85c\uac00\uae30",
};

const GAME_MODES = [
  {
    id: "fall",
    title: "\ubc9a\uaf43 \uce90\uce58",
    description:
      "\ube60\ub974\uac8c \uc6c0\uc9c1\uc774\ub294 \ubc8c\uc744 \ud53c\ud574 \ub5a8\uc5b4\uc9c0\ub294 \ubc9a\uaf43\uc744 \uce90\uce58\ud574\ubcf4\uc138\uc694!",
    accent: "from-rose-300 via-pink-200 to-amber-100",
    frame: "from-stone-900/90 via-rose-950/80 to-stone-900/90",
    glow: "shadow-[0_24px_60px_rgba(120,45,78,0.22)]",
    preview: "video",
    video: "/videos/game-modes/classic-fall.mp4",
    poster: "/images/game-modes/posters/classic-fall-poster.webp",
  },
  {
    id: "tap",
    title: "\ubc9a\uaf43 \ud1a1\ud1a1",
    description:
      "\uc6d0\ud558\ub294 \uacf3\uc744 \ud1a1\ud1a1 \ub20c\ub7ec \ucd5c\ub300\ud55c \ub9ce\uc740 \ubc9a\uaf43\uc744 \ud53c\uc6cc\ub0b4\ubcf4\uc138\uc694!",
    accent: "from-amber-200 via-rose-100 to-fuchsia-200",
    frame: "from-stone-900/90 via-fuchsia-950/75 to-stone-900/90",
    glow: "shadow-[0_24px_60px_rgba(143,76,111,0.2)]",
    preview: "video",
    video: "/videos/game-modes/tap-bloom.mp4",
    poster: "/images/game-modes/posters/tap-bloom-poster.webp",
  },
  {
    id: "prototype1",
    title: "Prototype1",
    description:
      "\ub3c4\ud2b8 \uac10\uc131 2D \ud14c\uc2a4\ud2b8 \ubaa8\ub4dc\ub85c, A/D(\ub610\ub294 \u2190/\u2192)\ub85c \uc774\ub3d9\ud558\uace0 Space\ub85c \uc810\ud504\ud558\uba70 \ubc9a\uaf43\uc740 +10\uc810, \ubc8c\uc740 -2\uc810\uc774\uc5d0\uc694.",
    accent: "from-rose-200 via-pink-100 to-amber-100",
    frame: "from-stone-900/90 via-rose-950/75 to-stone-900/90",
    glow: "shadow-[0_24px_60px_rgba(132,76,103,0.2)]",
    preview: "video",
    video: "/videos/game-modes/prototype1.mp4",
    poster: "/images/game-modes/posters/prototype1-poster.webp",
  },
] as const;

export default async function GameSelectPage({
  searchParams,
}: GameSelectPageProps) {
  const params = await searchParams;
  const resolvedSchoolId = await resolveSchoolIdFromRequest(params.schoolId);

  if (!resolvedSchoolId) {
    redirect("/select-school");
  }

  const school =
    getSchoolById(resolvedSchoolId) ?? getSchoolById("school-044");

  if (!school) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,244,248,0.26),rgba(255,247,250,0.14)_28%,rgba(255,255,255,0)_58%)] px-4 py-5 text-stone-900">
      <BackgroundVideoWarmup
        groups={[
          { sources: GAME_MODE_VIDEOS, preload: "metadata", delayMs: 0 },
        ]}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,245,248,0.12),rgba(255,255,255,0.02)_36%,rgba(255,241,246,0.1)_100%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 pt-9 pb-8 sm:pt-11 sm:pb-10">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_rgba(120,73,96,0.08)] backdrop-blur-md sm:p-7">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,rgba(251,113,133,0.9),rgba(255,255,255,0.92),rgba(253,186,116,0.9),rgba(255,255,255,0.92),rgba(244,114,182,0.9))]" />
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-200/45 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-24 w-24 rounded-full bg-amber-100/70 blur-3xl" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-rose-200/70 via-white/0 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-amber-200/70 via-white/0 to-transparent" />

          <div className="relative flex flex-col gap-4">
            <div className="mx-auto flex w-full max-w-2xl flex-col">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-3 py-1 text-[10px] font-semibold tracking-[0.26em] text-rose-500 shadow-[0_8px_20px_rgba(120,73,96,0.08)]">
                <span className="h-2 w-2 rounded-[2px] bg-rose-400" />
                MINI GAME SELECT
                <span className="h-2 w-2 rounded-[2px] bg-amber-300" />
              </div>
              <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 lg:block">
                <div className="grid grid-cols-2 gap-1">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-rose-300/85" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-amber-200/85" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-pink-200/85" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-rose-200/85" />
                </div>
              </div>
              <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block">
                <div className="grid grid-cols-2 gap-1">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-rose-300/85" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-amber-200/85" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-pink-200/85" />
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-rose-200/85" />
                </div>
              </div>
              <h1 className="mt-4 text-center font-mono text-3xl font-black uppercase tracking-[0.14em] text-stone-900 [text-shadow:2px_2px_0_rgba(255,255,255,0.45)] sm:text-4xl">
                MINI GAME ZONE
              </h1>
              <div className="mx-auto mt-4 h-2 w-32 rounded-full bg-[linear-gradient(90deg,rgba(251,113,133,0.2),rgba(255,255,255,0.8),rgba(253,186,116,0.2))]" />
            </div>
          </div>
        </header>

        <Link
          href="/main"
          className="mx-auto block w-full max-w-6xl rounded-[1.4rem] border border-white/80 bg-white/78 px-4 py-3 text-center text-sm font-semibold text-stone-700 shadow-[0_12px_28px_rgba(120,73,96,0.08)] backdrop-blur-sm transition-colors duration-200 hover:bg-white/88"
        >
          {COPY.backToMainShort}
        </Link>

        <section className="grid gap-4 xl:grid-cols-2">
          {GAME_MODES.map((mode) => (
            <article
              key={mode.id}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/50 p-4 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:p-5 ${mode.glow}`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-r ${mode.accent} opacity-80`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.16),transparent_35%,rgba(35,24,31,0.08)_100%)]" />

              <div className="relative flex h-full flex-col gap-4">
                <div>
                  <h2 className="mt-2 font-mono text-2xl font-black tracking-[-0.03em] text-stone-950 [text-shadow:2px_2px_0_rgba(255,255,255,0.45)] sm:text-[2rem]">
                    {mode.title}
                  </h2>
                </div>

                <div
                  className={`relative overflow-hidden rounded-[1.6rem] border border-white/35 bg-gradient-to-br ${mode.frame} p-2`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%,rgba(0,0,0,0.24)_100%)]" />
                  {mode.preview === "video" ? (
                    <GameModeVideo
                      src={mode.video}
                      title={mode.title}
                      poster={mode.poster}
                    />
                  ) : (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.1rem] border border-white/25 bg-[linear-gradient(180deg,#59a8f6_0%,#8dd0ff_52%,#58a14f_52%,#4a8e42_100%)] [image-rendering:pixelated]">
                      <div className="absolute inset-0 opacity-20 [background-size:12px_12px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.26)_1px,transparent_1px)]" />
                      <div className="absolute left-1/2 bottom-[30%] h-[45%] w-[34%] -translate-x-1/2">
                        <div className="absolute bottom-0 left-1/2 h-[42%] w-[18%] -translate-x-1/2 border-[4px] border-[#5f311f] bg-[#8e4f2b]" />
                        <div className="absolute left-1/2 top-0 h-[62%] w-full -translate-x-1/2 border-[5px] border-[#b8527f] bg-[#f8b5d3]" />
                      </div>
                      <div className="absolute bottom-[10%] right-[24%] h-[16%] w-[10%] border-[4px] border-[#6f3f1e] bg-[#f4b355]" />
                    </div>
                  )}

                </div>

                <p className="text-sm leading-6 text-stone-700 sm:text-[15px]">
                  {mode.description}
                </p>

                <div className="mt-auto pt-2">
                  <Link
                    href={`/game?mode=${mode.id}`}
                    className="block rounded-[1.2rem] bg-stone-950 px-4 py-4 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-stone-800"
                  >
                    {COPY.startMode}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
