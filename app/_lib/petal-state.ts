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

export async function getPetalsBySchoolId(schoolId: string) {
  const { data, error } = await supabase
    .from("petal_placements")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: true });

  if (error || !data) {
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
    return [] as PetalPlacement[];
  }

  return getPetalsBySchoolId(schoolId);
}

export async function shakePetals(schoolId: string, shakeCount: number) {
  const petals = await getPetalsBySchoolId(schoolId);
  const removable = petals.slice(0, Math.min(shakeCount, petals.length));

  if (removable.length === 0) {
    return { removedCount: 0, petals };
  }

  const { error } = await supabase
    .from("petal_placements")
    .delete()
    .in(
      "id",
      removable.map((petal) => petal.id),
    );

  if (error) {
    return { removedCount: 0, petals };
  }

  const nextPetals = await getPetalsBySchoolId(schoolId);

  return {
    removedCount: removable.length,
    petals: nextPetals,
  };
}
