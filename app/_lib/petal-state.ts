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

  try {
    const response = await fetch("/api/petal-placements/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schoolId,
        petals,
      }),
    });

    if (!response.ok) {
      console.error("[petal-state] failed to insert petals", { schoolId });
      return [] as PetalPlacement[];
    }
  } catch {
    console.error("[petal-state] failed to insert petals", { schoolId });
    return [] as PetalPlacement[];
  }

  return getPetalsBySchoolId(schoolId);
}

export async function shakePetals(schoolId: string, shakeCount: number): Promise<ShakePetalResult> {
  try {
    const response = await fetch("/api/petal-placements/shake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schoolId,
        shakeCount,
      }),
    });

    if (!response.ok) {
      return {
        removedCount: 0,
        petals: await getPetalsBySchoolId(schoolId),
        reason: "delete_failed",
        message: "벚꽃잎을 삭제하지 못했어요. petal_placements 정책을 확인해주세요.",
      };
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      result?: ShakePetalResult;
    };

    if (!payload.ok || !payload.result) {
      return {
        removedCount: 0,
        petals: await getPetalsBySchoolId(schoolId),
        reason: "delete_failed",
        message: "벚꽃잎을 삭제하지 못했어요. petal_placements 정책을 확인해주세요.",
      };
    }

    return payload.result;
  } catch {
    return {
      removedCount: 0,
      petals: await getPetalsBySchoolId(schoolId),
      reason: "delete_failed",
      message: "벚꽃잎을 삭제하지 못했어요. petal_placements 정책을 확인해주세요.",
    };
  }
}
