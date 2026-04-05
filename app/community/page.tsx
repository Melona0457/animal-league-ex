import Link from "next/link";
import { getSchoolById } from "../_lib/mock-data";

const MOCK_COMMENTS = [
  { id: 1, school: "연세대학교", message: "오늘도 벚꽃 붙이고 갑니다." },
  { id: 2, school: "고려대학교", message: "시험은 망해도 랭킹은 못 참지." },
  { id: 3, school: "서울대학교", message: "우리 학교 아직 역전 가능해요." },
];

type CommunityPageProps = {
  searchParams: Promise<{
    schoolId?: string;
  }>;
};

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const params = await searchParams;
  const school = getSchoolById(params.schoolId ?? "yonsei") ?? getSchoolById("yonsei");

  if (!school) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-stone-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-rose-500">
                COMMUNITY
              </p>
              <h1 className="mt-1 text-2xl font-bold">실시간 댓글 커뮤니티</h1>
              <p className="mt-2 text-sm text-stone-600">
                MVP 단계라서 실시간 채팅 대신 한줄 응원판 형태의 더미 화면으로
                연결해뒀어요.
              </p>
            </div>
            <Link
              href={`/main?schoolId=${school.id}`}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
            >
              메인으로
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">현재 접속 학교</p>
          <p className="mt-1 text-lg font-semibold">{school.name}</p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <ul className="divide-y divide-stone-200">
            {MOCK_COMMENTS.map((comment) => (
              <li key={comment.id} className="p-4">
                <p className="text-sm font-semibold text-stone-800">
                  {comment.school}
                </p>
                <p className="mt-1 text-sm text-stone-600">{comment.message}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-600">
            실제 구현 시에는 댓글 작성, 실시간 반영, 학교별 필터가 들어갈 수
            있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
