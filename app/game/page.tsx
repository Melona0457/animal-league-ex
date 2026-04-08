import { getSchoolById } from "../_lib/mock-data";
import { GameClient } from "./game-client";
import { PrototypeOneGameClient } from "./prototype-one-game-client";

type GamePageProps = {
  searchParams: Promise<{
    schoolId?: string;
    mode?: "fall" | "tap" | "prototype1";
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

  if (params.mode === "prototype1") {
    return <PrototypeOneGameClient schoolId={school.id} schoolName={school.name} />;
  }

  return (
    <GameClient
      schoolId={school.id}
      schoolName={school.name}
      treeLevel={school.level}
      mode={params.mode === "tap" ? "tap" : "fall"}
    />
  );
}
