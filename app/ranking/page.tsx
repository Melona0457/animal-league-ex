import { RankingClient } from "./ranking-client";

type RankingPageProps = {
  searchParams: Promise<{
    sort?: string;
    schoolId?: string;
  }>;
};

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const params = await searchParams;
  const sort = params.sort === "name" ? "name" : "rank";
  const currentSchoolId = params.schoolId ?? "school-045";

  return <RankingClient currentSchoolId={currentSchoolId} sort={sort} />;
}
