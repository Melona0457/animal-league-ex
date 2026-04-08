"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  getTreeStage,
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

function NearbySchoolRow({
  school,
  gap,
  currentSchoolId,
}: {
  school: SchoolRecord | null;
  gap: number;
  currentSchoolId: string;
}) {
  if (!school) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-2 py-1.5 text-white/45">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[8px]">
          -
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-medium">경쟁 학교 없음</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/schools/${school.id}?fromSchoolId=${currentSchoolId}`}
      className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/4 px-2 py-1.5 transition hover:border-white/15 hover:bg-white/8"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
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
          <span className="hidden text-[8px] text-white/45">로고</span>
        </div>
        <div className="min-w-0">
          <p className="text-[8px] text-white/55">#{school.rank}</p>
          <p className="truncate text-[10px] font-semibold text-white">{school.name}</p>
        </div>
      </div>
      <p className="shrink-0 text-[8px] text-rose-100/80">{gap.toLocaleString()}표</p>
    </Link>
  );
}

export function MainClient({ school, score }: MainClientProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        getAttackLogsForSchool(school.id, 3),
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
  const hasUnreadAttackAlert =
    latestAttackAt !== null &&
    (dismissedAttackAt === null ||
      new Date(latestAttackAt).getTime() > new Date(dismissedAttackAt).getTime());
  const visibleAttackLogs = hasUnreadAttackAlert ? attackLogs : [];

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

  async function handleShare() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/main?schoolId=${currentSchool.id}`;
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
    <main className="relative h-screen overflow-hidden bg-stone-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat blur-lg"
        style={{ backgroundImage: `url('${getSchoolBackgroundImage(currentSchool.id)}')` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(24,10,18,0.34),rgba(24,10,18,0.76))]" />
      <div className="relative z-10 flex h-screen w-full flex-col">
        <header className="absolute inset-x-2 top-2 z-30 grid grid-cols-[0.6fr_3.2fr_0.6fr] gap-2 rounded-[1.2rem] border border-white/15 bg-black/25 p-2 backdrop-blur-sm transition-opacity sm:inset-x-4 sm:top-3 sm:gap-3 sm:p-3">
          <div className="flex flex-col justify-between py-1">
            <NearbySchoolRow
              school={previousSchool}
              gap={gapToPrevious}
              currentSchoolId={currentSchool.id}
            />
            <div className="py-1 text-center">
              <p className="text-[9px] font-medium text-white/65">현재 순위</p>
              <p className="mt-0.5 text-base font-bold sm:text-lg">#{currentSchool.rank}</p>
            </div>
            <NearbySchoolRow
              school={nextSchool}
              gap={gapToNext}
              currentSchoolId={currentSchool.id}
            />
          </div>
          <div className="px-6 py-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-rose-300 sm:text-xs">
                  {currentSchool.name} · {getTreeStage(currentSchool.bloomRate)}
                </p>
                <p className="text-[9px] font-medium text-white/65">레벨</p>
                <p className="mt-0.5 text-base font-bold sm:text-lg">
                  {getLevelLabel(currentSchool.level)}
                </p>
              </div>
              {score > 0 ? (
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[11px] font-semibold text-emerald-100">
                  +{score}
                </span>
              ) : null}
            </div>
            <div className="mt-2">
              <p className="mb-1.5 text-[9px] text-white/65 sm:text-[10px]">
                총 벚꽃 수 {totalPetals.toLocaleString()}
              </p>
              <div className="relative h-8 overflow-hidden rounded-full bg-white/12 sm:h-9">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#fda4af_0%,#fb7185_50%,#fecdd3_100%)] transition-[width] duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold leading-none text-stone-950 sm:text-xs">
                  {progressPercent.toFixed(0)}%
                </div>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[8px] text-white/65 sm:text-[9px]">
                <span>{getLevelLabel(currentSchool.level)}</span>
                <span>
                  {currentSchool.level >= 7
                    ? "만개"
                    : `LV.${currentSchool.level + 1}`}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-end py-1 text-left"
          >
            <div>
              <p className="text-[9px] font-medium text-white/65">메뉴</p>
              <p className="mt-0.5 text-base font-bold sm:text-lg">≡</p>
            </div>
          </button>
        </header>

        {visibleAttackLogs.length > 0 ? (
          <section className="absolute inset-x-2 top-20 z-20 grid gap-2 sm:inset-x-4 sm:top-24">
            {visibleAttackLogs.map((log, index) => (
              <div
                key={log.id}
                className={`rounded-3xl border px-4 py-3 backdrop-blur-sm ${
                  index === 0
                    ? "border-rose-300/30 bg-rose-500/16"
                    : "border-white/12 bg-black/22"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/6">
                    <img
                      src={getSchoolLogoImage(log.attackerSchoolId)}
                      alt={`${log.attackerSchoolName} 로고`}
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        const image = event.currentTarget;

                        if (image.dataset.fallbackApplied === "true") {
                          image.style.display = "none";
                          return;
                        }

                        image.dataset.fallbackApplied = "true";
                        image.src = `/images/schools/${log.attackerSchoolId}/logo.webp`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-100/80">
                      {index === 0 ? "최근 공격 알림" : "이전 공격 기록"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                      {log.attackerSchoolName}에게 공격당해{" "}
                      {log.reducedPetals.toLocaleString()}점을 빼앗겼어요
                    </p>
                    <p className="mt-1 text-xs text-white/65">
                      {formatAttackTime(log.createdAt)} · 우리 학교 벚꽃 방어 중
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={handleDismissAttackAlert}
                      className="mr-2 rounded-2xl border border-white/12 bg-black/18 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-black/28"
                    >
                      확인
                    </button>
                  ) : null}
                  <Link
                    href={`/schools/${log.attackerSchoolId}?fromSchoolId=${currentSchool.id}`}
                    className="rounded-2xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    복수하러 가기
                  </Link>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <section className="relative flex h-screen w-full flex-1 flex-col">
          <div className="relative flex h-screen w-full flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.04)_30%,rgba(0,0,0,0.22)_100%)]" />
            <div className="flex h-screen w-full items-end justify-center">
              <TreeScene
                treeLevel={currentSchool.level}
                petals={petals}
                fillContainer
                backgroundMode="cover"
                showPetals={false}
                className="h-full w-full"
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center">
                  <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                    현재 붙은 벚꽃 {petals.length}개
                  </div>
                </div>
              </TreeScene>
              <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-3 transition-opacity sm:px-4 sm:pb-4">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 sm:gap-3">
                  <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                    <Link
                      href={`/game/select?schoolId=${currentSchool.id}`}
                      className="group rounded-[1.4rem] border border-rose-200/40 bg-[linear-gradient(180deg,#fb7185,#f43f5e)] px-3 py-2.5 text-center text-sm font-semibold text-white shadow-[0_16px_36px_rgba(244,63,94,0.28)] transition-transform duration-200 hover:scale-[1.02] sm:px-4 sm:py-3 sm:text-base"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-lg transition-transform duration-200 group-hover:-rotate-12">✦</span>
                        벚꽃 붙이기
                      </span>
                    </Link>
                    <Link
                      href={`/ranking?schoolId=${currentSchool.id}`}
                      className="group rounded-[1.4rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.08))] px-3 py-2.5 text-center text-sm font-semibold text-white shadow-[0_14px_36px_rgba(0,0,0,0.16)] backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] sm:px-4 sm:py-3 sm:text-base"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">◀</span>
                        방해하러 가기
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
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
              href={`/main?schoolId=${currentSchool.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              우리학교 벚꽃 현황
            </Link>
            <Link
              href={`/ranking?schoolId=${currentSchool.id}`}
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
    </main>
  );
}
