import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "../../../_lib/supabase-server";

type PetalPlacement = {
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

type ShakeResult =
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

async function loadPetalsBySchoolId(schoolId: string) {
  const supabase = getServerSupabaseClient();
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      schoolId?: string;
      shakeCount?: number;
    };

    const schoolId = body.schoolId?.trim();
    const shakeCount = Math.max(0, Math.trunc(Number(body.shakeCount ?? 0)));

    if (!schoolId) {
      return NextResponse.json(
        { ok: false, message: "invalid payload" },
        { status: 400 },
      );
    }

    const petals = await loadPetalsBySchoolId(schoolId);
    const removable = pickRandomPetals(petals, Math.min(shakeCount, petals.length));

    if (removable.length === 0) {
      const result: ShakeResult = {
        removedCount: 0,
        petals,
        reason: "no_petals",
        message: "이 학교에 저장된 벚꽃잎이 아직 없어서 떨어뜨릴 수 없어요.",
      };

      return NextResponse.json({ ok: true, result });
    }

    const supabase = getServerSupabaseClient();
    const { error } = await supabase
      .from("petal_placements")
      .delete()
      .in(
        "id",
        removable.map((petal) => petal.id),
      );

    if (error) {
      const result: ShakeResult = {
        removedCount: 0,
        petals,
        reason: "delete_failed",
        message: "벚꽃잎을 삭제하지 못했어요. petal_placements 정책을 확인해주세요.",
      };

      return NextResponse.json({ ok: true, result });
    }

    const nextPetals = await loadPetalsBySchoolId(schoolId);
    const result: ShakeResult = {
      removedCount: removable.length,
      petals: nextPetals,
      reason: "removed",
    };

    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json(
      { ok: false, message: "internal error" },
      { status: 500 },
    );
  }
}
