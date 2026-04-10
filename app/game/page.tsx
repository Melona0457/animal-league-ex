import { getSchoolById } from "../_lib/mock-data";
import { resolveSchoolIdFromRequest } from "../_lib/selected-school-server";
import { GameClient } from "./game-client";
import { redirect } from "next/navigation";

type GamePageProps = {
  searchParams: Promise<{
    schoolId?: string;
    mode?: "fall" | "tap" | "prototype1";
  }>;
};

export default async function GamePage({ searchParams }: GamePageProps) {
  const params = await searchParams;
  const resolvedSchoolId = await resolveSchoolIdFromRequest(params.schoolId);

  if (!resolvedSchoolId) {
    redirect("/select-school");
  }

  const school =
    getSchoolById(resolvedSchoolId) ?? getSchoolById("school-044");

  if (!school) {
    return null;
  }

  if (params.mode === "prototype1") {
    const { PrototypeOneGameClient } = await import(
      "./prototype-one-game-client"
    );
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
