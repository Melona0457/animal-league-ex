"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SCHOOL_CATALOG } from "../_lib/school-catalog";
import { getSelectedSchoolId, setSelectedSchoolId } from "../_lib/selected-school";

export function SelectSchoolClient() {
  const router = useRouter();
  const sortedSchools = useMemo(
    () => [...SCHOOL_CATALOG].sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [],
  );
  const [selectedSchoolId, setSelectedSchoolIdState] = useState(() => {
    const storedSchoolId = getSelectedSchoolId();

    if (storedSchoolId && SCHOOL_CATALOG.some((school) => school.id === storedSchoolId)) {
      return storedSchoolId;
    }

    return SCHOOL_CATALOG[43]?.id ?? SCHOOL_CATALOG[0].id;
  });
  const [isSchoolListOpen, setIsSchoolListOpen] = useState(false);
  const selectedSchool = sortedSchools.find((school) => school.id === selectedSchoolId);

  function handleEnter() {
    setSelectedSchoolId(selectedSchoolId);
    router.push("/main");
  }

  return (
    <main className="min-h-screen px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col justify-center gap-6">
        <section className="select-school-panel select-school-panel-primary rounded-[2rem] border border-white/15 bg-black/28 p-6 shadow-[0_24px_80px_rgba(16,10,15,0.16)] backdrop-blur-md md:p-8">
          <p className="text-sm font-semibold tracking-[0.28em] text-rose-500">
            SCHOOL SELECT
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white md:text-5xl">
            우리 학교 벚꽃나무를
            <br />
            먼저 선택해주세요
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            우리 학교 벚꽃을 살리러 가볼까요? 
            <br />
            학교만 고르면 바로 메인 화면으로 이동하고, 선택한 학교는 이 브라우저에 기억해둘게요.
          </p>
        </section>

        <section className="select-school-panel select-school-panel-secondary rounded-[2rem] border border-white/15 bg-black/28 p-6 shadow-[0_24px_80px_rgba(16,10,15,0.14)] backdrop-blur-md md:p-8">
          <label className="block">
            <span className="mb-3 block text-sm font-semibold text-white/82">소속 대학 선택</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSchoolListOpen((current) => !current)}
                className="flex h-14 w-full items-center justify-between rounded-2xl border border-white/15 bg-white/92 px-4 text-left text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-200"
              >
                <span>{selectedSchool?.name ?? "학교를 선택해주세요"}</span>
                <span className="text-sm text-stone-500">▼</span>
              </button>
              {isSchoolListOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-56 overflow-y-auto rounded-2xl border border-white/20 bg-white text-stone-900 shadow-[0_18px_50px_rgba(16,10,15,0.2)]">
                  {sortedSchools.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => {
                        setSelectedSchoolIdState(school.id);
                        setIsSchoolListOpen(false);
                      }}
                      className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-rose-50 ${
                        school.id === selectedSchoolId ? "bg-rose-100 font-bold text-rose-700" : ""
                      }`}
                    >
                      {school.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          <button
            type="button"
            onClick={handleEnter}
            className="mt-5 w-full rounded-2xl bg-stone-900 px-4 py-4 text-base font-semibold text-white"
          >
            이 학교로 입장하기
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-white/58">
            언제든 학교를 다시 선택할 수 있어요.
          </p>
        </section>
      </div>
    </main>
  );
}
