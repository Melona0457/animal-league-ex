"use client";

import { getDefaultSchoolRecords, type SchoolRecord } from "./mock-data";
import { levelFromTotal, progressFromTotal } from "./school-progress";
import { supabase } from "./supabase";

type SchoolRow = {
  id: string;
  name: string;
  total_petals: number;
  bloom_rate: number;
  level: number;
  rank: number;
  progress_percent: number;
};

function defaultSchools() {
  return getDefaultSchoolRecords();
}

function rankSchools(schools: SchoolRecord[]) {
  return [...schools]
    .sort((a, b) => b.totalPetals - a.totalPetals || a.order - b.order)
    .map((school, index) => ({
      ...school,
      rank: index + 1,
    }));
}

function mapRows(rows: SchoolRow[]) {
  const defaults = defaultSchools();
  const orderMap = new Map(defaults.map((school) => [school.id, school.order]));

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    totalPetals: row.total_petals,
    bloomRate: progressFromTotal(row.total_petals),
    level: levelFromTotal(row.total_petals),
    rank: row.rank,
    progressPercent: progressFromTotal(row.total_petals),
    shakeAvailable: true,
    order: orderMap.get(row.id) ?? 9999,
  }));

  return rankSchools(mapped);
}

export async function getStoredSchools() {
  const { data, error } = await supabase.from("schools").select("*");

  if (error || !data) {
    return defaultSchools();
  }

  return mapRows(data as SchoolRow[]);
}

export async function getStoredSchoolById(schoolId: string) {
  const schools = await getStoredSchools();
  return schools.find((school) => school.id === schoolId);
}

export async function applyGameScore(schoolId: string, score: number) {
  try {
    const response = await fetch("/api/schools/apply-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schoolId,
        score,
      }),
    });

    if (!response.ok) {
      return;
    }
  } catch {
    return;
  }
}

export async function applyShake(schoolId: string, amount = 30) {
  try {
    const response = await fetch("/api/schools/apply-shake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schoolId,
        amount,
      }),
    });

    if (!response.ok) {
      return;
    }
  } catch {
    return;
  }
}
