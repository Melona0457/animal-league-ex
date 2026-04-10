"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getLevelLabel,
  getSchoolLogoImage,
  type SchoolRecord,
} from "../_lib/mock-data";
import { getStoredSchools } from "../_lib/school-state";

type RankingClientProps = {
  currentSchoolId: string;
  sort: "rank" | "name";
};

type RankDelta = {
  label: string;
  className: string;
};

function SchoolLogo({
  schoolId,
  schoolName,
}: {
  schoolId: string;
  schoolName: string;
}) {
  const [variant, setVariant] = useState<"avif" | "webp" | "missing">("avif");
  const logoSrc =
    variant === "avif"
      ? getSchoolLogoImage(schoolId)
      : `/images/schools/${schoolId}/logo.webp`;

  function handleError() {
    if (variant === "avif") {
      setVariant("webp");
      return;
    }

    setVariant("missing");
  }

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 sm:h-14 sm:w-14">
      {variant !== "missing" ? (
        <Image
          src={logoSrc}
          alt={`${schoolName} logo`}
          fill
          unoptimized
          sizes="(max-width: 640px) 48px, 56px"
          className="h-full w-full object-contain"
          onError={handleError}
        />
      ) : null}
      {variant === "missing" ? (
        <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] text-stone-500">
          logo
        </span>
      ) : null}
    </div>
  );
}

function getPodiumTreeImage(rank: number) {
  if (rank === 1) return "/images/trees/tree_clean_2.png";
  if (rank === 2) return "/images/trees/tree_clean_1.png";
  return "/images/trees/tree_clean_3.png";
}

function getPodiumTreeOffset(rank: number) {
  if (rank === 1) return "-mb-1 sm:-mb-2";
  if (rank === 2) return "-mb-1 sm:-mb-8";
  return "-mb-1 sm:-mb-9";
}

function getPodiumNameOffset(rank: number) {
  if (rank === 1) return "-mb-2 sm:-mb-3";
  if (rank === 2) return "-mb-2 sm:-mb-7";
  return "-mb-2 sm:-mb-8";
}

/** 모바일 전용. 1·2·3위 막대 높이 비율 9:7:6 유지(데스크탑 sm: 는 별도). */
function getMobilePodiumHeightClass(rank: number) {
  if (rank === 1) return "h-[7.2rem]";
  if (rank === 2) return "h-[5.6rem]";
  return "h-[4.8rem]";
}

function getDesktopPodiumHeightClass(rank: number) {
  if (rank === 1) {
    return "sm:h-48 sm:border sm:border-rose-200 sm:bg-gradient-to-b sm:from-rose-200 sm:via-rose-300 sm:to-rose-400 sm:text-white sm:shadow-[0_14px_24px_rgba(214,121,149,0.2)]";
  }

  if (rank === 2) {
    return "sm:h-34 sm:border sm:border-rose-100 sm:bg-gradient-to-b sm:from-white sm:via-rose-100 sm:to-rose-200 sm:text-rose-900 sm:shadow-[0_12px_22px_rgba(219,176,190,0.16)]";
  }

  return "sm:h-22 sm:border sm:border-rose-100 sm:bg-gradient-to-b sm:from-white sm:via-rose-50 sm:to-rose-100 sm:text-rose-800 sm:shadow-[0_10px_18px_rgba(221,193,202,0.14)]";
}

function getRankTextClass(rank: number) {
  if (rank === 1) return "text-rose-500";
  if (rank === 2) return "text-rose-400";
  if (rank === 3) return "text-rose-300";
  return "text-stone-500";
}

function getRankDelta(previousRank: number | undefined, currentRank: number): RankDelta | null {
  if (previousRank === undefined || previousRank === currentRank) {
    return null;
  }

  const difference = previousRank - currentRank;

  if (difference > 0) {
    return {
      label: `▲ ${difference}`,
      className: "text-rose-500",
    };
  }

  return {
    label: `▼ ${Math.abs(difference)}`,
    className: "text-sky-500",
  };
}

function normalizeSchoolName(name: string) {
  return name
    .replace(/\s+/g, "")
    .replace(/대학교/g, "")
    .replace(/대학/g, "")
    .replace(/대$/g, "");
}

function matchesSchoolQuery(name: string, query: string) {
  const rawQuery = query.trim();
  const normalizedName = normalizeSchoolName(name);
  const normalizedQuery = normalizeSchoolName(rawQuery);

  if (!normalizedQuery) {
    return false;
  }

  return (
    name.includes(rawQuery) ||
    normalizedName.includes(normalizedQuery) ||
    normalizedName.startsWith(normalizedQuery)
  );
}

function getSchoolNavigationHref(schoolId: string, currentSchoolId: string) {
  return schoolId === currentSchoolId
    ? "/main"
    : `/schools/${schoolId}`;
}

function getRankSnapshotStorageKey() {
  return "blossom-save:ranking-last-ranks";
}

export function RankingClient({
  currentSchoolId,
  sort,
}: RankingClientProps) {
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchSchoolId, setSelectedSearchSchoolId] = useState<string | null>(null);
  useEffect(() => {
    let isActive = true;

    async function loadSchools() {
      const storedSchools = await getStoredSchools();

      if (!isActive) {
        return;
      }

      const currentSnapshot = Object.fromEntries(
        storedSchools.map((school) => [school.id, school.rank]),
      );

      let fallbackSnapshot: Record<string, number> = {};

      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem(getRankSnapshotStorageKey());

        if (saved) {
          try {
            fallbackSnapshot = JSON.parse(saved) as Record<string, number>;
          } catch {
            fallbackSnapshot = {};
          }
        }
      }

      setPreviousRanks(fallbackSnapshot);
      setSchools(storedSchools);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          getRankSnapshotStorageKey(),
          JSON.stringify(currentSnapshot),
        );
      }
    }

    void loadSchools();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedSchools =
    sort === "name"
      ? [...schools].sort((a, b) => a.name.localeCompare(b.name, "ko"))
      : [...schools].sort((a, b) => a.rank - b.rank);

  const podiumSchools = [...schools]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);

  const matchedSchools = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return [...schools]
      .filter((school) => matchesSchoolQuery(school.name, searchQuery))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 8);
  }, [schools, searchQuery]);

  const selectedSearchSchool =
    (selectedSearchSchoolId
      ? matchedSchools.find((school) => school.id === selectedSearchSchoolId)
      : null) ??
    matchedSchools[0] ??
    null;

  return (
    <main className="min-h-screen px-6 py-8 text-stone-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-[2rem] border border-rose-100 bg-gradient-to-r from-white via-rose-50 to-amber-50 p-4 shadow-[0_18px_50px_rgba(190,92,116,0.12)] sm:px-6 sm:py-5">
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[minmax(0,42rem)_auto] sm:items-start sm:gap-x-6 sm:gap-y-0">
            <div className="flex items-start justify-between gap-3 sm:contents">
              <h1 className="mt-1 flex min-w-0 flex-1 items-center gap-1.5 text-lg font-bold leading-tight tracking-tight text-[#cf5f84] sm:col-start-1 sm:col-end-2 sm:row-start-1 sm:mt-0 sm:gap-2 sm:leading-normal sm:tracking-normal sm:flex-none sm:text-3xl">
                <span className="shrink-0 text-base sm:text-[1.875rem]" aria-hidden="true">
                  🏆
                </span>
                <span>학교 벚꽃 랭킹</span>
              </h1>
              <Link
                href="/main"
                className="shrink-0 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-white sm:col-start-2 sm:col-end-3 sm:row-span-2 sm:row-start-1 sm:self-center sm:px-4 sm:py-3"
              >
                메인으로
              </Link>
            </div>
            <p className="w-full max-w-none text-xs leading-relaxed text-pretty text-stone-600 sm:col-start-1 sm:col-end-2 sm:row-start-2 sm:mt-3 sm:max-w-2xl sm:text-sm sm:leading-6">
              지금 가장 빠르게 개화 중인 학교들을 확인하고,{" "}
              <br className="sm:hidden" />
              다른 학교 현황도 둘러보세요.
            </p>
          </div>
        </header>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-[0_18px_40px_rgba(36,15,26,0.06)] sm:p-5">
          <div className="rounded-[1.4rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-rose-50 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-rose-700 sm:text-sm">
              <span aria-hidden="true">🔥</span>
              <span>실시간 TOP 3 대학</span>
              <span className="w-full text-[11px] font-medium text-stone-500 sm:ml-2 sm:w-auto sm:text-xs">
                지금 가장 앞서고 있는 학교들이에요
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-center gap-1.5 overflow-hidden pb-1 sm:mt-20 sm:gap-8 sm:pb-2 sm:overflow-x-auto">
            {[podiumSchools[1], podiumSchools[0], podiumSchools[2]].map((school) => {
              if (!school) {
                return null;
              }

              const heightClass = `${getMobilePodiumHeightClass(school.rank)} border bg-gradient-to-b text-rose-900 shadow-[0_10px_18px_rgba(221,193,202,0.14)] ${
                school.rank === 1
                  ? "border-rose-200 from-rose-200 via-rose-300 to-rose-400 text-white shadow-[0_14px_24px_rgba(214,121,149,0.2)]"
                  : school.rank === 2
                    ? "border-rose-100 from-white via-rose-100 to-rose-200"
                    : "border-rose-100 from-white via-rose-50 to-rose-100 text-rose-800"
              } ${getDesktopPodiumHeightClass(school.rank)}`;

              return (
                <Link
                  key={school.id}
                  href={getSchoolNavigationHref(school.id, currentSchoolId)}
                  className={`flex flex-1 flex-col items-center text-center sm:flex-none ${
                    school.rank === 1
                      ? "max-w-[132px] sm:min-w-[148px] sm:max-w-none"
                      : "max-w-[104px] sm:min-w-[148px] sm:max-w-none"
                  }`}
                >
                  <div className={`${getPodiumTreeOffset(school.rank)} relative flex flex-col items-center`}>
                    {school.rank === 1 ? (
                      <div
                        className="mb-0.5 text-[19px] drop-shadow-[0_3px_6px_rgba(176,122,23,0.28)] sm:mb-1 sm:text-[22px]"
                        aria-hidden="true"
                      >
                        👑
                      </div>
                    ) : null}
                    <div className={`relative ${getPodiumNameOffset(school.rank)}`}>
                      {school.rank === 1 ? (
                        <>
                          <div className="pointer-events-none absolute inset-x-[-12px] top-1/2 h-8 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-200/0 via-amber-200/45 to-amber-200/0 blur-md" />
                          <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 text-[11px] text-amber-500">
                            ✦
                          </div>
                          <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 text-[11px] text-amber-500">
                            ✦
                          </div>
                        </>
                      ) : null}
                      <p className="relative z-10 line-clamp-2 px-1 text-[11px] font-semibold leading-4 sm:px-0 sm:text-sm sm:leading-5">
                        {school.name}
                      </p>
                    </div>
                    <Image
                      src={getPodiumTreeImage(school.rank)}
                      alt={`${school.rank}위 벚꽃나무`}
                      width={320}
                      height={320}
                      unoptimized
                      sizes="(max-width: 640px) 112px, 192px"
                      className={`relative z-10 w-auto object-contain ${
                        school.rank === 1
                          ? "h-28 sm:h-48"
                          : school.rank === 2
                            ? "h-24 sm:h-48"
                            : "h-[5.25rem] sm:h-48"
                      }`}
                    />
                  </div>
                  <div
                    className={`-mt-2 flex w-full items-center justify-center rounded-t-[1.25rem] px-2 text-base font-bold backdrop-blur-[1px] sm:-mt-4 sm:rounded-t-[1.5rem] sm:px-3 sm:text-lg ${heightClass}`}
                  >
                    {school.rank}위
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-[0_18px_40px_rgba(36,15,26,0.06)] sm:p-5">
          <div className="rounded-[1.5rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-rose-700 sm:text-sm">
                  <span aria-hidden="true">🔍</span>
                  <span>학교 검색</span>
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-stone-200 bg-white px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-4 sm:py-3">
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedSearchSchoolId(null);
                  }}
                  placeholder="어느 학교부터 가볼까요?"
                  className="w-full bg-transparent text-xs text-stone-900 outline-none placeholder:text-stone-400 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {searchQuery.trim() ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-3">
                <p className="px-2 pb-2 text-xs font-semibold tracking-[0.18em] text-stone-500">
                  SEARCH RESULT
                </p>
                {matchedSchools.length > 0 ? (
                  <ul className="space-y-2">
                    {matchedSchools.map((school) => {
                      const isSelected = selectedSearchSchool?.id === school.id;

                      return (
                        <li key={school.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedSearchSchoolId(school.id)}
                            className={`flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left transition ${
                              isSelected
                                ? "border-rose-200 bg-white shadow-[0_10px_24px_rgba(190,92,116,0.1)]"
                                : "border-transparent bg-white/70 hover:border-rose-100 hover:bg-white"
                            }`}
                          >
                            <div>
                              <p className="text-base font-semibold text-stone-900">
                                {school.name}
                              </p>
                              <p className="mt-1 text-sm text-stone-500">
                                {school.rank}위 / 개화율 {school.bloomRate}%
                              </p>
                            </div>
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                              보기
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-stone-200 bg-white/70 px-4 py-6 text-sm text-stone-500">
                    검색한 학교가 없어요. 학교명을 조금만 다르게 입력해 다시 찾아보세요.
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-[0_12px_28px_rgba(36,15,26,0.06)]">
                <p className="text-xs font-semibold tracking-[0.18em] text-rose-500">
                  SCHOOL PROFILE
                </p>
                {selectedSearchSchool ? (
                  <div className="mt-3">
                    <div className="flex items-center gap-4">
                      <SchoolLogo
                        key={selectedSearchSchool.id}
                        schoolId={selectedSearchSchool.id}
                        schoolName={selectedSearchSchool.name}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xl font-bold text-stone-900">
                          {selectedSearchSchool.name}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          현재 {selectedSearchSchool.rank}위
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-[1.1rem] bg-rose-50 px-3 py-3 text-center">
                        <p className="text-xs font-medium text-rose-500">개화율</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">
                          {selectedSearchSchool.bloomRate}%
                        </p>
                      </div>
                      <div className="rounded-[1.1rem] bg-sky-50 px-3 py-3 text-center">
                        <p className="text-xs font-medium text-sky-600">레벨</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">
                          {getLevelLabel(selectedSearchSchool.level)}
                        </p>
                      </div>
                      <div className="rounded-[1.1rem] bg-amber-50 px-3 py-3 text-center">
                        <p className="text-xs font-medium text-amber-600">벚꽃</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">
                          {selectedSearchSchool.totalPetals.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={getSchoolNavigationHref(
                        selectedSearchSchool.id,
                        currentSchoolId,
                      )}
                      className="mt-4 flex items-center justify-center rounded-[1.2rem] bg-stone-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                      이 학교 보러 가기
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1.2rem] border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-sm text-stone-500">
                    검색 결과를 선택하면 학교 정보가 여기 표시됩니다.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_18px_40px_rgba(36,15,26,0.06)]">
          <div className="flex flex-col gap-3 border-b border-rose-100 bg-rose-50/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-4">
            <p className="min-w-0 text-xs font-semibold text-rose-700 sm:text-sm sm:font-medium">
              <span className="flex gap-1.5 sm:hidden">
                <span aria-hidden="true" className="shrink-0 select-none leading-none">
                  📢
                </span>
                <span className="min-w-0 leading-snug">
                  학교를 클릭하면
                  <br />
                  해당 학교 나무 화면으로 이동할 수 있어요.
                </span>
              </span>
              <span className="hidden sm:inline">
                <span aria-hidden="true" className="mr-1">
                  📢
                </span>
                학교를 클릭하면 해당 학교 나무 화면으로 이동할 수 있어요.
              </span>
            </p>
            <div className="flex w-full shrink-0 justify-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2 sm:self-auto">
              <Link
                href="/ranking"
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                  sort === "rank"
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-900/15"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-rose-200 hover:bg-white"
                }`}
              >
                랭킹순
              </Link>
              <Link
                href="/ranking?sort=name"
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
                  sort === "name"
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-900/15"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-rose-200 hover:bg-white"
                }`}
              >
                가나다순
              </Link>
            </div>
          </div>
          <ul className="divide-y divide-stone-200">
            {sortedSchools.map((school) => {
              const rankDelta = getRankDelta(previousRanks[school.id], school.rank);

              return (
                <li key={school.id}>
                  <Link
                    href={getSchoolNavigationHref(school.id, currentSchoolId)}
                    className="flex flex-col gap-2 px-5 py-4 transition hover:bg-rose-50/70 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="flex min-w-0 w-full items-start gap-2 sm:min-w-0 sm:flex-1 sm:items-center sm:gap-3">
                      <div className="flex shrink-0 items-start gap-1.5 sm:items-center">
                        <div className="w-9 shrink-0 text-center">
                          <p
                            className={`text-sm font-semibold ${getRankTextClass(school.rank)}`}
                          >
                            {school.rank}위
                          </p>
                        </div>
                        <div className="w-8 shrink-0 text-center sm:w-11">
                          {rankDelta ? (
                            <p className={`text-xs font-bold ${rankDelta.className}`}>
                              {rankDelta.label}
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-stone-300">-</p>
                          )}
                        </div>
                        <SchoolLogo
                          key={school.id}
                          schoolId={school.id}
                          schoolName={school.name}
                        />
                      </div>
                      <div className="min-w-0 flex-1 self-center pt-0.5 sm:pt-0">
                        <p className="break-words text-base font-semibold leading-snug sm:truncate">
                          {school.name}
                        </p>
                        <p className="mt-1 text-xs leading-snug text-stone-600 whitespace-nowrap sm:mt-1 sm:text-sm">
                          {getLevelLabel(school.level)} / 개화율 {school.bloomRate}%
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full shrink-0 justify-end border-t border-stone-100 pt-2 text-right sm:w-auto sm:border-t-0 sm:pt-0 sm:self-center">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">
                          벚꽃 {school.totalPetals.toLocaleString()}개
                        </p>
                        <p className="text-xs text-stone-500">상세 보기</p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
