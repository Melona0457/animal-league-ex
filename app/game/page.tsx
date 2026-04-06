import { getSchoolById } from "../_lib/mock-data";
import { GameClient } from "./game-client";

type GamePageProps = {
  searchParams: Promise<{
    schoolId?: string;
    mode?: "fall" | "tap" | "drag";
  }>;
};

export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams;
  const school =
    getSchoolById(params.schoolId ?? "school-044") ??
    getSchoolById("school-044");

  if (!school) {
    return null;
  }

  return (
    <GameClient
      schoolId={school.id}
      schoolName={school.name}
      treeLevel={school.level}
      mode={params.mode === "drag" ? "drag" : params.mode === "tap" ? "tap" : "fall"}
    />
  );
}
