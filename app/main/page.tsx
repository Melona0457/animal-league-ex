import { getSchoolById } from "../_lib/mock-data";
import { MainClient } from "./main-client";

type MainPageProps = {
  searchParams: Promise<{
    schoolId?: string;
    school?: string;
    score?: string;
  }>;
};

export default async function MainPage({ searchParams }: MainPageProps) {
  const params = await searchParams;
  const school = getSchoolById(params.schoolId ?? "yonsei") ?? getSchoolById("yonsei");
  const score = Number(params.score ?? "0");

  if (!school) {
    return null;
  }

  return <MainClient school={school} score={score} />;
}
