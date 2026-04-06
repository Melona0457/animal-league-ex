import Link from "next/link";
import { getSchoolById } from "../../_lib/mock-data";

type GameSelectPageProps = {
  searchParams: Promise<{
    schoolId?: string;
  }>;
};

const GAME_MODES = [
  {
    id: "fall",
    title: "클래식 낙하형",
    description: "위에서 떨어지는 벚꽃과 벌레를 빠르게 눌러 점수를 쌓는 기존 방식이에요.",
  },
  {
    id: "tap",
    title: "터치로 바로 붙이기",
    description: "현재 나무와 기존 꽃잎을 보면서 원하는 위치를 톡 누르면 그 자리에 바로 붙어요.",
  },
];

export default async function GameSelectPage({
  searchParams,
}: GameSelectPageProps) {
  const params = await searchParams;
  const school =
    getSchoolById(params.schoolId ?? "school-044") ??
    getSchoolById("school-044");

  if (!school) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-5 text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-4">
        <header className="rounded-[2rem] border border-white/70 bg-white/50 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-rose-500">
            GAME SELECT
          </p>
          <h1 className="mt-3 text-3xl font-bold">{school.name} 벚꽃 붙이기 선택</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            벚꽃을 붙이는 방식을 먼저 고르고, 선택한 방식으로 바로 미니게임에 들어가요.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {GAME_MODES.map((mode) => (
            <article
              key={mode.id}
              className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_16px_50px_rgba(120,73,96,0.08)] backdrop-blur-sm"
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-rose-500">
                MODE
              </p>
              <h2 className="mt-3 text-2xl font-bold">{mode.title}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-stone-600">
                {mode.description}
              </p>
              <Link
                href={`/game?schoolId=${school.id}&mode=${mode.id}`}
                className="mt-6 flex items-center justify-center rounded-2xl bg-stone-900 px-4 py-4 text-sm font-semibold text-white"
              >
                미니게임 시작
              </Link>
            </article>
          ))}
        </section>

        <Link
          href={`/main?schoolId=${school.id}`}
          className="mt-auto rounded-2xl border border-stone-200 bg-white/70 px-4 py-4 text-center text-sm font-semibold text-stone-700"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
