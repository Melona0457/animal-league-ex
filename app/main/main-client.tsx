"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TreeScene } from "../_components/tree-scene";
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

export function MainClient({ school, score }: MainClientProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(school);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [petals, setPetals] = useState<PetalPlacement[]>([]);
  const [shareNotice, setShareNotice] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSchool() {
      const [storedSchool, storedSchools] = await Promise.all([
        getStoredSchoolById(school.id),
        getStoredSchools(),
      ]);
      const storedPetals = await getPetalsBySchoolId(school.id);

      if (isActive && storedSchool) {
        setCurrentSchool(storedSchool);
      }

      if (isActive) {
        setSchools(storedSchools);
        setPetals(storedPetals);
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

  function handleSelectAnotherSchool() {
    router.push("/select-school");
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
    <main
      className="min-h-screen bg-stone-900 px-4 py-5 text-white"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(34, 18, 26, 0.28), rgba(34, 18, 26, 0.72)), url('${getSchoolBackgroundImage(currentSchool.id)}')`,
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
              <p className="mt-1 text-xl font-bold sm:text-3xl">#{currentSchool.rank}</p>
            </div>
            <NearbySchoolRow school={nextSchool} gap={gapToNext} />
          </div>
          <div className="px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-white/65 sm:text-xs">레벨</p>
                <p className="mt-1 text-base font-bold sm:text-2xl">
                  {getLevelLabel(currentSchool.level)}
                </p>
              </div>
              {score > 0 ? (
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[11px] font-semibold text-emerald-100">
                  +{score}
                </span>
              ) : null}
            </div>
            <div className="mt-3">
              <p className="mb-2 text-[11px] text-white/65 sm:text-xs">
                총 벚꽃 수 {totalPetals.toLocaleString()}
              </p>
              <div className="relative h-7 overflow-hidden rounded-full bg-white/12 sm:h-8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#fda4af_0%,#fb7185_50%,#fecdd3_100%)] transition-[width] duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-semibold leading-none text-stone-950 sm:text-xs">
                  {progressPercent.toFixed(0)}%
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-white/65 sm:text-xs">
                <span>{getLevelLabel(currentSchool.level)}</span>
                <span>
                  {currentSchool.level >= 5
                    ? "만개"
                    : `LV.${currentSchool.level + 1}`}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-end px-3 py-3 text-left"
          >
            <p className="text-3xl font-bold leading-none sm:text-4xl">≡</p>
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-center py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
            <p className="mb-3 rounded-full bg-black/30 px-4 py-2 text-xs text-white/75 backdrop-blur-sm">
              {currentSchool.name} · {getTreeStage(currentSchool.bloomRate)}
            </p>
            <div
              className="flex h-[46vh] min-h-[300px] w-full items-end justify-center"
            >
              <TreeScene treeLevel={currentSchool.level} petals={petals} className="w-full max-w-[640px]">
                <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                  <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                    현재 붙은 벚꽃 {petals.length}개
                  </div>
                </div>
              </TreeScene>
            </div>
          </div>
        </section>

        <section className="grid gap-3 pb-2 sm:grid-cols-2">
          <Link
            href={`/game/select?schoolId=${currentSchool.id}`}
            className="rounded-3xl bg-rose-400 px-4 py-4 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
          >
            벚꽃 붙이기
          </Link>
          <Link
            href={`/ranking?schoolId=${currentSchool.id}`}
            className="rounded-3xl border border-white/20 bg-white/10 px-4 py-4 text-center text-base font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
          >
            방해하러 가기
          </Link>
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
