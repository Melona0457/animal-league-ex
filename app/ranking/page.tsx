import { RankingClient } from "./ranking-client";
import { resolveSchoolIdFromRequest } from "../_lib/selected-school-server";
import { redirect } from "next/navigation";

type RankingPageProps = {
  searchParams: Promise<{
    sort?: string;
    schoolId?: string;
  }>;
};

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const params = await searchParams;
  const sort = params.sort === "name" ? "name" : "rank";
  const currentSchoolId = await resolveSchoolIdFromRequest(params.schoolId);

  if (!currentSchoolId) {
    redirect("/select-school");
  }

  return <RankingClient currentSchoolId={currentSchoolId} sort={sort} />;
}
