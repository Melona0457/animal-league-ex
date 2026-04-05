"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getLevelLabel,
  getSchoolBackgroundImage,
  getSchoolTreeImage,
  getTreeStage,
  type SchoolRecord,
} from "../_lib/mock-data";

type MainClientProps = {
  school: SchoolRecord;
  score: number;
};

export function MainClient({ school, score }: MainClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalPetals = school.totalPetals + score;
  const progressPercent = Math.min(100, school.progressPercent + Math.max(score, 0) / 100);

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
        <header className="grid grid-cols-[0.9fr_1.4fr_0.7fr] gap-2 rounded-[1.75rem] border border-white/15 bg-black/30 p-3 backdrop-blur-sm sm:gap-3 sm:p-4">
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">현재 순위</p>
            <p className="mt-1 text-xl font-bold sm:text-3xl">#{school.rank}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-white/65 sm:text-xs">레벨</p>
                <p className="mt-1 text-base font-bold sm:text-2xl">
                  {getLevelLabel(school.level)} · {progressPercent.toFixed(0)}%
                </p>
                <p className="mt-1 text-[11px] text-white/65 sm:text-xs">
                  총 벚꽃 수 {totalPetals.toLocaleString()}
                </p>
              </div>
              {score > 0 ? (
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-[11px] font-semibold text-emerald-100">
                  +{score}
                </span>
              ) : null}
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#fda4af_0%,#fb7185_50%,#fecdd3_100%)] transition-[width] duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="rounded-2xl bg-white/10 px-3 py-3 text-left"
          >
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">메뉴</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">≡</p>
          </button>
        </header>

        <section className="flex flex-1 flex-col justify-center py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
            <p className="mb-3 rounded-full bg-black/30 px-4 py-2 text-xs text-white/75 backdrop-blur-sm">
              {school.name} · {getTreeStage(school.bloomRate)}
            </p>
            <div
              className="flex h-[46vh] min-h-[300px] w-full items-end justify-center bg-contain bg-bottom bg-no-repeat"
              style={{
                backgroundImage: `url('${getSchoolTreeImage(school.id, school.level)}')`,
              }}
            >
              <div className="mb-6 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                나무 이미지 슬롯: `/public${getSchoolTreeImage(school.id, school.level)}`
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 pb-2 sm:grid-cols-2">
          <Link
            href={`/game?schoolId=${school.id}`}
            className="rounded-3xl bg-rose-400 px-4 py-4 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
          >
            벚꽃 붙이기
          </Link>
          <Link
            href={`/ranking?schoolId=${school.id}`}
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
              href={`/main?schoolId=${school.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              우리학교 벚꽃 현황
            </Link>
            <Link
              href={`/ranking?schoolId=${school.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              모아보기
            </Link>
            <Link
              href={`/community?schoolId=${school.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              실시간 댓글 커뮤니티
            </Link>
            <Link href="/" className="mt-auto rounded-2xl bg-white px-4 py-4 text-center font-semibold text-stone-950">
              로그아웃
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
