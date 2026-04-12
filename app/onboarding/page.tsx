"use client";

import Link from "next/link";
import { useState } from "react";

const slides = [
  {
    title: "흩날리는 꽃들 속에서",
    description:
      "시험기간에 가려졌던 벚꽃, 이제는 다시 피워볼 시간이에요.\n우리 학교 나무를 키우는 시즌 대항전이 시작됩니다.",
  },
  {
    title: "미니게임으로 벚꽃 살리기",
    description:
      "벚꽃 붙이기 미니게임에 들어가 점수를 모으면 우리 학교 벚꽃잎 수가 늘어나고,\n나무도 더 화려하게 자라납니다.",
  },
  {
    title: "상대 학교 나무 흔들기",
    description:
      "경쟁학교의 나무를 흔들어서 벚꽃잎을 떨어트릴수 있어요.\n전략적으로 방해해서 우리 학교 순위를 지켜보세요.",
  },
  {
    title: "실시간 벚꽃 랭킹",
    description:
      "전국 대학들의 벚꽃 개수를 비교하면서 우리 학교가 몇 등인지 확인해보세요.\n친구들이 많이 참여할수록 더 많은 벚꽃잎을 얻을 수 있습니다.",
  },
  {
    title: "게이지로 보는 우리 학교 성장",
    description:
      "우리 학교의 총 벚꽃 수와 성장 진행도는 게이지로 바로 확인할 수 있어요.\nLv.1부터 Lv.7까지 올라갈수록 나무가 점점 더 풍성해집니다.",
  },
] as const;

function TreeIntroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-white/25 shadow-[0_24px_60px_rgba(132,149,186,0.2)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
      <div
        className="h-[17rem] w-[32rem] max-w-full bg-cover bg-center sm:h-[22rem]"
        style={{ backgroundImage: "url('/images/trees/tree-level-7.webp')" }}
      />
    </div>
  );
}

function MiniGameVisual() {
  return (
    <div className="w-[32rem] max-w-full overflow-hidden rounded-[2rem] border border-white/45 bg-[linear-gradient(180deg,rgba(120,183,241,0.9),rgba(255,233,243,0.88))] p-3 shadow-[0_24px_60px_rgba(132,149,186,0.2)]">
      <div className="rounded-[1.5rem] border border-white/40 bg-white/30 p-3 backdrop-blur-sm">
        <div className="rounded-[1.2rem] border border-white/35 bg-white/40 px-4 py-3 text-center">
          <p className="text-[10px] font-black tracking-[0.3em] text-rose-500">MINI GAME SELECT</p>
          <p className="mt-2 text-2xl font-black tracking-[0.15em] text-stone-800">MINI GAME ZONE</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            {
              label: "벚꽃 캐치",
              image:
                "linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)), url('/images/backgrounds/main-background.png')",
            },
            {
              label: "벚꽃 톡톡",
              image:
                "linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02)), url('/images/backgrounds/main-background.png')",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-[1.45rem] border border-white/55 bg-white/78 p-4 shadow-[0_12px_28px_rgba(132,149,186,0.18)]"
            >
              <p className="text-center text-2xl font-black tracking-[-0.04em] text-stone-900">
                {card.label}
              </p>
              <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-stone-200 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                <div
                  className="relative h-40 bg-cover bg-center"
                  style={{
                    backgroundImage: card.image,
                  }}
                >
                  <span className="absolute left-2 top-2 text-3xl">🌸</span>
                  <span className="absolute right-3 top-2 text-3xl">🌸</span>
                  <span className="absolute left-4 bottom-3 text-3xl">🌸</span>
                  <span className="absolute right-2 bottom-2 text-4xl">🌸</span>
                  <span className="absolute left-[18%] top-[28%] text-base">🌸</span>
                  <span className="absolute left-[34%] top-[38%] text-sm">🌸</span>
                  <span className="absolute left-[46%] top-[22%] text-base">🌸</span>
                  <span className="absolute left-[58%] top-[44%] text-base">🌸</span>
                  <span className="absolute left-[70%] top-[30%] text-sm">🌸</span>
                  <span className="absolute left-[52%] top-[8%] text-sm">🌸</span>
                  <span className="absolute left-[22%] top-[52%] text-sm">🌸</span>
                  <span className="absolute left-[40%] top-[56%] text-sm">🌸</span>
                  <span className="absolute left-[64%] top-[58%] text-sm">🌸</span>
                  <span className="absolute left-[78%] top-[52%] text-sm">🌸</span>
                </div>
              </div>
              <div className="mt-4 rounded-[1.1rem] bg-stone-950 px-3 py-3 text-center text-sm font-semibold text-white">
                이 모드로 시작하기
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShakeVisual() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-white/25 shadow-[0_24px_60px_rgba(132,149,186,0.2)]">
      <div
        className="h-[17rem] w-[32rem] max-w-full bg-cover bg-center sm:h-[22rem]"
        style={{ backgroundImage: "url('/images/backgrounds/main-background.png')" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_14%,rgba(255,255,255,0.22),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.08))]" />
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/trees/tree-level-5.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center 58%",
        }}
      />
      <span className="absolute left-[6%] top-[12%] text-sm opacity-80">🌸</span>
      <span className="absolute left-[14%] top-[22%] text-xs opacity-75">🌸</span>
      <span className="absolute left-[22%] top-[10%] text-sm opacity-85">🌸</span>
      <span className="absolute left-[74%] top-[8%] text-sm opacity-85">🌸</span>
      <span className="absolute left-[82%] top-[18%] text-xs opacity-80">🌸</span>
      <span className="absolute left-[90%] top-[11%] text-sm opacity-75">🌸</span>
      <span className="absolute left-[12%] top-[36%] text-xs opacity-70">🌸</span>
      <span className="absolute left-[80%] top-[34%] text-xs opacity-70">🌸</span>
      <span className="absolute left-[18%] bottom-[14%] text-xs opacity-70">🌸</span>
      <span className="absolute left-[28%] bottom-[10%] text-sm opacity-80">🌸</span>
      <span className="absolute left-[64%] bottom-[11%] text-xs opacity-70">🌸</span>
      <span className="absolute left-[76%] bottom-[9%] text-sm opacity-80">🌸</span>
    </div>
  );
}

function RankingVisual() {
  return (
    <div className="w-[32rem] max-w-full overflow-hidden rounded-[2rem] border border-white/45 bg-white shadow-[0_24px_60px_rgba(132,149,186,0.2)]">
      <div className="px-5 py-6 sm:px-6 sm:py-7">
        <div className="mx-auto w-fit rounded-full bg-[linear-gradient(90deg,rgba(255,241,245,0.95),rgba(255,232,240,0.92))] px-5 py-2 text-xs font-bold text-rose-500 shadow-[0_10px_24px_rgba(244,114,182,0.08)]">
          실시간 TOP 3 랭킹
        </div>
        <div className="mt-8 flex items-end justify-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center">
            <div
              className="mb-2 h-14 w-14 bg-contain bg-center bg-no-repeat sm:h-16 sm:w-16"
              style={{ backgroundImage: "url('/images/trees/tree_clean_2.webp')" }}
            />
            <p className="text-sm font-semibold text-stone-700">경북대</p>
            <div className="mt-3 flex h-24 w-24 items-center justify-center rounded-t-[1.5rem] bg-[linear-gradient(180deg,#fff0f5,#ffd6e3)] text-2xl font-black text-rose-600">
              2위
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="mb-2 h-32 w-32 bg-contain bg-center bg-no-repeat sm:h-36 sm:w-36"
              style={{ backgroundImage: "url('/images/trees/tree_clean_3.webp')" }}
            />
            <p className="text-sm font-semibold text-stone-700">숭실대</p>
            <div className="mt-3 flex h-32 w-32 items-center justify-center rounded-t-[1.7rem] bg-[linear-gradient(180deg,#fda4af,#fb7185)] text-3xl font-black text-white shadow-[0_18px_30px_rgba(244,114,182,0.2)]">
              1위
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="mb-2 h-12 w-12 bg-contain bg-center bg-no-repeat sm:h-14 sm:w-14"
              style={{ backgroundImage: "url('/images/trees/tree_clean_1.webp')" }}
            />
            <p className="text-sm font-semibold text-stone-700">가톨릭대</p>
            <div className="mt-3 flex h-20 w-24 items-center justify-center rounded-t-[1.4rem] bg-[linear-gradient(180deg,#fff7fa,#ffe5ee)] text-2xl font-black text-rose-600">
              3위
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthGaugeVisual() {
  return (
    <div className="w-[32rem] max-w-full overflow-hidden rounded-[2rem] border border-white/45 bg-[linear-gradient(180deg,rgba(206,236,255,0.95),rgba(243,248,255,0.92))] p-3 shadow-[0_24px_60px_rgba(132,149,186,0.2)]">
      <div className="rounded-[1.6rem] border border-white/55 bg-white/52 p-4 backdrop-blur-md">
        <div className="grid gap-3 sm:grid-cols-[1.1fr_1.45fr]">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[1.2rem] border border-stone-200 bg-white/82 p-3 text-center shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
              <p className="text-[11px] font-semibold text-stone-500">이전 학교</p>
              <p className="mt-5 text-sm font-black text-stone-700">경쟁 학교 없음</p>
            </div>
            <div className="rounded-[1.2rem] border border-stone-200 bg-white/82 p-3 text-center shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
              <p className="text-[11px] font-semibold text-stone-500">현재 순위</p>
              <p className="mt-4 text-3xl font-black text-stone-900">#1</p>
            </div>
            <div className="rounded-[1.2rem] border border-stone-200 bg-white/82 p-3 text-center shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
              <div className="mx-auto h-9 w-9 rounded-full border border-sky-200 bg-[linear-gradient(135deg,#eff6ff,#ffffff)]" />
              <p className="mt-2 text-[11px] font-semibold text-stone-500">#2</p>
              <p className="mt-1 text-sm font-black text-stone-700">계명대</p>
              <p className="mt-1 text-xs font-bold text-rose-500">7,541개</p>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-stone-200 bg-white/82 p-4 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
            <p className="text-sm font-semibold text-stone-600">레벨</p>
            <p className="mt-1 text-3xl font-black text-stone-950">Lv.7</p>
            <p className="mt-3 text-sm font-semibold text-stone-600">총 벚꽃 수 16,037</p>
            <div className="mt-3 h-6 overflow-hidden rounded-full bg-white shadow-inner">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#fb7185,#f9a8d4)] text-sm font-black text-stone-900">
                100%
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-medium text-stone-500">
              <span>Lv.7</span>
              <span>만개</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(246,250,255,0.72))] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black tracking-[0.14em] text-rose-500">LEVEL GROWTH</p>
            <p className="text-xs font-semibold text-stone-500">레벨이 오를수록 나무가 풍성해져요</p>
          </div>
          <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-[1.25rem] border border-stone-200 bg-white/88 p-3 text-center shadow-[0_8px_18px_rgba(148,163,184,0.1)]">
              <div
                className="mx-auto h-20 w-full bg-contain bg-center bg-no-repeat sm:h-24"
                style={{ backgroundImage: "url('/images/trees/tree-level-1.webp')" }}
              />
              <p className="mt-2 text-sm font-black text-stone-700">Lv.1</p>
              <p className="mt-1 text-xs font-semibold text-stone-500">막 피어나기 시작한 나무</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 text-rose-400">
              <span className="text-3xl font-black">→</span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-500">
                점점 더 풍성하게
              </span>
            </div>

            <div className="rounded-[1.25rem] border border-rose-200 bg-[linear-gradient(180deg,#fff1f5,#ffe4ef)] p-3 text-center shadow-[0_10px_22px_rgba(244,114,182,0.12)]">
              <div
                className="mx-auto h-20 w-full bg-contain bg-center bg-no-repeat sm:h-24"
                style={{ backgroundImage: "url('/images/trees/tree-level-7.webp')" }}
              />
              <p className="mt-2 text-sm font-black text-stone-800">Lv.7</p>
              <p className="mt-1 text-xs font-semibold text-rose-500">벚꽃이 가득 핀 만개 상태</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideVisual({ index }: { index: number }) {
  if (index === 0) return <TreeIntroVisual />;
  if (index === 1) return <MiniGameVisual />;
  if (index === 2) return <ShakeVisual />;
  if (index === 3) return <RankingVisual />;
  return <GrowthGaugeVisual />;
}

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;

  function moveNext() {
    setCurrentIndex((current) => Math.min(slides.length - 1, current + 1));
  }

  function movePrev() {
    setCurrentIndex((current) => Math.max(0, current - 1));
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-stone-950 sm:px-6 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat blur-md brightness-95 saturate-110"
        style={{ backgroundImage: "url('/images/backgrounds/main-background.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,251,0.72),rgba(244,248,255,0.8))]" />
      <div className="pointer-events-none absolute left-0 top-10 h-56 w-56 rounded-full bg-pink-200/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-56 w-56 rounded-full bg-sky-100/45 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <section className="w-full overflow-hidden rounded-[2.25rem] border border-white/45 bg-white/62 shadow-[0_28px_90px_rgba(104,128,171,0.22)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/30 bg-[linear-gradient(90deg,rgba(255,242,247,0.95),rgba(245,238,255,0.88),rgba(232,242,255,0.92))] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/90 px-4 py-2 text-[11px] font-black tracking-[0.28em] text-rose-500 shadow-sm">
                BLOSSOM GUIDE
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-white/95" />
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-pink-500/80" />
              </div>
            </div>
            <Link
              href="/main?schoolId=school-044"
              className="rounded-full border border-stone-200 bg-white/85 px-4 py-2 text-sm font-semibold text-stone-600 shadow-[0_8px_24px_rgba(148,163,184,0.15)] backdrop-blur-sm"
            >
              뒤로가기
            </Link>
          </div>

          <div className="grid min-h-[70vh] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-5 sm:gap-6 sm:px-6 sm:py-7">
            <button
              type="button"
              onClick={movePrev}
              disabled={isFirst}
              className={`flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white/86 text-3xl text-stone-600 shadow-[0_12px_24px_rgba(148,163,184,0.15)] backdrop-blur-sm transition ${
                isFirst ? "pointer-events-none opacity-35" : "hover:scale-[1.03]"
              }`}
              aria-label="이전 슬라이드"
            >
              ‹
            </button>

            <section className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
              <div className="min-h-[23rem] w-full transition-all duration-300 sm:min-h-[29rem]">
                <div className="flex justify-center">
                  <SlideVisual index={currentIndex} />
                </div>
              </div>

              <div className="mt-8 max-w-3xl">
                <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-900 sm:text-5xl">
                  {slides[currentIndex].title}
                </h1>
                <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-lg leading-8 text-slate-600 sm:text-xl">
                  {slides[currentIndex].description}
                </p>
              </div>

              <div className="mt-10 flex items-center justify-center gap-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-4 rounded-full transition-all ${
                      currentIndex === index
                        ? "w-10 bg-[linear-gradient(90deg,#fb7185,#ec4899)]"
                        : "w-4 bg-slate-300"
                    }`}
                    aria-label={`${index + 1}번 슬라이드 보기`}
                  />
                ))}
              </div>

              {isLast ? (
                <div className="mt-10">
                  <Link
                    href="/main?schoolId=school-044"
                    className="inline-flex rounded-full bg-[linear-gradient(90deg,#fb7185,#ec4899)] px-10 py-4 text-lg font-bold text-white shadow-[0_20px_40px_rgba(244,114,182,0.28)] transition hover:scale-[1.02]"
                  >
                    시작하기
                  </Link>
                </div>
              ) : null}
            </section>

            <button
              type="button"
              onClick={moveNext}
              disabled={isLast}
              className={`flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white/86 text-3xl text-stone-600 shadow-[0_12px_24px_rgba(148,163,184,0.15)] backdrop-blur-sm transition ${
                isLast ? "pointer-events-none opacity-35" : "hover:scale-[1.03]"
              }`}
              aria-label="다음 슬라이드"
            >
              ›
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
