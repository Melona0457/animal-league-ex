"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { TreeScene } from "../_components/tree-scene";
import {
  addPetalPlacements,
  getPetalsBySchoolId,
  type PetalPlacement,
} from "../_lib/petal-state";
import { applyGameScore } from "../_lib/school-state";

type GameMode = "fall" | "tap" | "drag";

type DraftPetal = {
  id: string;
  xPercent: number;
  yPercent: number;
  rotation: number;
  scale: number;
};

type LoosePetal = {
  id: string;
  xPercent: number;
  yPercent: number;
  rotation: number;
  scale: number;
};

type FallingItem = {
  id: string;
  type: "petal" | "bug";
  x: number;
  y: number;
  size: number;
  duration: number;
  drift: number;
  wiggle: number;
  startRotation: number;
  endRotation: number;
  direction?: "left-to-right" | "right-to-left";
};

type GameClientProps = {
  schoolId: string;
  schoolName: string;
  treeLevel: number;
  mode: GameMode;
};

const GAME_DURATION = 15;

function randomPetalStyle() {
  return {
    rotation: -28 + Math.random() * 56,
    scale: 0.85 + Math.random() * 0.4,
  };
}

function randomLoosePetal(id: string): LoosePetal {
  return {
    id,
    xPercent: 10 + Math.random() * 80,
    yPercent: 84 + Math.random() * 10,
    ...randomPetalStyle(),
  };
}

export function GameClient({ schoolId, schoolName, treeLevel, mode }: GameClientProps) {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draftIdRef = useRef(0);
  const loosePetalIdRef = useRef(0);
  const fallingItemIdRef = useRef(0);
  const itemTimersRef = useRef<number[]>([]);
  const [isSaving, startSavingTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const [existingPetals, setExistingPetals] = useState<PetalPlacement[]>([]);
  const [placedPetals, setPlacedPetals] = useState<DraftPetal[]>([]);
  const [loosePetals, setLoosePetals] = useState<LoosePetal[]>(
    Array.from({ length: 7 }, (_, index) => randomLoosePetal(`loose-initial-${index}`)),
  );
  const [draggingPetal, setDraggingPetal] = useState<LoosePetal | null>(null);
  const [dragPreview, setDragPreview] = useState<{ xPercent: number; yPercent: number } | null>(
    null,
  );
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      const petals = await getPetalsBySchoolId(schoolId);

      if (isActive) {
        setExistingPetals(petals);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [schoolId]);

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
    if (mode !== "fall" || isFinished) {
      return;
    }

    function spawnItem() {
      const nextId = `fall-${fallingItemIdRef.current++}`;
      const type = Math.random() < 0.66 ? "petal" : "bug";
      const duration = 2600 + Math.floor(Math.random() * 1800);
      const direction = Math.random() < 0.5 ? "left-to-right" : "right-to-left";

      const item: FallingItem = {
        id: nextId,
        type,
        x: type === "petal" ? 6 + Math.random() * 82 : direction === "left-to-right" ? -10 : 100,
        y: type === "petal" ? 0 : 16 + Math.random() * 56,
        size: 36 + Math.floor(Math.random() * 28),
        duration,
        drift: -42 + Math.random() * 84,
        wiggle: 18 + Math.random() * 34,
        startRotation: -24 + Math.random() * 48,
        endRotation: -90 + Math.random() * 180,
        direction,
      };

      setFallingItems((current) => [...current.slice(-13), item]);

      const timeoutId = window.setTimeout(() => {
        setFallingItems((current) => current.filter((currentItem) => currentItem.id !== nextId));
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
  }, [mode, isFinished]);

  const savedPetalPreview = useMemo(
    () =>
      placedPetals.map((petal) => ({
        id: petal.id,
        schoolId,
        xPercent: petal.xPercent,
        yPercent: petal.yPercent,
        rotation: petal.rotation,
        scale: petal.scale,
        createdAt: "",
      })) satisfies PetalPlacement[],
    [placedPetals, schoolId],
  );

  const combinedPetals = useMemo(
    () => [...existingPetals, ...savedPetalPreview],
    [existingPetals, savedPetalPreview],
  );

  function getRelativePosition(clientX: number, clientY: number) {
    const board = boardRef.current;

    if (!board) {
      return null;
    }

    const rect = board.getBoundingClientRect();
    const xPercent = ((clientX - rect.left) / rect.width) * 100;
    const yPercent = ((clientY - rect.top) / rect.height) * 100;

    return {
      xPercent: Math.max(6, Math.min(94, xPercent)),
      yPercent: Math.max(8, Math.min(92, yPercent)),
    };
  }

  function createDraftPetal(
    xPercent: number,
    yPercent: number,
    overrides?: Partial<DraftPetal>,
  ): DraftPetal {
    return {
      id: `draft-${draftIdRef.current++}`,
      xPercent,
      yPercent,
      ...randomPetalStyle(),
      ...overrides,
    };
  }

  function handleBoardClick(event: ReactPointerEvent<HTMLDivElement>) {
    if (mode !== "tap" || isFinished) {
      return;
    }

    const position = getRelativePosition(event.clientX, event.clientY);

    if (!position) {
      return;
    }

    setPlacedPetals((current) => [
      ...current,
      createDraftPetal(position.xPercent, position.yPercent),
    ]);
  }

  function handleLoosePetalPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    petal: LoosePetal,
  ) {
    if (mode !== "drag" || isFinished) {
      return;
    }

    event.preventDefault();
    setDraggingPetal(petal);
    const position = getRelativePosition(event.clientX, event.clientY);
    setDragPreview(position);
  }

  function handleBoardPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingPetal || isFinished) {
      return;
    }

    const position = getRelativePosition(event.clientX, event.clientY);
    setDragPreview(position);
  }

  function handleBoardPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingPetal || isFinished) {
      return;
    }

    const position = getRelativePosition(event.clientX, event.clientY);

    if (position) {
      setPlacedPetals((current) => [
        ...current,
        createDraftPetal(position.xPercent, position.yPercent, {
          rotation: draggingPetal.rotation,
          scale: draggingPetal.scale,
        }),
      ]);
      setLoosePetals((current) => [
        ...current.filter((item) => item.id !== draggingPetal.id),
        randomLoosePetal(`loose-${loosePetalIdRef.current++}`),
      ]);
    }

    setDraggingPetal(null);
    setDragPreview(null);
  }

  function handlePointerLeave() {
    setDragPreview(null);
  }

  function handleFallingItemClick(item: FallingItem) {
    if (mode !== "fall" || isFinished) {
      return;
    }

    setPlacedPetals((current) => {
      if (item.type === "bug") {
        return current.slice(0, Math.max(0, current.length - 2));
      }

      return [
        ...current,
        createDraftPetal(20 + Math.random() * 60, 22 + Math.random() * 46),
      ];
    });

    setFallingItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
  }

  function handleApplyScore() {
    startSavingTransition(async () => {
      if (placedPetals.length > 0) {
        await addPetalPlacements(
          schoolId,
          placedPetals.map((petal) => ({
            xPercent: petal.xPercent,
            yPercent: petal.yPercent,
            rotation: petal.rotation,
            scale: petal.scale,
          })),
        );
      }

      await applyGameScore(schoolId, placedPetals.length);
      router.push(`/main?schoolId=${schoolId}&score=${placedPetals.length}`);
    });
  }

  function handleRestart() {
    setTimeLeft(GAME_DURATION);
    setIsFinished(false);
    setPlacedPetals([]);
    setDraggingPetal(null);
    setDragPreview(null);
    setFallingItems([]);
    setLoosePetals(
      Array.from({ length: 7 }, (_, index) => randomLoosePetal(`loose-restart-${index}`)),
    );
  }

  const modeTitle =
    mode === "fall"
      ? "클래식 낙하형"
      : mode === "tap"
        ? "터치로 바로 붙이기"
        : "바닥 꽃잎 끌어다 놓기";

  const modeGuide =
    mode === "fall"
      ? "위에서 떨어지는 벚꽃은 잡고 벌레는 피하면서 점수를 모으세요."
      : mode === "tap"
        ? "현재 나무와 기존 꽃잎을 보면서 원하는 위치를 바로 눌러 붙이세요."
        : "나무 하단에 떨어진 꽃잎을 끌어 올려 가지에 예쁘게 고정해보세요.";

  const resultDescription =
    mode === "fall"
      ? `이번 판에서 ${placedPetals.length}개의 벚꽃잎을 추가로 붙였어요.`
      : `이번 판에서 ${placedPetals.length}개의 벚꽃잎을 직접 고정했어요.`;

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
            <p className="mt-1 text-xl font-bold sm:text-3xl">{placedPetals.length}</p>
            <p className="mt-1 text-[11px] text-stone-500 sm:text-xs">{modeTitle}</p>
          </div>
          <Link
            href={`/game/select?schoolId=${schoolId}`}
            className="rounded-2xl bg-white/65 px-3 py-3 text-left"
          >
            <p className="text-[11px] text-stone-500 sm:text-xs">다시 선택</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">모드</p>
          </Link>
        </header>

        <section className="relative flex flex-1 items-stretch justify-center py-4">
          <div className="relative h-full min-h-[65vh] w-full overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.18))] shadow-[0_24px_80px_rgba(120,73,96,0.12)]">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-rose-500">
                  MINI GAME
                </p>
                <h1 className="mt-1 text-2xl font-bold">{schoolName} 벚꽃 붙이기</h1>
                <p className="mt-2 text-sm text-stone-500">{modeGuide}</p>
              </div>
              <p className="text-sm text-stone-500">배치 완료 {placedPetals.length}개</p>
            </div>

            {mode === "fall" ? (
              <div className="absolute inset-x-4 top-24 bottom-4 overflow-hidden rounded-[2rem] border border-rose-100/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),rgba(255,255,255,0.26))]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
                {fallingItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleFallingItemClick(item)}
                    disabled={isFinished}
                    className={`falling-item absolute left-0 top-0 z-10 flex items-center justify-center rounded-full border text-base font-semibold shadow-lg ${
                      item.type === "petal"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    } ${isFinished ? "opacity-50" : ""}`}
                    style={
                      {
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: `${item.size}px`,
                        height: `${item.size}px`,
                        animation: `${item.type === "petal" ? "petal-float" : "bug-fly"} ${item.duration}ms linear forwards`,
                        "--petal-x1": `${item.drift * 0.2 + item.wiggle * 0.8}px`,
                        "--petal-x2": `${item.drift * -0.15 - item.wiggle * 0.55}px`,
                        "--petal-x3": `${item.drift * 0.45 + item.wiggle * 0.65}px`,
                        "--petal-x4": `${item.drift}px`,
                        "--petal-y1": "24vh",
                        "--petal-y2": "48vh",
                        "--petal-y3": "72vh",
                        "--petal-y4": "95vh",
                        "--bug-x1":
                          item.direction === "left-to-right" ? "22vw" : "-22vw",
                        "--bug-x2":
                          item.direction === "left-to-right" ? "48vw" : "-48vw",
                        "--bug-x3":
                          item.direction === "left-to-right" ? "76vw" : "-76vw",
                        "--bug-x4":
                          item.direction === "left-to-right" ? "96vw" : "-96vw",
                        "--bug-x5":
                          item.direction === "left-to-right" ? "114vw" : "-114vw",
                        "--bug-y1": `${item.wiggle * -0.9}px`,
                        "--bug-y2": `${item.wiggle * 0.55}px`,
                        "--bug-y3": `${item.wiggle * -0.45}px`,
                        "--bug-y4": `${item.wiggle * 0.3}px`,
                        "--bug-y5": `${item.wiggle * -0.2}px`,
                        "--motion-start-rotate": `${item.startRotation}deg`,
                        "--motion-end-rotate": `${item.endRotation}deg`,
                      } as CSSProperties
                    }
                  >
                    {item.type === "petal" ? "🌸" : "🐝"}
                  </button>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(214,162,177,0),rgba(151,99,125,0.22))]" />
              </div>
            ) : (
              <div
                ref={boardRef}
                onPointerDown={handleBoardClick}
                onPointerMove={handleBoardPointerMove}
                onPointerUp={handleBoardPointerUp}
                onPointerLeave={handlePointerLeave}
                className="absolute inset-x-4 top-24 bottom-4 overflow-hidden rounded-[2rem] border border-rose-100/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),rgba(255,255,255,0.26))]"
              >
                <TreeScene treeLevel={treeLevel} petals={combinedPetals} className="w-full">
                  <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.9))]" />
                  {mode === "drag"
                    ? loosePetals.map((petal) => (
                        <button
                          key={petal.id}
                          type="button"
                          onPointerDown={(event) => handleLoosePetalPointerDown(event, petal)}
                          className="absolute z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat"
                          style={{
                            left: `${petal.xPercent}%`,
                            top: `${petal.yPercent}%`,
                            transform: `translate(-50%, -50%) rotate(${petal.rotation}deg) scale(${petal.scale})`,
                            backgroundImage: "url('/images/petals/petal.png')",
                            filter: "grayscale(0.8) saturate(0.45) brightness(0.88)",
                            opacity: 0.92,
                          }}
                        >
                          <span className="flex h-full w-full items-center justify-center text-xl opacity-0">🌸</span>
                        </button>
                      ))
                    : null}

                  {draggingPetal && dragPreview ? (
                    <div
                      className="pointer-events-none absolute z-30 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat opacity-85"
                      style={{
                        left: `${dragPreview.xPercent}%`,
                        top: `${dragPreview.yPercent}%`,
                        transform: `translate(-50%, -50%) rotate(${draggingPetal.rotation}deg) scale(${draggingPetal.scale})`,
                        backgroundImage: "url('/images/petals/petal.png')",
                      }}
                    >
                      <span className="flex h-full w-full items-center justify-center text-xl opacity-0">🌸</span>
                    </div>
                  ) : null}
                </TreeScene>

                {mode === "tap" ? (
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.75rem] border border-white/70 bg-white/70 px-4 py-3 text-sm text-stone-600 backdrop-blur-sm">
                    현재 나무 모양과 이미 붙은 벚꽃을 보면서 원하는 가지를 눌러 배치하세요.
                  </div>
                ) : (
                  <div className="absolute inset-x-4 bottom-4 rounded-[1.75rem] border border-white/70 bg-white/70 px-4 py-3 text-sm text-stone-600 backdrop-blur-sm">
                    나무 하단에 떨어진 꽃잎을 끌어 올려 원하는 가지 위치에 고정하세요.
                  </div>
                )}
              </div>
            )}

            {isFinished ? (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/92 p-6 text-center text-stone-900 shadow-2xl">
                  <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">
                    RESULT
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">벚꽃 붙이기 종료</h2>
                  <p className="mt-4 text-base leading-7 text-stone-600">{resultDescription}</p>
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleApplyScore}
                      disabled={isSaving}
                      className="rounded-2xl bg-stone-900 px-4 py-4 text-center text-sm font-semibold text-white"
                    >
                      {isSaving ? "배치 저장 중..." : "배치 반영하고 메인으로"}
                    </button>
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
