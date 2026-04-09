"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { TreeScene } from "../../_components/tree-scene";
import { createAttackLog } from "../../_lib/attack-log";
import {
  getDefaultSchoolRecords,
  getLevelLabel,
  getSchoolBackgroundImage,
  getSchoolLogoImage,
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

function SchoolLogoImage({
  schoolId,
  schoolName,
  sizes = "80px",
}: {
  schoolId: string;
  schoolName: string;
  sizes?: string;
}) {
  const [variant, setVariant] = useState<"avif" | "webp" | "missing">("avif");
  const logoSrc =
    variant === "avif"
      ? getSchoolLogoImage(schoolId)
      : `/images/schools/${schoolId}/logo.webp`;

  if (variant === "missing") {
    return null;
  }

  return (
    <Image
      src={logoSrc}
      alt={`${schoolName} 로고`}
      fill
      unoptimized
      sizes={sizes}
      className="h-full w-full object-contain"
      onError={() => {
        setVariant((current) => {
          if (current === "avif") {
            return "webp";
          }

          return "missing";
        });
      }}
    />
  );
}

function NearbySchoolRow({
  school,
  gap,
}: {
  school: SchoolRecord | null;
  gap: number;
}) {
  if (!school) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/60 px-3 py-2 text-stone-500">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/70 text-[10px]">
          -
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold">경쟁 학교 없음</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200/80 bg-white/60 px-3 py-3 text-center">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200/80 bg-white/80">
        <SchoolLogoImage schoolId={school.id} schoolName={school.name} sizes="48px" />
        <span className="hidden text-[10px] text-stone-400">로고</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-stone-500">#{school.rank}</p>
        <p className="mt-1 truncate text-base font-semibold text-stone-800">{school.name}</p>
      </div>
      <p className="text-sm font-bold text-rose-500">{gap.toLocaleString()}개</p>
    </div>
  );
}

export function SchoolDetailClient({
  schoolId,
  fromSchoolId,
  shakenCount,
}: SchoolDetailClientProps) {
  const router = useRouter();
  const isOwnSchool = schoolId === fromSchoolId;
  const fallingPetalIdRef = useRef(0);
  const [petals, setPetals] = useState<PetalPlacement[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [school, setSchool] = useState<SchoolRecord | undefined>(
    getDefaultSchoolRecords().find((item) => item.id === schoolId),
  );
  const [shakeMode, setShakeMode] = useState<"idle" | "countdown" | "result">("idle");
  const [shakeSeconds, setShakeSeconds] = useState(8);
  const [shakeCount, setShakeCount] = useState(0);
  const [isResolvingShakeResult, setIsResolvingShakeResult] = useState(false);
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
  const shakeCountRef = useRef(0);
  const shakeResultLockRef = useRef(false);
  const shakeSessionRef = useRef(0);

  const spawnShakePetals = useCallback((count = 1) => {
    const nextPetals = Array.from({ length: count }, () => ({
      id: `shake-fall-${fallingPetalIdRef.current++}`,
      xPercent: 28 + Math.random() * 44,
      yPercent: 14 + Math.random() * 12,
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

  const registerShakeInput = useCallback(
    (petalBurst = 2) => {
      if (shakeMode !== "countdown" || shakeSeconds <= 0 || shakeResultLockRef.current) {
        return;
      }

      setShakeCount((current) => {
        const nextCount = current + 1;

        shakeCountRef.current = nextCount;
        return nextCount;
      });
      spawnShakePetals(petalBurst);
    },
    [shakeMode, shakeSeconds, spawnShakePetals],
  );

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

    void loadSchool();

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
          shakeResultLockRef.current = true;
          setIsResolvingShakeResult(true);
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

      if (event.repeat) {
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
    if (shakeMode !== "countdown" || shakeSeconds > 0 || !shakeResultLockRef.current) {
      return;
    }

    const activeSession = shakeSessionRef.current;
    const finalShakeCount = shakeCountRef.current;

    void (async () => {
      const result = await shakePetals(schoolId, finalShakeCount);
      const scorePenalty = Math.max(1, finalShakeCount);
      await applyShake(schoolId, scorePenalty);
      await createAttackLog({
        attackerSchoolId: fromSchoolId,
        targetSchoolId: schoolId,
        reducedPetals: scorePenalty,
      });
      const nextSchool = await getStoredSchoolById(schoolId);

      if (shakeSessionRef.current !== activeSession) {
        return;
      }

      setPetals(result.petals);
      setSchool(nextSchool);
      setDroppedCount(result.removedCount);
      setReducedScore(scorePenalty);
      setShakeResult(result);
      setFallingPetals([]);
      setIsResolvingShakeResult(false);
      setShakeMode("result");
    })();
  }, [fromSchoolId, shakeMode, shakeSeconds, schoolId]);

  function handleShakeStart() {
    if (isOwnSchool || shakeMode === "countdown") {
      return;
    }

    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }

    shakeSessionRef.current += 1;
    shakeResultLockRef.current = false;
    shakeCountRef.current = 0;
    setShakeCount(0);
    setIsResolvingShakeResult(false);
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

  function handleCloseSchoolDetail() {
    if (shakeMode === "countdown" || isResolvingShakeResult) {
      shakeResultLockRef.current = false;
      setIsResolvingShakeResult(false);
      setShakeCount(0);
      setShakeSeconds(8);
      setFallingPetals([]);
      setShakeMode("idle");
      return;
    }

    router.push(`/ranking?schoolId=${fromSchoolId}`);
  }

  function handleShakeOverlayPointerDown() {
    registerShakeInput(2 + Math.floor(Math.random() * 2));
  }

  async function handleShareAttackResult() {
    if (!school) {
      setShareNotice("학교 정보를 아직 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/schools/${schoolId}`;

    if (!shareUrl) {
      return;
    }

    const shareText = `${school.name} 방금 ${reducedScore}점 털었다. 지금 들어와서 같이 흔들어.`;

    async function applyShareBonusIfNeeded() {
      if (hasAppliedShareBonus || reducedScore <= 0) {
        return false;
      }

      const bonusDamage = reducedScore;
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
            ? `공유했고 추가 피해 ${shareBonusDamage || reducedScore}점을 더 넣었어요.`
            : "공유창을 열었어요.",
        );
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      const applied = await applyShareBonusIfNeeded();
      setShareNotice(
        applied
          ? `링크를 복사했고 추가 피해 ${shareBonusDamage || reducedScore}점을 더 넣었어요.`
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
    <main className="relative min-h-screen overflow-hidden bg-sky-200 px-4 py-8 text-white sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat blur-md brightness-110 saturate-110"
        style={{ backgroundImage: `url('${getSchoolBackgroundImage(school.id)}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,247,251,0.16),rgba(120,183,241,0.16)_22%,rgba(120,183,241,0.08)_62%,rgba(255,236,244,0.14)_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-100/55 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 left-10 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[84rem] flex-col sm:min-h-[calc(100vh-5rem)]">
        <section className="flex flex-1 flex-col py-2 sm:py-3">
          <div className="relative flex w-full flex-1 flex-col overflow-hidden rounded-[2.25rem] border border-white/35 bg-white/12 shadow-[0_26px_80px_rgba(65,91,145,0.22)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/25 bg-[linear-gradient(90deg,rgba(255,239,246,0.88),rgba(249,191,217,0.74),rgba(244,181,208,0.82))] px-4 py-3 text-stone-950 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-white/85 px-4 py-2 text-[11px] font-black tracking-[0.3em] text-rose-600 shadow-sm sm:text-xs">
                  BLOSSOM HOME
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/95" />
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-500/80" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/92 shadow-[0_8px_20px_rgba(209,122,156,0.14)]">
                  <span className="block h-[3px] w-5 rounded-full bg-stone-400" />
                </span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/92 shadow-[0_8px_20px_rgba(209,122,156,0.14)]">
                  <span className="relative block h-5 w-5">
                    <span className="absolute right-0 top-0 h-4 w-4 rounded-[4px] border-2 border-stone-400 bg-white" />
                    <span className="absolute bottom-0 left-0 h-4 w-4 rounded-[4px] border-2 border-stone-400 bg-white" />
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleCloseSchoolDetail}
                  aria-label="랭킹 페이지로 이동"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-300/92 shadow-[0_8px_20px_rgba(244,114,182,0.2)] transition-[transform,background-color] duration-150 hover:scale-[1.03] hover:bg-rose-400 active:bg-rose-500"
                >
                  <span className="text-[1.6rem] font-bold leading-none text-white">×</span>
                </button>
              </div>
            </div>
            <div className="relative flex flex-1 p-2 sm:p-3">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,210,228,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(149,196,244,0.18))]" />
              <div className="relative flex h-[calc(100vh-12.5rem)] min-h-[720px] w-full items-end justify-center overflow-hidden rounded-[2rem] border border-white/45 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08),transparent)]" />
                <TreeScene
                  treeLevel={school.level}
                  petals={petals}
                  fillContainer
                  backgroundMode="cover"
                  showPetals={false}
                  className="min-h-full w-full"
                >
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
                </TreeScene>
                {shakeMode === "countdown" ? (
                  <>
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 select-none sm:px-6">
                      <div className="text-stone-900">
                        <p className="text-2xl font-black sm:text-3xl">
                          {shakeSeconds}
                          <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">
                            초
                          </span>
                        </p>
                      </div>
                      <div className="text-right text-stone-900">
                        <p className="text-2xl font-black sm:text-3xl">
                          {shakeCount}
                          <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">
                            점
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0))]" />
                    <div className="pointer-events-none absolute bottom-6 left-6 z-20 max-w-[15rem] rounded-[1.35rem] border border-white/55 bg-white/72 px-4 py-3 text-stone-900 shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur-md sm:bottom-8 sm:left-8 sm:max-w-[18rem]">
                      <p className="text-sm font-bold text-rose-600 sm:text-base">벚꽃 떨어뜨리기</p>
                      <p className="mt-1 text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
                        화면을 터치하거나 흔들어서 상대 학교 벚꽃을 떨어뜨려보세요.
                      </p>
                    </div>
                  </>
                ) : null}
                <div className={`pointer-events-none absolute left-6 top-6 z-30 flex items-center gap-4 rounded-[1.6rem] border border-white/35 bg-white/18 px-4 py-3 text-stone-950 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-md transition-opacity sm:left-8 sm:top-8 sm:px-5 ${shakeMode === "countdown" ? "opacity-0" : "opacity-100"}`}>
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/55 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:h-20 sm:w-20">
                    <SchoolLogoImage schoolId={school.id} schoolName={school.name} sizes="80px" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xl font-black text-stone-900 sm:text-2xl">
                      {school.name}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-rose-600 sm:text-base">
                      모든 벚꽃잎: {school.totalPetals.toLocaleString()}개
                    </p>
                  </div>
                </div>
                <div className={`absolute bottom-6 left-6 z-30 grid w-[min(17rem,calc(100%-3rem))] gap-3 transition-opacity sm:bottom-8 sm:left-8 sm:w-72 ${shakeMode === "countdown" ? "opacity-0" : "opacity-100"}`}>
                  {!isOwnSchool ? (
                    <button
                      type="button"
                      onClick={handleShakeStart}
                      className="rounded-[1.35rem] bg-rose-400 px-4 py-3 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                    >
                      흔들기 사용하기
                    </button>
                  ) : null}
                  <Link
                    href="/main"
                    className="rounded-[1.35rem] border border-sky-200/70 bg-white/78 px-4 py-3 text-center text-base font-bold text-sky-800 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm"
                  >
                    내 학교로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <header className={`mt-5 grid grid-cols-1 gap-2 rounded-[1.5rem] border border-white/30 bg-white/28 p-2.5 text-stone-950 backdrop-blur-sm transition-opacity sm:mt-6 sm:grid-cols-[1.15fr_1.35fr] sm:gap-2 sm:p-3 ${shakeMode === "countdown" ? "opacity-0" : "opacity-100"}`}>
          <div className="grid grid-cols-1 gap-2 rounded-[1.25rem] bg-white/40 px-3 py-2 sm:grid-cols-3 sm:items-stretch">
            <NearbySchoolRow school={previousSchool} gap={gapToPrevious} />
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/45 px-3 py-2 text-center">
              <p className="text-[11px] font-semibold text-stone-600 sm:text-xs">현재 순위</p>
              <p className="mt-1 text-xl font-bold sm:text-3xl">#{school.rank}</p>
            </div>
            <NearbySchoolRow school={nextSchool} gap={gapToNext} />
          </div>
          <div className="rounded-[1.25rem] bg-white/40 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-stone-600 sm:text-xs">레벨</p>
                <p className="mt-1 text-base font-bold sm:text-2xl">
                  {getLevelLabel(school.level)}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="mb-2 text-[11px] font-medium text-stone-600 sm:text-xs">
                총 벚꽃 수 {school.totalPetals.toLocaleString()}
              </p>
              <div className="relative h-6 overflow-hidden rounded-full bg-white/45 sm:h-7">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#fda4af_0%,#fb7185_50%,#fecdd3_100%)] transition-[width] duration-700"
                  style={{ width: `${school.progressPercent}%` }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold leading-none text-stone-950 sm:text-xs">
                  {school.progressPercent.toFixed(0)}%
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-stone-600 sm:text-xs">
                <span>{getLevelLabel(school.level)}</span>
                <span>{school.level >= 7 ? "만개" : `LV.${school.level + 1}`}</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {shakeMode === "countdown" && !isResolvingShakeResult ? (
        <>
          <button
            type="button"
            onPointerDown={handleShakeOverlayPointerDown}
            className="fixed inset-x-0 bottom-0 top-24 z-40 bg-transparent select-none touch-pan-y outline-none sm:top-28"
            style={{
              WebkitTapHighlightColor: "transparent",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
            aria-label="화면 아무 곳이나 눌러 흔들기"
          />
        </>
      ) : null}

      {shakeMode === "result" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-6 text-center text-stone-900 shadow-2xl">
            <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">RESULT</p>
            <h2 className="mt-3 text-3xl font-bold">나무 흔들기 종료</h2>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              {shakeResult?.reason === "removed" ? (
                <>
                  이번 방해로{" "}
                  <span className="font-semibold text-stone-900">{reducedScore}</span>점만큼 벚꽃 수가
                  줄었고, 저장된 꽃잎{" "}
                  <span className="font-semibold text-stone-900">{droppedCount}개</span>가 떨어졌어요.
                </>
              ) : shakeResult?.reason === "no_petals" ? (
                <>
                  이번 방해로{" "}
                  <span className="font-semibold text-stone-900">{reducedScore}</span>점만큼 벚꽃 수가
                  줄었어요. 아직 이 학교에 저장된 꽃잎이 없어서 화면에서 떨어진 꽃잎은 0개예요.
                </>
              ) : shakeResult?.reason === "delete_failed" ? (
                <>
                  이번 방해로{" "}
                  <span className="font-semibold text-stone-900">{reducedScore}</span>점만큼 벚꽃 수가
                  줄었지만, 저장된 꽃잎 삭제는 실패했어요.
                </>
              ) : (
                shakeResult?.message ?? "이번 방해 결과를 불러오지 못했어요."
              )}
            </p>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              총 감소 점수 {reducedScore + shareBonusDamage}
              {shareBonusDamage > 0 ? ` · 공유 보너스 +${shareBonusDamage}` : ""}
            </p>
            {shareNotice ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {shareNotice}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleShareAttackResult}
                disabled={hasAppliedShareBonus && reducedScore > 0}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700 transition-transform duration-200 hover:scale-[1.02]"
              >
                {hasAppliedShareBonus && reducedScore > 0
                  ? "공유 보너스 반영 완료"
                  : "친구에게 결과 공유하기"}
              </button>
              <button
                type="button"
                onClick={handleShakeStart}
                className="rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold text-stone-700 transition-transform duration-200 hover:scale-[1.02]"
              >
                다시 하기
              </button>
              <button
                type="button"
                onClick={() => setShakeMode("idle")}
                className="rounded-2xl bg-stone-900 px-4 py-4 text-center text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
              >
                그만두기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
