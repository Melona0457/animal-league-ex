"use client";

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
import { applyGameScore, getStoredSchools } from "../_lib/school-state";
import {
  type SchoolRecord,
} from "../_lib/mock-data";

type GameMode = "fall" | "tap";

type DraftPetal = {
  id: string;
  xPercent: number;
  yPercent: number;
  rotation: number;
  scale: number;
};

type FallingItem = {
  id: string;
  type: "petal" | "bug" | "potion";
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

type TapBurstPetal = {
  id: string;
  xPercent: number;
  yPercent: number;
  ringX: number;
  ringY: number;
  rise: number;
  drop: number;
  duration: number;
  rotationStart: number;
  rotationEnd: number;
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

function hasBatchim(word: string) {
  const trimmed = word.trim();

  if (!trimmed) {
    return false;
  }

  const lastChar = trimmed[trimmed.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return false;
  }

  return (code - 0xac00) % 28 !== 0;
}

function topicParticle(word: string) {
  return hasBatchim(word) ? "은" : "는";
}

function subjectParticle(word: string) {
  return hasBatchim(word) ? "이" : "가";
}

export function GameClient({ schoolId, schoolName, treeLevel, mode }: GameClientProps) {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draftIdRef = useRef(0);
  const fallingItemIdRef = useRef(0);
  const tapBurstIdRef = useRef(0);
  const nextPotionSpawnAtRef = useRef(0);
  const itemTimersRef = useRef<number[]>([]);
  const [isSaving, startSavingTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const [existingPetals, setExistingPetals] = useState<PetalPlacement[]>([]);
  const [placedPetals, setPlacedPetals] = useState<DraftPetal[]>([]);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [tapBursts, setTapBursts] = useState<TapBurstPetal[]>([]);
  const [fallScore, setFallScore] = useState(0);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [shareBonus, setShareBonus] = useState(0);
  const [hasAppliedShareBonus, setHasAppliedShareBonus] = useState(false);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      const [petals, storedSchools] = await Promise.all([
        mode === "fall" ? getPetalsBySchoolId(schoolId) : Promise.resolve([] as PetalPlacement[]),
        getStoredSchools(),
      ]);

      if (isActive) {
        setExistingPetals(petals);
        setSchools(storedSchools);
      }
    })();

    return () => {
      isActive = false;
    };
  }, [mode, schoolId]);

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

    nextPotionSpawnAtRef.current = Date.now() + 4200 + Math.random() * 1800;

    function spawnItem() {
      const nextId = `fall-${fallingItemIdRef.current++}`;
      const now = Date.now();
      const shouldSpawnPotion = now >= nextPotionSpawnAtRef.current;
      const roll = Math.random();
      const type = shouldSpawnPotion ? "potion" : roll < 0.64 ? "petal" : "bug";
      const duration =
        type === "potion"
          ? 900 + Math.floor(Math.random() * 180)
          : 2600 + Math.floor(Math.random() * 1800);
      const direction = Math.random() < 0.5 ? "left-to-right" : "right-to-left";

      if (type === "potion") {
        nextPotionSpawnAtRef.current = now + 4000 + Math.random() * 3000;
      }

      const item: FallingItem = {
        id: nextId,
        type,
        x:
          type === "petal"
            ? 6 + Math.random() * 82
            : type === "bug"
              ? direction === "left-to-right"
                ? -10
                : 100
              : 14 + Math.random() * 72,
        y: type === "petal" ? 0 : type === "bug" ? 16 + Math.random() * 56 : 18 + Math.random() * 42,
        size:
          type === "potion"
            ? 42 + Math.floor(Math.random() * 12)
            : 36 + Math.floor(Math.random() * 28),
        duration,
        drift: type === "potion" ? 0 : -42 + Math.random() * 84,
        wiggle: type === "potion" ? 0 : 18 + Math.random() * 34,
        startRotation: type === "potion" ? -10 + Math.random() * 20 : -24 + Math.random() * 48,
        endRotation: type === "potion" ? -8 + Math.random() * 16 : -90 + Math.random() * 180,
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
    () => (mode === "tap" ? savedPetalPreview : [...existingPetals, ...savedPetalPreview]),
    [existingPetals, mode, savedPetalPreview],
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

    const burstPetals = Array.from({ length: 6 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 6;
      const ringDistance = 34 + Math.random() * 12;

      return {
        id: `tap-burst-${tapBurstIdRef.current++}`,
        xPercent: position.xPercent,
        yPercent: position.yPercent,
        ringX: Math.cos(angle) * ringDistance,
        ringY: Math.sin(angle) * ringDistance * 0.7,
        rise: -34 - Math.random() * 16,
        drop: 70 + Math.random() * 40,
        duration: 850 + Math.floor(Math.random() * 250),
        rotationStart: -30 + Math.random() * 60,
        rotationEnd: -120 + Math.random() * 240,
      } satisfies TapBurstPetal;
    });

    setTapBursts((current) => [...current, ...burstPetals]);
    burstPetals.forEach((petal) => {
      window.setTimeout(() => {
        setTapBursts((current) => current.filter((item) => item.id !== petal.id));
      }, petal.duration + 120);
    });

    setPlacedPetals((current) => [
      ...current,
      createDraftPetal(position.xPercent, position.yPercent),
    ]);
  }

  function handleFallingItemClick(item: FallingItem) {
    if (mode !== "fall" || isFinished) {
      return;
    }

    if (item.type === "bug") {
      setFallScore((current) => Math.max(0, current - 2));
    } else if (item.type === "potion") {
      setTimeLeft((current) => current + 3);
    } else {
      setPlacedPetals((current) => [
        ...current,
        createDraftPetal(20 + Math.random() * 60, 22 + Math.random() * 46),
      ]);
      setFallScore((current) => current + 10);
    }

    setFallingItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
  }

  function handleApplyScore() {
    startSavingTransition(async () => {
      const baseScore = mode === "fall" ? fallScore : placedPetals.length;
      const finalScore = baseScore + shareBonus;

      if (mode !== "tap" && placedPetals.length > 0) {
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

      await applyGameScore(schoolId, finalScore);
      router.push(`/main?score=${finalScore}`);
    });
  }

  function handleRestart() {
    setTimeLeft(GAME_DURATION);
    setIsFinished(false);
    setPlacedPetals([]);
    setFallingItems([]);
    setTapBursts([]);
    setFallScore(0);
    setShareBonus(0);
    setHasAppliedShareBonus(false);
  }

  function handleCloseGame() {
    router.push("/game/select");
  }

  function handleHudPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  const currentScore = mode === "fall" ? fallScore : placedPetals.length;
  const currentSchool = schools.find((item) => item.id === schoolId) ?? null;
  const currentSchoolIndex = schools.findIndex((item) => item.id === schoolId);
  const previousSchool =
    currentSchoolIndex > 0 ? schools[currentSchoolIndex - 1] : null;

  const resultTitle = mode === "fall" ? "벚꽃 캐치 종료" : "벚꽃 톡톡 종료";
  const finalAppliedScore = currentScore + shareBonus;

  async function handleShareResult() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/main`;

    if (!shareUrl) {
      return;
    }

    const shareRankText = currentSchool ? `${currentSchool.rank}위` : "순위";
    const shareText = `[${schoolName}] 방금 미니게임으로 벚꽃 ${currentScore.toLocaleString()}개 획득. 이번 시즌 ${shareRankText} 굳히는 중. 같이 들어와서 우리 학교 도와줘!!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${schoolName} 벚꽃살리기 결과`,
          text: shareText,
          url: shareUrl,
        });
        if (!hasAppliedShareBonus && currentScore > 0) {
          const bonus = currentScore;
          setShareBonus(bonus);
          setHasAppliedShareBonus(true);
          return;
        }

        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    } catch {
    }
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        mode === "tap" ? "text-white" : "text-stone-900"
      }`}
    >
      <div
        className={`relative z-10 mx-auto flex min-h-screen w-full flex-col px-4 py-5 ${
          mode === "tap" ? "max-w-[84rem] text-white" : "max-w-5xl"
        }`}
      >
        <section className={`relative flex flex-1 flex-col items-stretch justify-center ${mode === "tap" ? "py-2" : "py-8 sm:py-10"}`}>
          <div
            className={`relative h-full min-h-[65vh] w-full ${
              mode === "tap"
                ? "mt-4 min-h-[82vh] overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] shadow-[0_24px_80px_rgba(120,73,96,0.18)] sm:mt-6 sm:min-h-[88vh]"
                : "mt-4 min-h-[74vh] overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.24))] shadow-[0_24px_80px_rgba(120,73,96,0.12)] sm:mt-6 sm:min-h-[78vh]"
            }`}
          >
            {mode === "fall" ? (
              <>
                <div className="absolute inset-x-0 top-0 z-20 flex h-16 items-center border-b border-sky-400/80 bg-[linear-gradient(180deg,#9ed8ff,#69bfff)] px-4 sm:h-[68px] sm:px-5">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full border border-white/80 bg-white/82 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-sky-700 shadow-[0_6px_18px_rgba(91,141,176,0.16)]">
                        BLOSSOM CATCH
                      </div>
                      <div className="hidden translate-y-1 items-center gap-1.5 sm:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500/95" />
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-400/95" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="minimize"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90 bg-white text-stone-500 shadow-[0_4px_12px_rgba(91,141,176,0.14)]"
                      >
                        <span className="block h-[2px] w-3 rounded-full bg-stone-400" />
                      </button>
                      <button
                        type="button"
                        aria-label="maximize"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90 bg-white text-stone-500 shadow-[0_4px_12px_rgba(91,141,176,0.14)]"
                      >
                        <span className="relative block h-3.5 w-3.5">
                          <span className="absolute right-0 top-0 h-3 w-3 rounded-[2px] border border-stone-400 bg-white" />
                          <span className="absolute bottom-0 left-0 h-3 w-3 rounded-[2px] border border-stone-400 bg-white" />
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="close"
                        onClick={handleCloseGame}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200/90 bg-rose-300 text-white shadow-[0_4px_12px_rgba(244,114,182,0.18)] transition-colors duration-150 hover:bg-rose-400 active:bg-rose-500"
                      >
                        <span className="text-sm font-bold leading-none">×</span>
                      </button>
                    </div>
                  </div>
                </div>

              </>
            ) : (
              <div className="absolute inset-x-0 top-0 z-20 flex h-16 items-center border-b border-rose-200/70 bg-[linear-gradient(180deg,#ffe6f2,#ffbfd8)] px-4 sm:h-[68px] sm:px-5">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/80 bg-white/82 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-rose-600 shadow-[0_6px_18px_rgba(202,88,135,0.18)]">
                      BLOSSOM TAP
                    </div>
                    <div className="hidden translate-y-1 items-center gap-1.5 sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-300/95" />
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-400/95" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="minimize"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90 bg-white text-stone-500 shadow-[0_4px_12px_rgba(202,88,135,0.18)]"
                    >
                      <span className="block h-[2px] w-3 rounded-full bg-stone-400" />
                    </button>
                    <button
                      type="button"
                      aria-label="maximize"
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90 bg-white text-stone-500 shadow-[0_4px_12px_rgba(202,88,135,0.18)]"
                    >
                      <span className="relative block h-3.5 w-3.5">
                        <span className="absolute right-0 top-0 h-3 w-3 rounded-[2px] border border-stone-400 bg-white" />
                        <span className="absolute bottom-0 left-0 h-3 w-3 rounded-[2px] border border-stone-400 bg-white" />
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="close"
                      onClick={handleCloseGame}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200/90 bg-rose-300 text-white shadow-[0_4px_12px_rgba(244,114,182,0.18)] transition-colors duration-150 hover:bg-rose-400 active:bg-rose-500"
                    >
                      <span className="text-sm font-bold leading-none">×</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === "fall" ? (
              <div className="absolute inset-x-4 bottom-4 top-20 overflow-hidden rounded-[1.7rem] border border-white/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,255,255,0.24))] select-none touch-none sm:inset-x-5 sm:bottom-5 sm:top-[88px]">
                <div
                  onPointerDown={handleHudPointerDown}
                  className="absolute inset-x-0 top-0 z-20 flex select-none items-center justify-between px-5 py-4 sm:px-6"
                >
                  <div className="text-stone-900">
                    <p className="text-2xl font-black sm:text-3xl">
                      {timeLeft}
                      <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">
                        초
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-stone-900">
                    <p className="text-2xl font-black sm:text-3xl">
                      {currentScore}
                      <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">
                        점
                      </span>
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
                {fallingItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleFallingItemClick(item)}
                    disabled={isFinished}
                    draggable={false}
                    className={`falling-item absolute left-0 top-0 z-10 flex items-center justify-center rounded-full border text-base font-semibold shadow-lg ${
                      item.type === "petal"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : item.type === "bug"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-sky-200 bg-sky-50 text-sky-600"
                    } ${isFinished ? "opacity-50" : ""}`}
                    style={
                      {
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: `${item.size}px`,
                        height: `${item.size}px`,
                        animation: `${
                          item.type === "petal"
                            ? "petal-float"
                            : item.type === "bug"
                              ? "bug-fly"
                              : "potion-pop"
                        } ${item.duration}ms ${item.type === "potion" ? "ease-in-out" : "linear"} forwards`,
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
                    {item.type === "petal" ? "🌸" : item.type === "bug" ? "🐝" : "⏰"}
                  </button>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(214,162,177,0),rgba(151,99,125,0.22))]" />
              </div>
            ) : (
              <div
                ref={boardRef}
                onPointerDown={handleBoardClick}
                className="absolute inset-x-4 bottom-4 top-20 overflow-hidden rounded-[1.7rem] select-none touch-none sm:inset-x-5 sm:bottom-5 sm:top-[88px]"
              >
                <TreeScene
                  treeLevel={treeLevel}
                  petals={combinedPetals}
                  fillContainer
                  className="h-full w-full overflow-hidden rounded-[1.7rem]"
                />
                <div
                  onPointerDown={handleHudPointerDown}
                  className="absolute inset-x-0 top-0 z-20 flex select-none items-center justify-between px-7 py-4 sm:px-9"
                >
                  <div className="text-stone-900">
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-stone-500 sm:text-xs">남은 시간</p>
                    <p className="mt-1 text-2xl font-black sm:text-3xl">
                      {timeLeft}
                      <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">초</span>
                    </p>
                  </div>
                  <div className="text-right text-stone-900">
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-stone-500 sm:text-xs">현재 점수</p>
                    <p className="mt-1 text-2xl font-black sm:text-3xl">
                      {currentScore}
                      <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">점</span>
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(214,162,177,0),rgba(151,99,125,0.22))]" />
                {tapBursts.map((petal) => (
                  <span
                    key={petal.id}
                    className="pointer-events-none absolute z-30"
                    style={{
                      left: `${petal.xPercent}%`,
                      top: `${petal.yPercent}%`,
                    }}
                  >
                    <span
                      className="absolute block text-[28px] tap-burst-petal"
                      style={
                        {
                          animationDuration: `${petal.duration}ms`,
                          "--tap-ring-x": `${petal.ringX}px`,
                          "--tap-ring-y": `${petal.ringY}px`,
                          "--tap-rise": `${petal.rise}px`,
                          "--tap-drop": `${petal.drop}px`,
                          "--tap-rotate-start": `${petal.rotationStart}deg`,
                          "--tap-rotate-end": `${petal.rotationEnd}deg`,
                        } as CSSProperties
                      }
                    >
                      🌸
                    </span>
                  </span>
                ))}
              </div>
            )}

            {isFinished ? (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 text-center text-stone-900 shadow-2xl">
                  <div className="relative">
                    <h2 className="text-3xl font-bold">{resultTitle}</h2>
                    <div className="mt-5 rounded-[1.6rem] border border-stone-200 bg-stone-50 px-5 py-6">
                      <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">
                        게임 결과
                      </p>
                      <p className="mt-3 text-5xl font-black tracking-[-0.05em] text-stone-900 sm:text-6xl">
                        {finalAppliedScore}
                        <span className="ml-2 text-2xl font-bold text-rose-500 sm:ml-3 sm:text-3xl">
                          점
                        </span>
                      </p>
                    </div>
                    {currentSchool ? (
                      <p className="mt-5 text-sm text-stone-500">
                        현재 {schoolName}{topicParticle(schoolName)} {currentSchool.rank}위예요!
                        {previousSchool
                          ? ` 바로 위에 ${previousSchool.name}${subjectParticle(previousSchool.name)} 있어요.`
                          : ""}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleShareResult}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700 transition-transform duration-200 hover:scale-[1.02]"
                    >
                      친구에게 공유하고 점수 더 받기
                    </button>
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700 transition-transform duration-200 hover:scale-[1.02]"
                    >
                      다시하기
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyScore}
                      disabled={isSaving}
                      className="rounded-2xl bg-stone-900 px-4 py-4 text-center text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
                    >
                      메인으로
                    </button>
                    </div>
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
