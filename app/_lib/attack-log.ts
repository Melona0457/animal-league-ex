"use client";

import { supabase } from "./supabase";

type AttackLogRow = {
  id: string;
  attacker_school_id: string;
  attacker_school_name: string;
  target_school_id: string;
  target_school_name: string;
  reduced_petals: number;
  created_at: string;
};

export type AttackLog = {
  id: string;
  attackerSchoolId: string;
  attackerSchoolName: string;
  targetSchoolId: string;
  targetSchoolName: string;
  reducedPetals: number;
  createdAt: string;
};

function mapAttackLog(row: AttackLogRow): AttackLog {
  return {
    id: row.id,
    attackerSchoolId: row.attacker_school_id,
    attackerSchoolName: row.attacker_school_name,
    targetSchoolId: row.target_school_id,
    targetSchoolName: row.target_school_name,
    reducedPetals: row.reduced_petals,
    createdAt: row.created_at,
  };
}

export async function getAttackLogsForSchool(schoolId: string, limit = 5) {
  const { data, error } = await supabase
    .from("attack_logs")
    .select("*")
    .eq("target_school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as AttackLogRow[]).map(mapAttackLog);
}

export async function createAttackLog({
  attackerSchoolId,
  targetSchoolId,
  reducedPetals,
}: {
  attackerSchoolId: string;
  targetSchoolId: string;
  reducedPetals: number;
}) {
  if (!attackerSchoolId || !targetSchoolId || attackerSchoolId === targetSchoolId) {
    return;
  }

  try {
    await fetch("/api/attack-logs/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attackerSchoolId,
        targetSchoolId,
        reducedPetals,
      }),
    });
  } catch {
    return;
  }
}

export function formatAttackTime(createdAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}
