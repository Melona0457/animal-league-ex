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
import { applyGameScore, getStoredSchools } from "../_lib/school-state";
import {
  getTreeStage,
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

export function GameClient({ schoolId, schoolName, treeLevel, mode }: GameClientProps) {
  const router = useRouter();
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draftIdRef = useRef(0);
  const fallingItemIdRef = useRef(0);
  const tapBurstIdRef = useRef(0);
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
  const [shareNotice, setShareNotice] = useState("");
  const [shareBonus, setShareBonus] = useState(0);
  const [hasAppliedShareBonus, setHasAppliedShareBonus] = useState(false);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      const [petals, storedSchools] = await Promise.all([
        getPetalsBySchoolId(schoolId),
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
    () => (mode === "tap" ? existingPetals : [...existingPetals, ...savedPetalPreview]),
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
      router.push(`/main?schoolId=${schoolId}&score=${finalScore}`);
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
    setShareNotice("");
  }

  const currentScore = mode === "fall" ? fallScore : placedPetals.length;
  const currentSchool = schools.find((item) => item.id === schoolId) ?? null;
  const currentSchoolIndex = schools.findIndex((item) => item.id === schoolId);
  const previousSchool =
    currentSchoolIndex > 0 ? schools[currentSchoolIndex - 1] : null;

  const modeTitle =
    mode === "fall"
      ? "클래식 낙하형"
      : "터치로 바로 붙이기";

  const modeGuide =
    mode === "fall"
      ? "위에서 떨어지는 벚꽃은 잡고 벌레는 피하면서 점수를 모으세요."
      : "메인 화면처럼 보이는 나무 위를 터치하면 벚꽃이 퍼졌다가 떨어지며 점수가 올라가요.";

  const resultDescription =
    mode === "fall"
      ? `이번 판 점수는 ${currentScore}점이에요. 벚꽃은 +10점, 벌은 -2점으로 반영됐어요.`
      : `이번 판에서 ${placedPetals.length}번 터치해 벚꽃 연출과 함께 점수를 올렸어요.`;
  const finalAppliedScore = currentScore + shareBonus;

  async function handleShareResult() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/main?schoolId=${schoolId}`;

    if (!shareUrl) {
      return;
    }

    const rivalryLine = previousSchool
      ? `${previousSchool.name} 추격 중.`
      : "이번 시즌 1등 굳히는 중.";
    const shareText =
      mode === "fall"
        ? `${schoolName} 방금 클래식 낙하형에서 ${currentScore}점 획득. ${rivalryLine} 같이 들어와서 벚꽃 붙여줘.`
        : `${schoolName} 방금 터치 벚꽃 연출로 ${currentScore}점 획득. ${rivalryLine} 같이 들어와서 우리 학교 밀어줘.`;

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
          setShareNotice(`결과를 공유했고 공유 보너스 +${bonus}점을 얻었어요.`);
          return;
        }

        setShareNotice("결과 공유창을 열었어요.");
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      if (!hasAppliedShareBonus && currentScore > 0) {
        const bonus = currentScore;
        setShareBonus(bonus);
        setHasAppliedShareBonus(true);
        setShareNotice(`공유 문구와 링크를 복사했고 공유 보너스 +${bonus}점을 얻었어요.`);
        return;
      }

      setShareNotice("공유 문구와 링크를 복사했어요.");
    } catch {
      setShareNotice("공유를 완료하지 못했어요. 다시 시도해주세요.");
    }
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        mode === "tap" ? "text-white" : "text-stone-900"
      }`}
    >
      <div className={`relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 ${mode === "tap" ? "text-white" : ""}`}>
        <header
          className={`grid grid-cols-[0.9fr_1.4fr_0.7fr] gap-2 rounded-[1.75rem] border p-3 backdrop-blur-sm sm:gap-3 sm:p-4 ${
            mode === "tap"
              ? "border-white/15 bg-black/22"
              : "border-white/70 bg-white/35"
          }`}
        >
          <div className="px-3 py-3">
            <p className={`text-[11px] font-medium sm:text-xs ${mode === "tap" ? "text-white/65" : "text-stone-500"}`}>남은 시간</p>
            <p className="mt-1 text-xl font-bold sm:text-3xl">{timeLeft}s</p>
            <p className={`mt-2 text-[11px] sm:text-xs ${mode === "tap" ? "text-white/55" : "text-stone-500"}`}>{modeTitle}</p>
          </div>
          <div className="px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-[11px] font-medium sm:text-xs ${mode === "tap" ? "text-white/65" : "text-stone-500"}`}>현재 점수</p>
                <p className="mt-1 text-xl font-bold sm:text-3xl">{currentScore}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                  mode === "tap"
                    ? "bg-white/10 text-rose-100"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {mode === "fall" ? "클래식" : "터치"}
              </span>
            </div>
            <p className={`mt-3 text-[11px] leading-5 sm:text-xs ${mode === "tap" ? "text-white/55" : "text-stone-500"}`}>{modeGuide}</p>
          </div>
          <Link
            href={`/game/select?schoolId=${schoolId}`}
            className="flex items-center justify-end px-3 py-3 text-left"
          >
            <div>
              <p className={`text-[11px] font-medium sm:text-xs ${mode === "tap" ? "text-white/65" : "text-stone-500"}`}>다시 선택</p>
              <p className="mt-1 text-lg font-bold sm:text-2xl">모드</p>
            </div>
          </Link>
        </header>

        <section className={`relative flex flex-1 flex-col items-stretch justify-center ${mode === "tap" ? "py-2" : "py-4"}`}>
          <div
            className={`relative h-full min-h-[65vh] w-full ${
              mode === "tap"
                ? ""
                : "overflow-hidden rounded-[2.5rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.18))] shadow-[0_24px_80px_rgba(120,73,96,0.12)]"
            }`}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-rose-500">MINI GAME</p>
                <h1 className="mt-1 text-2xl font-bold">{schoolName} 벚꽃 붙이기</h1>
              </div>
              <p className={`text-sm ${mode === "tap" ? "text-white/70" : "text-stone-500"}`}>
                {mode === "fall" ? `현재 점수 ${currentScore}점` : `배치 완료 ${placedPetals.length}개`}
              </p>
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
                className="absolute inset-0"
              >
                <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
                  <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
                    {schoolName} · {getTreeStage(currentSchool?.bloomRate ?? 0)}
                  </div>
                </div>
                <div className="flex h-[calc(100vh-14rem)] min-h-[620px] w-full items-end justify-center">
                  <TreeScene treeLevel={treeLevel} petals={combinedPetals} fillContainer className="min-h-full w-full" />
                </div>
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
                <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/92 p-6 text-center text-stone-900 shadow-2xl">
                  <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">
                    RESULT
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">벚꽃 붙이기 종료</h2>
                  <p className="mt-4 text-base leading-7 text-stone-600">{resultDescription}</p>
                  <p className="mt-2 text-sm text-stone-500">
                    최종 반영 점수 {finalAppliedScore}점
                    {shareBonus > 0 ? ` · 공유 보너스 +${shareBonus}` : ""}
                  </p>
                  {currentSchool ? (
                    <p className="mt-2 text-sm text-stone-500">
                      현재 {schoolName} 순위는 #{currentSchool.rank}
                      {previousSchool ? `, 바로 위는 ${previousSchool.name}` : ""}
                    </p>
                  ) : null}
                  {shareNotice ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {shareNotice}
                    </div>
                  ) : null}
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleShareResult}
                      disabled={hasAppliedShareBonus && currentScore > 0}
                      className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700"
                    >
                      {hasAppliedShareBonus && currentScore > 0
                        ? "공유 보너스 반영 완료"
                        : "친구에게 결과 공유하기"}
                    </button>
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
          {mode === "tap" ? (
            <div className="mt-4 flex flex-col items-center gap-3 px-2">
              <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                터치 성공 {placedPetals.length}회
              </div>
              <div className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-white/15 bg-black/30 px-4 py-3 text-sm text-white/80 backdrop-blur-sm">
                누른 자리에서 벚꽃이 퍼졌다가 위로 뜬 뒤 아래로 떨어져요.
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
