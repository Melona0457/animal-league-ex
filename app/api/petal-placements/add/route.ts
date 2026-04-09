import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "../../../_lib/supabase-server";

type AddPetalInput = {
  xPercent: number;
  yPercent: number;
  rotation: number;
  scale: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      schoolId?: string;
      petals?: AddPetalInput[];
    };

    const schoolId = body.schoolId?.trim();
    const petals = Array.isArray(body.petals) ? body.petals : [];

    if (!schoolId || petals.length === 0) {
      return NextResponse.json(
        { ok: false, message: "invalid payload" },
        { status: 400 },
      );
    }

    const hasInvalid = petals.some(
      (petal) =>
        !isFiniteNumber(petal.xPercent) ||
        !isFiniteNumber(petal.yPercent) ||
        !isFiniteNumber(petal.rotation) ||
        !isFiniteNumber(petal.scale),
    );

    if (hasInvalid) {
      return NextResponse.json(
        { ok: false, message: "invalid petal payload" },
        { status: 400 },
      );
    }

    const rows = petals.map((petal) => ({
      id: crypto.randomUUID(),
      school_id: schoolId,
      x_percent: petal.xPercent,
      y_percent: petal.yPercent,
      rotation: petal.rotation,
      scale: petal.scale,
    }));

    const supabase = getServerSupabaseClient();
    const { error } = await supabase.from("petal_placements").insert(rows);

    if (error) {
      return NextResponse.json(
        { ok: false, message: "failed to insert petals" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "internal error" },
      { status: 500 },
    );
  }
}
