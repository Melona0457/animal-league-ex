"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SCHOOL_CATALOG } from "../_lib/school-catalog";
import { getSelectedSchoolId, setSelectedSchoolId } from "../_lib/selected-school";

export function SelectSchoolClient() {
  const router = useRouter();
  const [selectedSchoolId, setSelectedSchoolIdState] = useState(() => {
    const storedSchoolId = getSelectedSchoolId();

    if (storedSchoolId && SCHOOL_CATALOG.some((school) => school.id === storedSchoolId)) {
      return storedSchoolId;
    }

    return SCHOOL_CATALOG[43]?.id ?? SCHOOL_CATALOG[0].id;
  });

  function handleEnter() {
    setSelectedSchoolId(selectedSchoolId);
    router.push(`/main?schoolId=${selectedSchoolId}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff9fb_0%,#ffe9f1_42%,#ffd4e3_100%)] px-4 py-6 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col justify-center gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-[0_24px_80px_rgba(124,58,89,0.12)] backdrop-blur-sm md:p-8">
          <p className="text-sm font-semibold tracking-[0.28em] text-rose-500">
            SCHOOL SELECT
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-stone-950 md:text-5xl">
            어느 학교 벚꽃으로
            <br />
            들어갈지 먼저 골라주세요
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
            로그인 없이 바로 들어가요. 학교만 고르면 바로 메인 화면으로 이동하고, 선택한 학교는 이 브라우저에 기억해둘게요.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(124,58,89,0.1)] backdrop-blur-sm md:p-8">
          <label className="block">
            <span className="mb-3 block text-sm font-semibold text-stone-700">소속 대학 선택</span>
            <select
              value={selectedSchoolId}
              onChange={(event) => setSelectedSchoolIdState(event.target.value)}
              className="h-14 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            >
              {SCHOOL_CATALOG.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleEnter}
            className="mt-5 w-full rounded-2xl bg-stone-900 px-4 py-4 text-base font-semibold text-white"
          >
            이 학교로 입장하기
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-stone-500">
            언제든 메뉴에서 학교를 다시 선택할 수 있어요.
          </p>
        </section>
      </div>
    </main>
  );
}
