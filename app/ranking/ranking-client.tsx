"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getLevelLabel,
  getTreeImage,
  type SchoolRecord,
} from "../_lib/mock-data";
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
      <span
        className={`rounded-full bg-white/90 px-2 py-1 text-[10px] text-stone-500 ${
          isMissing ? "" : "absolute inset-auto"
        }`}
      >
        로고
      </span>
    </div>
  );
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
    <main className="min-h-screen bg-background px-4 py-5 text-stone-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-rose-500">
                RANKING
              </p>
              <h1 className="mt-1 text-2xl font-bold">학교 벚꽃 랭킹</h1>
              <p className="mt-2 text-sm text-stone-600">
                기본은 랭킹순, 필요하면 가나다순으로도 볼 수 있어요.
              </p>
            </div>
            <Link
              href={`/main?schoolId=${currentSchoolId}`}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            >
              메인으로
            </Link>
          </div>
        </header>

        <section className="flex gap-2">
          <Link
            href={`/ranking?schoolId=${currentSchoolId}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              sort === "rank"
                ? "bg-stone-900 text-white"
                : "border border-stone-200 bg-white text-stone-700"
            }`}
          >
            랭킹순
          </Link>
          <Link
            href={`/ranking?sort=name&schoolId=${currentSchoolId}`}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              sort === "name"
                ? "bg-stone-900 text-white"
                : "border border-stone-200 bg-white text-stone-700"
            }`}
          >
            가나다순
          </Link>
        </section>

        {sort === "rank" ? (
          <section className="rounded-[2rem] border border-stone-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-stone-900">TOP 3 단상</h2>
            <div className="mt-5 flex items-end justify-center gap-3 overflow-x-auto pb-2">
              {[podiumSchools[1], podiumSchools[0], podiumSchools[2]].map((school, index) => {
                if (!school) {
                  return null;
                }

                const heightClass =
                  index === 1
                    ? "h-40 bg-rose-400 text-white"
                    : index === 0
                      ? "h-32 bg-stone-200 text-stone-900"
                      : "h-24 bg-amber-100 text-stone-900";

                return (
                  <Link
                    key={school.id}
                    href={`/schools/${school.id}?fromSchoolId=${currentSchoolId}`}
                    className="flex min-w-[104px] flex-col items-center text-center"
                  >
                    <div className="mb-3 flex flex-col items-center">
                      <div className="mb-2 flex h-10 items-center justify-center text-2xl">
                        {school.rank === 1 ? "👑" : school.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      <div
                        className="flex h-24 w-24 items-end justify-center rounded-[1.5rem] border border-stone-200 bg-rose-50 bg-contain bg-bottom bg-no-repeat"
                        style={{
                          backgroundImage: `url('${getTreeImage(school.level)}')`,
                        }}
                      >
                        <span className="mb-2 rounded-full bg-white/85 px-2 py-1 text-[10px] text-stone-500">
                          나무 이미지
                        </span>
                      </div>
                    </div>
                    <p className="mb-2 text-sm font-semibold">{school.name}</p>
                    <div className={`flex w-full items-center justify-center rounded-t-2xl px-3 text-lg font-bold ${heightClass}`}>
                      {school.rank}위
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <ul className="divide-y divide-stone-200">
            {sortedSchools.map((school) => (
              <li key={school.id}>
                <Link
                  href={`/schools/${school.id}?fromSchoolId=${currentSchoolId}`}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
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
                      {school.totalPetals.toLocaleString()}점
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
