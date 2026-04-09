import { NextResponse } from "next/server";
import { levelFromTotal, progressFromTotal } from "../../../_lib/school-progress";
import { getServerSupabaseClient } from "../../../_lib/supabase-server";

type SchoolRow = {
  id: string;
  total_petals: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      schoolId?: string;
      score?: number;
    };

    const schoolId = body.schoolId?.trim();
    const score = Number(body.score ?? 0);

    if (!schoolId || !Number.isFinite(score)) {
      return NextResponse.json(
        { ok: false, message: "invalid payload" },
        { status: 400 },
      );
    }

    const supabase = getServerSupabaseClient();
    const { data, error } = await supabase
      .from("schools")
      .select("id,total_petals")
      .eq("id", schoolId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: "school not found" },
        { status: 404 },
      );
    }

    const row = data as SchoolRow;
    const totalPetals = Math.max(0, row.total_petals + Math.trunc(score));
    const progressPercent = progressFromTotal(totalPetals);
    const level = levelFromTotal(totalPetals);

    const { error: updateError } = await supabase
      .from("schools")
      .update({
        total_petals: totalPetals,
        bloom_rate: progressPercent,
        progress_percent: progressPercent,
        level,
      })
      .eq("id", schoolId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: "failed to update school" },
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
