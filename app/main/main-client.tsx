"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackgroundVideoWarmup } from "../_components/background-video-warmup";
import { TreeScene } from "../_components/tree-scene";
import {
  formatAttackTime,
  getAttackLogsForSchool,
  type AttackLog,
} from "../_lib/attack-log";
import {
  getLevelLabel,
  getSchoolBackgroundImage,
  getSchoolLogoImage,
  type SchoolRecord,
} from "../_lib/mock-data";
import { getPetalsBySchoolId, type PetalPlacement } from "../_lib/petal-state";
import { setSelectedSchoolId } from "../_lib/selected-school";
import { getStoredSchoolById, getStoredSchools } from "../_lib/school-state";

type MainClientProps = {
  school: SchoolRecord;
  score: number;
};

function getAttackAlertStorageKey(schoolId: string) {
  return `blossom-save:attack-alert-dismissed:${schoolId}`;
}

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
    <Link
      href={`/schools/${school.id}`}
      className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200/80 bg-white/60 px-3 py-3 text-center transition hover:border-stone-300 hover:bg-white/75"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200/80 bg-white/80">
        <SchoolLogoImage schoolId={school.id} schoolName={school.name} sizes="48px" />
        <span className="hidden text-[10px] text-stone-400">로고</span>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-stone-500">#{school.rank}</p>
        <p className="mt-1 truncate text-base font-semibold text-stone-800">{school.name}</p>
      </div>
      <p className="text-sm font-bold text-rose-500">{gap.toLocaleString()}개</p>
    </Link>
  );
}

export function MainClient({ school, score }: MainClientProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAttackLogOpen, setIsAttackLogOpen] = useState(false);
  const [brokenTreeVideoSrc, setBrokenTreeVideoSrc] = useState<string | null>(null);
  const [currentSchool, setCurrentSchool] = useState(school);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [petals, setPetals] = useState<PetalPlacement[]>([]);
  const [attackLogs, setAttackLogs] = useState<AttackLog[]>([]);
  const [dismissedAttackAt, setDismissedAttackAt] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(getAttackAlertStorageKey(school.id));
  });
  const [shareNotice, setShareNotice] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSchool() {
      const [storedSchool, storedSchools, storedAttackLogs] = await Promise.all([
        getStoredSchoolById(school.id),
        getStoredSchools(),
        getAttackLogsForSchool(school.id, 20),
      ]);
      const storedPetals = await getPetalsBySchoolId(school.id);
      const dismissedAt =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(
              getAttackAlertStorageKey(storedSchool?.id ?? school.id),
            );

      if (isActive && storedSchool) {
        setCurrentSchool(storedSchool);
      }

      if (isActive) {
        setSchools(storedSchools);
        setPetals(storedPetals);
        setAttackLogs(storedAttackLogs);
        setDismissedAttackAt(dismissedAt);
      }
    }

    loadSchool();

    return () => {
      isActive = false;
    };
  }, [school.id]);

  useEffect(() => {
    setSelectedSchoolId(currentSchool.id);
  }, [currentSchool.id]);

  const totalPetals = currentSchool.totalPetals;
  const progressPercent = currentSchool.progressPercent;
  const currentIndex = schools.findIndex((item) => item.id === currentSchool.id);
  const previousSchool = currentIndex > 0 ? schools[currentIndex - 1] : null;
  const nextSchool =
    currentIndex >= 0 && currentIndex < schools.length - 1 ? schools[currentIndex + 1] : null;
  const gapToPrevious = previousSchool
    ? Math.max(0, previousSchool.totalPetals - currentSchool.totalPetals)
    : 0;
  const gapToNext = nextSchool
    ? Math.max(0, currentSchool.totalPetals - nextSchool.totalPetals)
    : 0;
  const latestAttackAt = attackLogs[0]?.createdAt ?? null;
  const treeVideoLevel = Math.min(Math.max(currentSchool.level, 1), 7);
  const treeVideoSrc = `/videos/trees/main-level-${treeVideoLevel}.mp4`;
  const hasTreeVideoError = brokenTreeVideoSrc === treeVideoSrc;
  const hasUnreadAttackAlert =
    latestAttackAt !== null &&
    (dismissedAttackAt === null ||
      new Date(latestAttackAt).getTime() > new Date(dismissedAttackAt).getTime());

  function handleSelectAnotherSchool() {
    router.push("/select-school");
  }

  function handleDismissAttackAlert() {
    if (typeof window === "undefined" || !latestAttackAt) {
      return;
    }

    window.localStorage.setItem(getAttackAlertStorageKey(currentSchool.id), latestAttackAt);
    setDismissedAttackAt(latestAttackAt);
  }

  function handleOpenAttackLogs() {
    setIsAttackLogOpen(true);

    if (hasUnreadAttackAlert) {
      handleDismissAttackAlert();
    }
  }

  async function handleShare() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/main`;
    const shareTitle = `${currentSchool.name} 벚꽃살리기`;
    const shareText = `${currentSchool.name} 벚꽃 지키러 같이 들어와줘. 지금 우리 학교 순위 올리는 중이야.`;

    if (!shareUrl) {
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareNotice("공유창을 열었어요.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareNotice("공유 링크를 복사했어요.");
    } catch {
      setShareNotice("공유를 완료하지 못했어요. 다시 시도해주세요.");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-sky-200 px-4 py-8 text-white sm:py-10">
      <BackgroundVideoWarmup
        groups={[
          { sources: [treeVideoSrc], preload: "auto", delayMs: 0 },
        ]}
      />
      <div
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat blur-md brightness-110 saturate-110"
        style={{ backgroundImage: `url('${getSchoolBackgroundImage(currentSchool.id)}')` }}
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
                <Link
                  href="/select-school"
                  aria-label="학교 다시 선택하기"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-300/92 shadow-[0_8px_20px_rgba(244,114,182,0.2)] transition-[transform,background-color] duration-150 hover:scale-[1.03] hover:bg-rose-400 active:bg-rose-500"
                >
                  <span className="text-[1.6rem] font-bold leading-none text-white">×</span>
                </Link>
              </div>
            </div>
            <div className="relative flex flex-1 p-2 sm:p-3">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,210,228,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(149,196,244,0.18))]" />
              <div className="relative flex h-[calc(100vh-12.5rem)] min-h-[720px] w-full items-end justify-center overflow-hidden rounded-[2rem] border border-white/45 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08),transparent)]" />
                {hasTreeVideoError ? (
                  <TreeScene
                    treeLevel={currentSchool.level}
                    petals={petals}
                    fillContainer
                    backgroundMode="cover"
                    showPetals={false}
                    className="min-h-full w-full"
                  />
                ) : (
                  <video
                    key={treeVideoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    disableRemotePlayback
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={() => setBrokenTreeVideoSrc(treeVideoSrc)}
                  >
                    <source src={treeVideoSrc} type="video/mp4" />
                  </video>
                )}
                <div className="pointer-events-none absolute left-6 top-6 z-30 flex items-center gap-4 rounded-[1.6rem] border border-white/35 bg-white/18 px-4 py-3 text-stone-950 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-md sm:left-8 sm:top-8 sm:px-5">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/55 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:h-20 sm:w-20">
                    <SchoolLogoImage
                      schoolId={currentSchool.id}
                      schoolName={currentSchool.name}
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xl font-black text-stone-900 sm:text-2xl">
                      {currentSchool.name}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-rose-600 sm:text-base">
                      모든 벚꽃잎: {totalPetals.toLocaleString()}개
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAttackLogs}
                  aria-label="공격 로그 보기"
                  className="absolute bottom-[11.1rem] left-6 z-30 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/88 text-stone-900 shadow-[0_12px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:scale-[1.03] sm:bottom-[11.45rem] sm:left-8 sm:h-14 sm:w-14"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[0.95rem] border border-rose-100/80 bg-[linear-gradient(180deg,rgba(255,248,251,0.98),rgba(241,248,255,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:h-9 sm:w-9" aria-hidden="true">
                    <span className="relative block h-4 w-5 sm:h-[1.05rem] sm:w-[1.35rem]">
                      <span className="absolute inset-0 rounded-[5px] border-2 border-sky-700/65 bg-transparent" />
                      <span className="absolute left-[3px] right-[3px] top-[3px] h-[2px] rounded-full bg-sky-700/65" />
                      <span className="absolute left-[3px] right-[6px] top-[7px] h-[2px] rounded-full bg-sky-700/65" />
                      <span className="absolute right-[3px] top-[7px] h-1.5 w-1.5 rounded-full bg-rose-400/80" />
                    </span>
                  </span>
                  {hasUnreadAttackAlert ? (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 sm:right-2 sm:top-2" />
                  ) : null}
                </button>
                <Link
                  href="/onboarding"
                  aria-label="서비스 소개 보기"
                  className="absolute bottom-[11.1rem] left-[4.9rem] z-30 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/88 text-stone-900 shadow-[0_12px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm transition hover:scale-[1.03] sm:bottom-[11.45rem] sm:left-[6rem] sm:h-14 sm:w-14"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[0.95rem] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,250,240,0.98),rgba(247,248,255,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:h-9 sm:w-9">
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-sky-700/70 text-[0.95rem] font-black leading-none text-sky-700/70 sm:h-6 sm:w-6 sm:text-[1rem]" aria-hidden="true">
                      ?
                    </span>
                  </span>
                </Link>
                <div className="absolute bottom-6 left-6 z-30 grid w-[min(17rem,calc(100%-3rem))] gap-3 sm:bottom-8 sm:left-8 sm:w-72">
                  <Link
                    href="/game/select"
                    className="rounded-[1.35rem] bg-rose-400 px-4 py-3 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                  >
                    벚꽃 붙이기
                  </Link>
                  <Link
                    href="/ranking"
                    className="rounded-[1.35rem] border border-sky-200/70 bg-white/78 px-4 py-3 text-center text-base font-bold text-sky-800 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm"
                  >
                    다른 학교 방해하러 가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <header className="mt-5 grid grid-cols-1 gap-2 rounded-[1.5rem] border border-white/30 bg-white/28 p-2.5 text-stone-950 backdrop-blur-sm sm:mt-6 sm:grid-cols-[1.15fr_1.35fr] sm:gap-2 sm:p-3">
          <div className="grid grid-cols-1 gap-2 rounded-[1.25rem] bg-white/40 px-3 py-2 sm:grid-cols-3 sm:items-stretch">
            <NearbySchoolRow
              school={previousSchool}
              gap={gapToPrevious}
            />
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/45 px-3 py-2 text-center">
              <p className="text-[11px] font-semibold text-stone-600 sm:text-xs">현재 순위</p>
              <p className="mt-1 text-xl font-bold sm:text-3xl">#{currentSchool.rank}</p>
            </div>
            <NearbySchoolRow
              school={nextSchool}
              gap={gapToNext}
            />
          </div>
          <div className="rounded-[1.25rem] bg-white/40 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-stone-600 sm:text-xs">레벨</p>
                <p className="mt-1 text-base font-bold sm:text-2xl">
                  {getLevelLabel(currentSchool.level)}
                </p>
              </div>
              {score > 0 ? (
                <span className="rounded-full bg-emerald-400/18 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                  +{score}
                </span>
              ) : null}
            </div>
            <div className="mt-2">
              <p className="mb-2 text-[11px] font-medium text-stone-600 sm:text-xs">
                총 벚꽃 수 {totalPetals.toLocaleString()}
              </p>
              <div className="relative h-6 overflow-hidden rounded-full bg-white/45 sm:h-7">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#fda4af_0%,#fb7185_50%,#fecdd3_100%)] transition-[width] duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold leading-none text-stone-950 sm:text-xs">
                  {progressPercent.toFixed(0)}%
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-stone-600 sm:text-xs">
                <span>{getLevelLabel(currentSchool.level)}</span>
                <span>
                  {currentSchool.level >= 7
                    ? "만개"
                    : `LV.${currentSchool.level + 1}`}
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55" onClick={() => setIsMenuOpen(false)}>
          <div
            className="flex h-full w-full max-w-xs flex-col gap-3 bg-stone-950 p-5 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">메뉴</h2>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm"
              >
                닫기
              </button>
            </div>
            <Link
              href="/main"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              우리학교 벚꽃 현황
            </Link>
            <Link
              href="/ranking"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              모아보기
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left"
            >
              친구에게 공유하기
            </button>
            {shareNotice ? (
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {shareNotice}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleSelectAnotherSchool}
              className="mt-auto rounded-2xl bg-white px-4 py-4 text-center font-semibold text-stone-950"
            >
              학교 다시 선택
            </button>
          </div>
        </div>
      ) : null}

      {isAttackLogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={() => setIsAttackLogOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] border border-white/30 bg-[linear-gradient(180deg,rgba(255,250,252,0.96),rgba(245,250,255,0.92))] p-5 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black tracking-[0.24em] text-rose-500">ATTACK LOG</p>
                <h2 className="mt-2 text-2xl font-bold">누가 우리 나무를 흔들었나</h2>
                <p className="mt-1 text-sm text-stone-500">
                  최신순으로 최근 공격 기록을 보여드려요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAttackLogOpen(false)}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600"
              >
                닫기
              </button>
            </div>

            <div className="mt-5 grid max-h-[55vh] gap-3 overflow-y-auto pr-1">
              {attackLogs.length > 0 ? (
                attackLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className={`rounded-[1.5rem] border px-4 py-3 ${
                      index === 0
                        ? "border-rose-200 bg-rose-50/80"
                        : "border-stone-200/90 bg-white/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
                        <SchoolLogoImage
                          schoolId={log.attackerSchoolId}
                          schoolName={log.attackerSchoolName}
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-base font-bold text-stone-900">
                            {log.attackerSchoolName}
                          </p>
                          <p className="shrink-0 text-sm font-bold text-rose-500">
                            -{log.reducedPetals.toLocaleString()}개
                          </p>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-medium text-stone-500">
                            {formatAttackTime(log.createdAt)}
                          </p>
                          <Link
                            href={`/schools/${log.attackerSchoolId}`}
                            className="text-xs font-semibold text-sky-700"
                            onClick={() => setIsAttackLogOpen(false)}
                          >
                            복수 하러 가기
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-stone-200/90 bg-white/80 px-4 py-6 text-center">
                  <p className="text-base font-semibold text-stone-700">아직 공격 기록이 없어요.</p>
                  <p className="mt-1 text-sm text-stone-500">
                    다른 학교가 우리 학교를 흔들면 여기에 최신순으로 쌓입니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
