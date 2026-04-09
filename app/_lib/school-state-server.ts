import { getDefaultSchoolRecords, type SchoolRecord } from "./mock-data";
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

function rankSchools(schools: SchoolRecord[]) {
  return [...schools]
    .sort((a, b) => b.totalPetals - a.totalPetals || a.order - b.order)
    .map((school, index) => ({
      ...school,
      rank: index + 1,
    }));
}

function getLevelRange(totalPetals: number) {
  if (totalPetals <= 300) {
    return { level: 1, start: 0, end: 300 };
  }
  if (totalPetals <= 600) {
    return { level: 2, start: 300, end: 600 };
  }
  if (totalPetals <= 1000) {
    return { level: 3, start: 600, end: 1000 };
  }
  if (totalPetals <= 2000) {
    return { level: 4, start: 1000, end: 2000 };
  }
  if (totalPetals <= 4000) {
    return { level: 5, start: 2000, end: 4000 };
  }
  if (totalPetals < 12000) {
    return { level: 6, start: 4000, end: 12000 };
  }

  return { level: 7, start: 12000, end: 12000 };
}

function progressFromTotal(totalPetals: number) {
  const range = getLevelRange(totalPetals);

  if (range.level >= 7) {
    return 100;
  }

  const span = range.end - range.start;

  if (span <= 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, Math.floor(((totalPetals - range.start) / span) * 100)));
}

function levelFromTotal(totalPetals: number) {
  return getLevelRange(totalPetals).level;
}

function mapRows(rows: SchoolRow[]) {
  const defaults = getDefaultSchoolRecords();
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

export async function getStoredSchoolByIdServer(schoolId: string) {
  const { data, error } = await supabase.from("schools").select("*");

  if (error || !data) {
    return getDefaultSchoolRecords().find((school) => school.id === schoolId) ?? null;
  }

  return mapRows(data as SchoolRow[]).find((school) => school.id === schoolId) ?? null;
}
