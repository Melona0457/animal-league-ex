"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  getDefaultSchoolRecords,
  getLevelLabel,
  getSchoolBackgroundImage,
  getTreeImage,
  getTreeStage,
  type SchoolRecord,
} from "../../_lib/mock-data";
import { applyShake, getStoredSchoolById } from "../../_lib/school-state";

type SchoolDetailClientProps = {
  schoolId: string;
  fromSchoolId: string;
  shakenCount: number;
};

export function SchoolDetailClient({
  schoolId,
  fromSchoolId,
  shakenCount,
}: SchoolDetailClientProps) {
  const [isShaking, startShakeTransition] = useTransition();
  const [school, setSchool] = useState<SchoolRecord | undefined>(
    getDefaultSchoolRecords().find((item) => item.id === schoolId),
  );

  useEffect(() => {
    let isActive = true;

    async function loadSchool() {
      const storedSchool =
        (await getStoredSchoolById(schoolId)) ??
        getDefaultSchoolRecords().find((item) => item.id === schoolId);

      if (isActive) {
        setSchool(storedSchool);
      }
    }

    loadSchool();

    return () => {
      isActive = false;
    };
  }, [schoolId, shakenCount]);

  function handleShake() {
    startShakeTransition(async () => {
      await applyShake(schoolId);
      const nextSchool = await getStoredSchoolById(schoolId);
      setSchool(nextSchool);
    });
  }

  if (!school) {
    return null;
  }

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
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">레벨</p>
            <p className="mt-1 text-base font-bold sm:text-2xl">
              {getLevelLabel(school.level)} · {school.bloomRate}%
            </p>
            <p className="mt-1 text-[11px] text-white/65 sm:text-xs">
              총 벚꽃 수 {school.totalPetals.toLocaleString()}
            </p>
          </div>
          <Link
            href={`/ranking?schoolId=${fromSchoolId}`}
            className="rounded-2xl bg-white/10 px-3 py-3 text-left"
          >
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">돌아가기</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">목록</p>
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
            <p className="mb-3 rounded-full bg-black/30 px-4 py-2 text-xs text-white/75 backdrop-blur-sm">
              {school.name} · {getTreeStage(school.bloomRate)}
            </p>
            <div
              className="flex h-[46vh] min-h-[300px] w-full items-end justify-center bg-contain bg-bottom bg-no-repeat"
              style={{
                backgroundImage: `url('${getTreeImage(school.level)}')`,
              }}
            >
              <div className="mb-6 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                나무 이미지 슬롯: `/public${getTreeImage(school.level)}`
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 pb-2">
          <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white/85 backdrop-blur-sm">
            테스트 확인용으로 흔들기 제한을 잠시 풀어둔 상태예요. 현재 사용 횟수 표시: {shakenCount}회
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/schools/${school.id}?fromSchoolId=${fromSchoolId}&shaken=${shakenCount + 1}`}
              onClick={handleShake}
              className="rounded-3xl bg-rose-400 px-4 py-4 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
            >
              {isShaking ? "흔드는 중..." : "흔들기 사용하기"}
            </Link>
            <Link
              href={`/main?schoolId=${fromSchoolId}`}
              className="rounded-3xl border border-white/20 bg-white/10 px-4 py-4 text-center text-base font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
            >
              내 학교로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
