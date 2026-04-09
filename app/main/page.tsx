import { getSchoolById } from "../_lib/mock-data";
import { resolveSchoolIdFromRequest } from "../_lib/selected-school-server";
import { MainClient } from "./main-client";
import { redirect } from "next/navigation";

type MainPageProps = {
  searchParams: Promise<{
    schoolId?: string;
    school?: string;
    score?: string;
  }>;
};

export default async function MainPage({ searchParams }: MainPageProps) {
  const params = await searchParams;
  const resolvedSchoolId = await resolveSchoolIdFromRequest(params.schoolId);

  if (!resolvedSchoolId) {
    redirect("/select-school");
  }

  const school =
    getSchoolById(resolvedSchoolId) ?? getSchoolById("school-044");
  const score = Number(params.score ?? "0");

  if (!school) {
    return null;
  }

  return <MainClient school={school} score={score} />;
}
