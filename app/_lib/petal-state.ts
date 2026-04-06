"use client";

import { supabase } from "./supabase";

export type PetalPlacement = {
  id: string;
  schoolId: string;
  xPercent: number;
  yPercent: number;
  rotation: number;
  scale: number;
  createdAt: string;
};

export type ShakePetalResult =
  | {
      removedCount: number;
      petals: PetalPlacement[];
      reason: "removed";
    }
  | {
      removedCount: 0;
      petals: PetalPlacement[];
      reason: "no_petals" | "delete_failed";
      message?: string;
    };

type PetalRow = {
  id: string;
  school_id: string;
  x_percent: number;
  y_percent: number;
  rotation: number;
  scale: number;
  created_at: string;
};

function mapRows(rows: PetalRow[]) {
  return rows.map((row) => ({
    id: row.id,
    schoolId: row.school_id,
    xPercent: row.x_percent,
    yPercent: row.y_percent,
    rotation: row.rotation,
    scale: row.scale,
    createdAt: row.created_at,
  }));
}

function pickRandomPetals<T>(items: T[], count: number) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export async function getPetalsBySchoolId(schoolId: string) {
  const { data, error } = await supabase
    .from("petal_placements")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) {
      console.error("[petal-state] failed to load petals", { schoolId, error });
    }
    return [] as PetalPlacement[];
  }

  return mapRows(data as PetalRow[]);
}

export async function addPetalPlacements(
  schoolId: string,
  petals: Array<Pick<PetalPlacement, "xPercent" | "yPercent" | "rotation" | "scale">>,
) {
  if (petals.length === 0) {
    return [];
  }

  const rows = petals.map((petal, index) => ({
    id: `petal-${schoolId}-${Date.now()}-${index}`,
    school_id: schoolId,
    x_percent: petal.xPercent,
    y_percent: petal.yPercent,
    rotation: petal.rotation,
    scale: petal.scale,
  }));

  const { error } = await supabase.from("petal_placements").insert(rows);

  if (error) {
    console.error("[petal-state] failed to insert petals", { schoolId, error });
    return [] as PetalPlacement[];
  }

  return getPetalsBySchoolId(schoolId);
}

export async function shakePetals(schoolId: string, shakeCount: number): Promise<ShakePetalResult> {
  const petals = await getPetalsBySchoolId(schoolId);
  const removable = pickRandomPetals(petals, Math.min(shakeCount, petals.length));

  if (removable.length === 0) {
    return {
      removedCount: 0,
      petals,
      reason: "no_petals",
      message: "이 학교에 저장된 벚꽃잎이 아직 없어서 떨어뜨릴 수 없어요.",
    };
  }

  const { error } = await supabase
    .from("petal_placements")
    .delete()
    .in(
      "id",
      removable.map((petal) => petal.id),
    );

  if (error) {
    console.error("[petal-state] failed to delete petals", {
      schoolId,
      shakeCount,
      removableIds: removable.map((petal) => petal.id),
      error,
    });

    return {
      removedCount: 0,
      petals,
      reason: "delete_failed",
      message: "벚꽃잎을 삭제하지 못했어요. petal_placements 정책을 확인해주세요.",
    };
  }

  const nextPetals = await getPetalsBySchoolId(schoolId);

  return {
    removedCount: removable.length,
    petals: nextPetals,
    reason: "removed",
  };
}
