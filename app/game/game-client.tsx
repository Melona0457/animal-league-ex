"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type GameItem = {
  id: string;
  type: "petal" | "bug";
  x: number;
  size: number;
  duration: number;
  drift: number;
  startRotation: number;
  endRotation: number;
};

type GameClientProps = {
  schoolId: string;
  schoolName: string;
};

const GAME_DURATION = 15;

export function GameClient({ schoolId, schoolName }: GameClientProps) {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [items, setItems] = useState<GameItem[]>([]);
  const itemTimersRef = useRef<number[]>([]);
  const itemIdRef = useRef(0);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isFinished]);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    function spawnItem() {
      const nextId = `${Date.now()}-${itemIdRef.current++}`;
      const type = Math.random() < 0.72 ? "petal" : "bug";
      const duration = 2600 + Math.floor(Math.random() * 1800);

      const item: GameItem = {
        id: nextId,
        type,
        x: 6 + Math.random() * 82,
        size: 36 + Math.floor(Math.random() * 28),
        duration,
        drift: -42 + Math.random() * 84,
        startRotation: -24 + Math.random() * 48,
        endRotation: -90 + Math.random() * 180,
      };

      setItems((current) => [...current.slice(-13), item]);

      const timeoutId = window.setTimeout(() => {
        setItems((current) => current.filter((currentItem) => currentItem.id !== nextId));
      }, duration + 120);
      itemTimersRef.current.push(timeoutId);
    }

    spawnItem();
    const spawner = window.setInterval(spawnItem, 420);

    return () => {
      window.clearInterval(spawner);
      itemTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      itemTimersRef.current = [];
    };
  }, [isFinished]);

  function handleItemClick(item: GameItem) {
    if (isFinished) {
      return;
    }

    setScore((current) => current + (item.type === "petal" ? 1 : -2));
    setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
  }

  function handleRestart() {
    itemTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    itemTimersRef.current = [];
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setItems([]);
    setIsFinished(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7fb_0%,#ffe7ef_48%,#ffd7e8_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5">
        <header className="grid grid-cols-3 gap-2 rounded-[1.75rem] border border-white/70 bg-white/45 p-3 backdrop-blur-sm sm:gap-3 sm:p-4">
          <div className="rounded-2xl bg-white/65 px-3 py-3">
            <p className="text-[11px] text-stone-500 sm:text-xs">남은 시간</p>
            <p className="mt-1 text-xl font-bold sm:text-3xl">{timeLeft}s</p>
          </div>
          <div className="rounded-2xl bg-white/65 px-3 py-3">
            <p className="text-[11px] text-stone-500 sm:text-xs">현재 점수</p>
            <p className="mt-1 text-xl font-bold sm:text-3xl">{score}</p>
            <p className="mt-1 text-[11px] text-stone-500 sm:text-xs">
              벚꽃 +1 / 벌레 -2
            </p>
          </div>
          <Link
            href={`/main?schoolId=${schoolId}`}
            className="rounded-2xl bg-white/65 px-3 py-3 text-left"
          >
            <p className="text-[11px] text-stone-500 sm:text-xs">나가기</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">메인</p>
          </Link>
        </header>

        <section className="relative flex flex-1 items-stretch justify-center py-4">
          <div className="relative h-full min-h-[65vh] w-full overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.18))] shadow-[0_24px_80px_rgba(120,73,96,0.12)]">
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-rose-500">
                  MINI GAME
                </p>
                <h1 className="mt-1 text-2xl font-bold">{schoolName} 벚꽃 붙이기</h1>
              </div>
              <p className="text-sm text-stone-500">낙하 오브젝트 {items.length}개</p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                disabled={isFinished}
                className={`falling-item absolute left-0 top-0 z-10 flex items-center justify-center rounded-full border text-base font-semibold shadow-lg ${
                  item.type === "petal"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                } ${isFinished ? "opacity-50" : ""}`}
                style={
                  {
                    left: `${item.x}%`,
                    width: `${item.size}px`,
                    height: `${item.size}px`,
                    animationDuration: `${item.duration}ms`,
                    animationDelay: "0ms",
                    "--fall-drift": `${item.drift}px`,
                    "--fall-start-rotate": `${item.startRotation}deg`,
                    "--fall-end-rotate": `${item.endRotation}deg`,
                    "--fall-distance": "95vh",
                  } as CSSProperties
                }
              >
                {item.type === "petal" ? "🌸" : "🐛"}
              </button>
            ))}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(214,162,177,0),rgba(151,99,125,0.22))]" />

            {isFinished ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/92 p-6 text-center text-stone-900 shadow-2xl">
                  <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">
                    RESULT
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">벚꽃 붙이기 종료</h2>
                  <p className="mt-4 text-base leading-7 text-stone-600">
                    이번 판에서 <span className="font-semibold text-stone-950">{score}점</span>을
                    획득했어요. 이제 메인 화면에서 점수 반영 상태를 확인할 수 있어요.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    <Link
                      href={`/main?schoolId=${schoolId}&score=${score}`}
                      className="rounded-2xl bg-stone-900 px-4 py-4 text-center text-sm font-semibold text-white"
                    >
                      점수 반영하고 메인으로
                    </Link>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold text-stone-700"
                    >
                      한 판 더 하기
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
