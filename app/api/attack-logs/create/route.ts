import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "../../../_lib/supabase-server";

type SchoolNameRow = {
  id: string;
  name: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      attackerSchoolId?: string;
      targetSchoolId?: string;
      reducedPetals?: number;
    };

    const attackerSchoolId = body.attackerSchoolId?.trim();
    const targetSchoolId = body.targetSchoolId?.trim();
    const reducedPetals = Math.max(0, Math.trunc(Number(body.reducedPetals ?? 0)));

    if (
      !attackerSchoolId ||
      !targetSchoolId ||
      attackerSchoolId === targetSchoolId ||
      reducedPetals <= 0
    ) {
      return NextResponse.json({ ok: true });
    }

    const supabase = getServerSupabaseClient();
    const attackerResult = (await supabase
      .from("schools")
      .select("id,name")
      .eq("id", attackerSchoolId)
      .single()) as {
      data: SchoolNameRow | null;
      error: unknown;
    };
    const targetResult = (await supabase
      .from("schools")
      .select("id,name")
      .eq("id", targetSchoolId)
      .single()) as {
      data: SchoolNameRow | null;
      error: unknown;
    };

    if (
      attackerResult.error ||
      targetResult.error ||
      !attackerResult.data ||
      !targetResult.data
    ) {
      return NextResponse.json({ ok: true });
    }

    const attacker = attackerResult.data;
    const target = targetResult.data;

    await supabase.from("attack_logs").insert({
      id: crypto.randomUUID(),
      attacker_school_id: attacker.id,
      attacker_school_name: attacker.name,
      target_school_id: target.id,
      target_school_name: target.name,
      reduced_petals: reducedPetals,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "internal error" },
      { status: 500 },
    );
  }
}
