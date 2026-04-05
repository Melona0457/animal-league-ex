"use client";

import Link from "next/link";
import { useState } from "react";
import { getLevelLabel, type SchoolRecord } from "../_lib/mock-data";
import { getStoredSchools } from "../_lib/school-state";

type RankingClientProps = {
  currentSchoolId: string;
  sort: "rank" | "name";
};

export function RankingClient({ currentSchoolId, sort }: RankingClientProps) {
  const [schools] = useState<SchoolRecord[]>(() => getStoredSchools());

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
                    className="flex min-w-24 flex-col items-center text-center"
                  >
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-stone-200 bg-rose-50 text-2xl">
                      {school.rank === 1 ? "👑" : school.rank === 2 ? "🥈" : "🥉"}
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
                  <div className="min-w-0">
                    <p className="text-sm text-stone-500">#{school.rank}</p>
                    <p className="truncate text-base font-semibold">{school.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {getLevelLabel(school.level)} / 개화율 {school.bloomRate}%
                    </p>
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
