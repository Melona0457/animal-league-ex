"use client";

import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { TreeScene } from "../../_components/tree-scene";
import { createAttackLog } from "../../_lib/attack-log";
import {
  getDefaultSchoolRecords,
  getLevelLabel,
  getSchoolBackgroundImage,
  getSchoolLogoImage,
  getTreeStage,
  type SchoolRecord,
} from "../../_lib/mock-data";
import {
  getPetalsBySchoolId,
  shakePetals,
  type PetalPlacement,
  type ShakePetalResult,
} from "../../_lib/petal-state";
import { applyShake, getStoredSchoolById, getStoredSchools } from "../../_lib/school-state";

type SchoolDetailClientProps = {
  schoolId: string;
  fromSchoolId: string;
  shakenCount: number;
};

function NearbySchoolRow({
  school,
  gap,
}: {
  school: SchoolRecord | null;
  gap: number;
}) {
  if (!school) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-2 text-white/45">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px]">
          -
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium">경쟁 학교 없음</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
          <img
            src={getSchoolLogoImage(school.id)}
            alt={`${school.name} 로고`}
            className="h-full w-full object-contain"
            onError={(event) => {
              const image = event.currentTarget;

              if (image.dataset.fallbackApplied === "true") {
                image.style.display = "none";
                return;
              }

              image.dataset.fallbackApplied = "true";
              image.src = `/images/schools/${school.id}/logo.webp`;
            }}
          />
          <span className="hidden text-[10px] text-white/45">로고</span>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-white/55">#{school.rank}</p>
          <p className="truncate text-sm font-semibold text-white">{school.name}</p>
        </div>
      </div>
      <p className="shrink-0 text-[11px] text-rose-100/80">{gap.toLocaleString()}표</p>
    </div>
  );
}

export function SchoolDetailClient({
  schoolId,
  fromSchoolId,
  shakenCount,
}: SchoolDetailClientProps) {
  const fallingPetalIdRef = useRef(0);
  const [petals, setPetals] = useState<PetalPlacement[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [school, setSchool] = useState<SchoolRecord | undefined>(
    getDefaultSchoolRecords().find((item) => item.id === schoolId),
  );
  const [shakeMode, setShakeMode] = useState<"idle" | "countdown" | "result">("idle");
  const [shakeSeconds, setShakeSeconds] = useState(8);
  const [shakeCount, setShakeCount] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const [reducedScore, setReducedScore] = useState(0);
  const [shakeResult, setShakeResult] = useState<ShakePetalResult | null>(null);
  const [shareNotice, setShareNotice] = useState("");
  const [shareBonusDamage, setShareBonusDamage] = useState(0);
  const [hasAppliedShareBonus, setHasAppliedShareBonus] = useState(false);
  const [fallingPetals, setFallingPetals] = useState<
    Array<{
      id: string;
      xPercent: number;
      yPercent: number;
      drift: number;
      duration: number;
      rotationStart: number;
      rotationEnd: number;
    }>
  >([]);
  const lastMotionRef = useRef(0);

  const spawnShakePetals = useCallback((count = 1) => {
    const nextPetals = Array.from({ length: count }, () => ({
      id: `shake-fall-${fallingPetalIdRef.current++}`,
      xPercent: 28 + Math.random() * 44,
      yPercent: 6 + Math.random() * 10,
      drift: -52 + Math.random() * 104,
      duration: 1100 + Math.floor(Math.random() * 700),
      rotationStart: -35 + Math.random() * 70,
      rotationEnd: -120 + Math.random() * 240,
    }));

    setFallingPetals((current) => [...current, ...nextPetals]);

    nextPetals.forEach((petal) => {
      window.setTimeout(() => {
        setFallingPetals((current) => current.filter((item) => item.id !== petal.id));
      }, petal.duration + 160);
    });
  }, []);

  const registerShakeInput = useCallback((petalBurst = 2) => {
    if (shakeMode !== "countdown") {
      return;
    }

    setShakeCount((current) => current + 1);
    spawnShakePetals(petalBurst);
  }, [shakeMode, spawnShakePetals]);

  useEffect(() => {
    let isActive = true;

    async function loadSchool() {
      const [storedSchool, storedPetals, storedSchools] = await Promise.all([
        getStoredSchoolById(schoolId),
        getPetalsBySchoolId(schoolId),
        getStoredSchools(),
      ]);
      const fallbackSchool =
        storedSchool ?? getDefaultSchoolRecords().find((item) => item.id === schoolId);

      if (isActive) {
        setSchool(fallbackSchool);
        setPetals(storedPetals);
        setSchools(storedSchools);
      }
    }

    loadSchool();

    return () => {
      isActive = false;
    };
  }, [schoolId, shakenCount]);

  useEffect(() => {
    if (shakeMode !== "countdown") {
      return;
    }

    async function requestMotionPermissionIfNeeded() {
      const requestPermission = (
        DeviceMotionEvent as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        }
      ).requestPermission;

      if (typeof requestPermission === "function") {
        await requestPermission().catch(() => null);
      }
    }

    void requestMotionPermissionIfNeeded();

    function handleMotion(event: DeviceMotionEvent) {
      const acceleration = event.accelerationIncludingGravity;

      if (!acceleration) {
        return;
      }

      const power =
        Math.abs(acceleration.x ?? 0) +
        Math.abs(acceleration.y ?? 0) +
        Math.abs(acceleration.z ?? 0);

      if (power < 28) {
        return;
      }

      const now = Date.now();

      if (now - lastMotionRef.current < 220) {
        return;
      }

      lastMotionRef.current = now;
      registerShakeInput(1 + Math.floor(Math.random() * 2));
    }

    const timer = window.setInterval(() => {
      setShakeSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [shakeMode, registerShakeInput]);

  useEffect(() => {
    if (shakeMode !== "countdown") {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space") {
        return;
      }

      event.preventDefault();
      registerShakeInput(2);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shakeMode, registerShakeInput]);

  useEffect(() => {
    if (shakeMode !== "countdown" || shakeSeconds > 0) {
      return;
    }

    void (async () => {
      const result = await shakePetals(schoolId, shakeCount);
      const scorePenalty = Math.max(1, shakeCount);
      await applyShake(schoolId, scorePenalty);
      await createAttackLog({
        attackerSchoolId: fromSchoolId,
        targetSchoolId: schoolId,
        reducedPetals: scorePenalty,
      });
      const nextSchool = await getStoredSchoolById(schoolId);
      setPetals(result.petals);
      setSchool(nextSchool);
      setDroppedCount(result.removedCount);
      setReducedScore(scorePenalty);
      setShakeResult(result);
      setFallingPetals([]);
      setShakeMode("result");
    })();
  }, [fromSchoolId, shakeMode, shakeSeconds, schoolId, shakeCount]);

  function handleShakeStart() {
    setShakeCount(0);
    setDroppedCount(0);
    setReducedScore(0);
    setShakeResult(null);
    setShareNotice("");
    setShareBonusDamage(0);
    setHasAppliedShareBonus(false);
    setFallingPetals([]);
    setShakeSeconds(8);
    setShakeMode("countdown");
  }

  async function handleShareAttackResult() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/schools/${schoolId}?fromSchoolId=${fromSchoolId}`;

    if (!shareUrl) {
      return;
    }

    const shareText = `${school.name} 방금 ${reducedScore}점 털었다. 지금 들어와서 같이 흔들어.`;

    async function applyShareBonusIfNeeded() {
      if (hasAppliedShareBonus || reducedScore <= 0) {
        return false;
      }

      const bonusDamage = reducedScore * 3;
      await applyShake(schoolId, bonusDamage);
      await createAttackLog({
        attackerSchoolId: fromSchoolId,
        targetSchoolId: schoolId,
        reducedPetals: bonusDamage,
      });
      const nextSchool = await getStoredSchoolById(schoolId);

      setSchool(nextSchool);
      setShareBonusDamage(bonusDamage);
      setHasAppliedShareBonus(true);
      return true;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${school.name} 방해 결과`,
          text: shareText,
          url: shareUrl,
        });
        const applied = await applyShareBonusIfNeeded();
        setShareNotice(
          applied
            ? `공유했고 추가 피해 ${shareBonusDamage || reducedScore * 3}점을 더 넣었어요.`
            : "공유창을 열었어요.",
        );
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      const applied = await applyShareBonusIfNeeded();
      setShareNotice(
        applied
          ? `링크를 복사했고 추가 피해 ${shareBonusDamage || reducedScore * 3}점을 더 넣었어요.`
          : "공유 문구와 링크를 복사했어요.",
      );
    } catch {
      setShareNotice("공유를 완료하지 못했어요. 다시 시도해주세요.");
    }
  }

  if (!school) {
    return null;
  }

  const currentIndex = schools.findIndex((item) => item.id === school.id);
  const previousSchool = currentIndex > 0 ? schools[currentIndex - 1] : null;
  const nextSchool =
    currentIndex >= 0 && currentIndex < schools.length - 1 ? schools[currentIndex + 1] : null;
  const gapToPrevious = previousSchool
    ? Math.max(0, previousSchool.totalPetals - school.totalPetals)
    : 0;
  const gapToNext = nextSchool
    ? Math.max(0, school.totalPetals - nextSchool.totalPetals)
    : 0;

  return (
    <main
      className="min-h-screen bg-stone-900 px-4 py-5 text-white"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(34, 18, 26, 0.28), rgba(34, 18, 26, 0.72)), url('${getSchoolBackgroundImage(school.id)}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="grid grid-cols-[0.9fr_1.4fr_0.7fr] gap-2 rounded-[1.75rem] border border-white/15 bg-black/22 p-3 backdrop-blur-sm sm:gap-3 sm:p-4">
          <div className="flex flex-col justify-between px-3 py-3">
            <NearbySchoolRow school={previousSchool} gap={gapToPrevious} />
            <div className="py-3 text-center">
              <p className="text-[11px] font-medium text-white/65 sm:text-xs">현재 순위</p>
              <p className="mt-1 text-xl font-bold sm:text-3xl">#{school.rank}</p>
            </div>
            <NearbySchoolRow school={nextSchool} gap={gapToNext} />
          </div>
          <div className="px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-white/65 sm:text-xs">레벨</p>
                <p className="mt-1 text-base font-bold sm:text-2xl">
                  {getLevelLabel(school.level)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-[11px] text-white/65 sm:text-xs">
                총 벚꽃 수 {school.totalPetals.toLocaleString()}
              </p>
              <div className="relative h-7 overflow-hidden rounded-full bg-white/12 sm:h-8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#fda4af_0%,#fb7185_50%,#fecdd3_100%)] transition-[width] duration-700"
                  style={{ width: `${school.progressPercent}%` }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold leading-none text-stone-950 sm:text-xs">
                  {school.progressPercent.toFixed(0)}%
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-white/65 sm:text-xs">
                <span>{getLevelLabel(school.level)}</span>
                <span>{school.level >= 5 ? "만개" : `LV.${school.level + 1}`}</span>
              </div>
            </div>
          </div>
          <Link
            href={`/ranking?schoolId=${fromSchoolId}`}
            className="flex items-center justify-end px-3 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-medium text-white/65 sm:text-xs">돌아가기</p>
              <p className="mt-1 text-lg font-bold sm:text-2xl">목록</p>
            </div>
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
            <p className="mb-3 rounded-full bg-black/30 px-4 py-2 text-xs text-white/75 backdrop-blur-sm">
              {school.name} · {getTreeStage(school.bloomRate)}
            </p>
            <div className="flex h-[calc(100vh-15rem)] min-h-[560px] w-full items-end justify-center">
              <TreeScene treeLevel={school.level} petals={petals} className="w-full max-w-[1160px]">
                {shakeMode === "countdown"
                  ? fallingPetals.map((petal) => (
                      <span
                        key={petal.id}
                        className="pointer-events-none absolute z-20 text-2xl shake-falling-petal"
                        style={
                          {
                            left: `${petal.xPercent}%`,
                            top: `${petal.yPercent}%`,
                            animationDuration: `${petal.duration}ms`,
                            "--shake-petal-drift": `${petal.drift}px`,
                            "--shake-petal-drop": "460px",
                            "--shake-petal-rotate-start": `${petal.rotationStart}deg`,
                            "--shake-petal-rotate-end": `${petal.rotationEnd}deg`,
                          } as CSSProperties
                        }
                      >
                        🌸
                      </span>
                    ))
                  : null}
                <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                  <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                    현재 붙은 벚꽃 {petals.length}개
                  </div>
                </div>
              </TreeScene>
            </div>
          </div>
        </section>

        <section className="space-y-3 pb-2">
          <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white/85 backdrop-blur-sm">
            다른 학교를 8초 동안 흔들어 벚꽃잎을 떨어뜨려보세요. 현재 확인용 사용 횟수: {shakenCount}회
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleShakeStart}
              className="rounded-3xl bg-rose-400 px-4 py-4 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
            >
              흔들기 사용하기
            </button>
            <Link
              href={`/main?schoolId=${fromSchoolId}`}
              className="rounded-3xl border border-white/20 bg-white/10 px-4 py-4 text-center text-base font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
            >
              내 학교로 돌아가기
            </Link>
          </div>
        </section>
      </div>

      {shakeMode === "countdown" ? (
        <>
          <button
            type="button"
            onPointerDown={() => registerShakeInput(2 + Math.floor(Math.random() * 2))}
            className="fixed inset-0 z-40 bg-transparent"
            aria-label="화면 아무 곳이나 눌러 흔들기"
          />
          <div className="pointer-events-none fixed inset-x-4 top-6 z-50 flex justify-center">
            <div className="w-full max-w-lg rounded-[2rem] border border-white/15 bg-stone-950/68 p-5 text-center text-white backdrop-blur-md">
              <p className="text-sm font-semibold tracking-[0.24em] text-rose-300">SHAKE MODE</p>
              <h2 className="mt-3 text-3xl font-bold">지금 흔들어주세요</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                화면 어디든 터치하거나 스페이스바를 누르거나, 휴대폰을 흔들면 바로 꽃이 떨어져요.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <div>
                  <p className="text-xs text-white/55">남은 시간</p>
                  <p className="mt-2 text-3xl font-bold">{shakeSeconds}s</p>
                </div>
                <div>
                  <p className="text-xs text-white/55">흔든 횟수</p>
                  <p className="mt-2 text-3xl font-bold">{shakeCount}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {shakeMode === "result" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-stone-950/92 p-6 text-center text-white backdrop-blur-sm">
            <p className="text-sm font-semibold tracking-[0.24em] text-rose-300">RESULT</p>
            <h2 className="mt-3 text-3xl font-bold">시간이 다 되었어요</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {shakeResult?.reason === "removed" ? (
                <>
                  이번 방해로{" "}
                  <span className="font-semibold text-white">{reducedScore}</span>점만큼 벚꽃 수가
                  줄었고, 저장된 꽃잎{" "}
                  <span className="font-semibold text-white">{droppedCount}개</span>가 떨어졌어요.
                </>
              ) : shakeResult?.reason === "no_petals" ? (
                <>
                  이번 방해로{" "}
                  <span className="font-semibold text-white">{reducedScore}</span>점만큼 벚꽃 수가
                  줄었어요. 아직 이 학교에 저장된 꽃잎이 없어서 화면에서 떨어진 꽃잎은 0개예요.
                </>
              ) : shakeResult?.reason === "delete_failed" ? (
                <>
                  이번 방해로{" "}
                  <span className="font-semibold text-white">{reducedScore}</span>점만큼 벚꽃 수가
                  줄었지만, 저장된 꽃잎 삭제는 실패했어요.
                </>
              ) : (
                shakeResult?.message ?? "이번 방해 결과를 불러오지 못했어요."
              )}
            </p>
            <p className="mt-3 text-xs leading-5 text-white/55">
              총 감소 점수 {reducedScore + shareBonusDamage}
              {shareBonusDamage > 0 ? ` · 공유 보너스 +${shareBonusDamage}` : ""}
            </p>
            {shakeResult?.reason === "no_petals" ? (
              <p className="mt-3 text-xs leading-5 text-white/50">
                참고: 나무 이미지에 원래 그려진 꽃은 제외되고, 게임으로 실제 저장된 꽃잎만
                흔들기 연출로 떨어집니다.
              </p>
            ) : null}
            {shareNotice ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {shareNotice}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleShareAttackResult}
                disabled={hasAppliedShareBonus && reducedScore > 0}
                className="rounded-2xl border border-white/15 px-4 py-4 text-sm font-semibold text-white"
              >
                {hasAppliedShareBonus && reducedScore > 0
                  ? "공유 보너스 반영 완료"
                  : "친구에게 결과 공유하기"}
              </button>
              <button
                type="button"
                onClick={() => setShakeMode("idle")}
                className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-stone-950"
              >
                확인
              </button>
              <Link
                href={`/ranking?schoolId=${fromSchoolId}`}
                className="rounded-2xl border border-white/15 px-4 py-4 text-sm font-semibold text-white"
              >
                모아보기로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
