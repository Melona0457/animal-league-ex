"use client";

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

function progressFromTotal(totalPetals: number) {
  return Math.max(0, Math.min(100, Math.floor(totalPetals / 100)));
}

function levelFromProgress(progressPercent: number) {
  if (progressPercent >= 80) return 5;
  if (progressPercent >= 60) return 4;
  if (progressPercent >= 40) return 3;
  if (progressPercent >= 20) return 2;
  return 1;
}

function mapRows(rows: SchoolRow[]) {
  const defaults = defaultSchools();
  const orderMap = new Map(defaults.map((school) => [school.id, school.order]));

  const mapped = rows.map((row) => ({
    id: row.id,
    name: row.name,
    totalPetals: row.total_petals,
    bloomRate: row.bloom_rate,
    level: row.level,
    rank: row.rank,
    progressPercent: row.progress_percent,
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
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  if (error || !data) {
    return;
  }

  const totalPetals = Math.max(0, (data as SchoolRow).total_petals + score);
  const progressPercent = progressFromTotal(totalPetals);
  const level = levelFromProgress(progressPercent);

  await supabase
    .from("schools")
    .update({
      total_petals: totalPetals,
      bloom_rate: progressPercent,
      progress_percent: progressPercent,
      level,
    })
    .eq("id", schoolId);
}

export async function applyShake(schoolId: string, amount = 30) {
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", schoolId)
    .single();

  if (error || !data) {
    return;
  }

  const totalPetals = Math.max(0, (data as SchoolRow).total_petals - amount);
  const progressPercent = progressFromTotal(totalPetals);
  const level = levelFromProgress(progressPercent);

  await supabase
    .from("schools")
    .update({
      total_petals: totalPetals,
      bloom_rate: progressPercent,
      progress_percent: progressPercent,
      level,
    })
    .eq("id", schoolId);
}
