import { getSchoolById } from "../_lib/mock-data";
import { GameClient } from "./game-client";

type GamePageProps = {
  searchParams: Promise<{
    schoolId?: string;
  }>;
};

export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams;
  const school =
    getSchoolById(params.schoolId ?? "school-045") ??
    getSchoolById("school-045");

  if (!school) {
    return null;
  }

  return <GameClient schoolId={school.id} schoolName={school.name} />;
}
