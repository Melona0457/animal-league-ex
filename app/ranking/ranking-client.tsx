"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLevelLabel, type SchoolRecord } from "../_lib/mock-data";
import { getStoredSchools } from "../_lib/school-state";

type RankingClientProps = {
  currentSchoolId: string;
  sort: "rank" | "name";
};

function SchoolLogo({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  const [logoSrc, setLogoSrc] = useState(`/images/schools/${schoolId}/logo.avif`);
  const [isMissing, setIsMissing] = useState(false);

  function handleError() {
    if (logoSrc.endsWith(".avif")) {
      setLogoSrc(`/images/schools/${schoolId}/logo.webp`);
      return;
    }

    setIsMissing(true);
  }

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
      {!isMissing ? (
        <img
          src={logoSrc}
          alt={`${schoolName} 로고`}
          className="h-full w-full object-contain"
          onError={handleError}
        />
      ) : null}
      {isMissing ? (
        <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] text-stone-500">
          로고
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
  if (rank === 1) return "-mb-2";
  if (rank === 2) return "-mb-8";
  return "-mb-9";
}

function getPodiumNameOffset(rank: number) {
  if (rank === 1) return "-mb-3";
  if (rank === 2) return "-mb-7";
  return "-mb-8";
}

export function RankingClient({ currentSchoolId, sort }: RankingClientProps) {
  const [schools, setSchools] = useState<SchoolRecord[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadSchools() {
      const storedSchools = await getStoredSchools();

      if (isActive) {
        setSchools(storedSchools);
      }
    }

    loadSchools();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedSchools =
    sort === "name"
      ? [...schools].sort((a, b) => a.name.localeCompare(b.name, "ko"))
      : [...schools].sort((a, b) => a.rank - b.rank);
  const podiumSchools = [...schools].sort((a, b) => a.rank - b.rank).slice(0, 3);

  return (
    <main className="min-h-screen px-6 py-8 text-stone-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="rounded-[2rem] border border-rose-100 bg-gradient-to-r from-white via-rose-50 to-amber-50 p-6 shadow-[0_18px_50px_rgba(190,92,116,0.12)]">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-[#cf5f84]">
                <span aria-hidden="true">🏆</span>
                <span>학교 벚꽃 랭킹</span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                벚꽃 전쟁은 이미 시작됐어요. 다른 학교 개화 상황도 한눈에 확인해보세요!
              </p>
            </div>
            <Link
              href={`/main?schoolId=${currentSchoolId}`}
              className="shrink-0 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-white"
            >
              메인으로
            </Link>
          </div>
        </header>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_18px_40px_rgba(36,15,26,0.06)]">
          <div className="rounded-[1.4rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-rose-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
              <span aria-hidden="true">🔥</span>
              <span>실시간 TOP 3 대학</span>
              <span className="ml-2 text-xs font-medium text-stone-500">
                지금 가장 앞서 있는 대학들이에요.
              </span>
            </div>
          </div>
          <div className="mt-20 flex items-end justify-center gap-8 overflow-x-auto pb-2">
            {[podiumSchools[1], podiumSchools[0], podiumSchools[2]].map((school) => {
              if (!school) {
                return null;
              }

              const heightClass =
                school.rank === 1
                  ? "h-48 border border-rose-200 bg-gradient-to-b from-rose-200 via-rose-300 to-rose-400 text-white shadow-[0_14px_24px_rgba(214,121,149,0.2)]"
                  : school.rank === 2
                    ? "h-34 border border-rose-100 bg-gradient-to-b from-white via-rose-100 to-rose-200 text-rose-900 shadow-[0_12px_22px_rgba(219,176,190,0.16)]"
                    : "h-22 border border-rose-100 bg-gradient-to-b from-white via-rose-50 to-rose-100 text-rose-800 shadow-[0_10px_18px_rgba(221,193,202,0.14)]";

              return (
                <Link
                  key={school.id}
                  href={`/schools/${school.id}?fromSchoolId=${currentSchoolId}`}
                  className="flex min-w-[148px] flex-col items-center text-center"
                >
                  <div className={`${getPodiumTreeOffset(school.rank)} relative flex flex-col items-center`}>
                    {school.rank === 1 ? (
                      <div
                        className="mb-1 text-[22px] drop-shadow-[0_3px_6px_rgba(176,122,23,0.28)]"
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
                      <p className="relative z-10 text-sm font-semibold">{school.name}</p>
                    </div>
                    <img
                      src={getPodiumTreeImage(school.rank)}
                      alt={`${school.rank}위 벚꽃나무`}
                      className="relative z-10 h-48 w-auto object-contain"
                    />
                  </div>
                  <div
                    className={`-mt-4 flex w-full items-center justify-center rounded-t-[1.5rem] px-3 text-lg font-bold backdrop-blur-[1px] ${heightClass}`}
                  >
                    {school.rank}위
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_18px_40px_rgba(36,15,26,0.06)]">
          <div className="flex items-center justify-between gap-4 border-b border-rose-100 bg-rose-50/80 px-5 py-4">
            <p className="text-sm font-medium text-rose-700">
              📢 학교를 클릭하면 해당 대학 나무 화면으로 넘어가 방해할 수 있어요.
            </p>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/ranking?schoolId=${currentSchoolId}`}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  sort === "rank"
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-900/15"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-rose-200 hover:bg-white"
                }`}
              >
                랭킹순
              </Link>
              <Link
                href={`/ranking?sort=name&schoolId=${currentSchoolId}`}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
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
            {sortedSchools.map((school) => (
              <li key={school.id}>
                <Link
                  href={`/schools/${school.id}?fromSchoolId=${currentSchoolId}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-rose-50/70"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <SchoolLogo schoolId={school.id} schoolName={school.name} />
                    <div className="min-w-0">
                      <p className="text-sm text-stone-500">#{school.rank}</p>
                      <p className="truncate text-base font-semibold">{school.name}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        {getLevelLabel(school.level)} / 개화율 {school.bloomRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-900">
                      벚꽃 {school.totalPetals.toLocaleString()}개
                    </p>
                    <p className="text-xs text-stone-500">상세 보기</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
