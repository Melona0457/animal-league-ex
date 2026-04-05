"use client";

import { getDefaultSchoolRecords, type SchoolRecord } from "./mock-data";

const SCHOOL_STATE_KEY = "blossom-save-school-state-v1";

function canUseStorage() {
  return typeof window !== "undefined";
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

export function getStoredSchools() {
  const defaults = getDefaultSchoolRecords();

  if (!canUseStorage()) {
    return defaults;
  }

  const saved = window.localStorage.getItem(SCHOOL_STATE_KEY);

  if (!saved) {
    window.localStorage.setItem(SCHOOL_STATE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    return rankSchools(JSON.parse(saved) as SchoolRecord[]);
  } catch {
    window.localStorage.setItem(SCHOOL_STATE_KEY, JSON.stringify(defaults));
    return defaults;
  }
}

export function saveStoredSchools(schools: SchoolRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    SCHOOL_STATE_KEY,
    JSON.stringify(rankSchools(schools)),
  );
}

export function getStoredSchoolById(schoolId: string) {
  return getStoredSchools().find((school) => school.id === schoolId);
}

export function applyGameScore(schoolId: string, score: number) {
  const nextSchools = getStoredSchools().map((school) => {
    if (school.id !== schoolId) {
      return school;
    }

    const totalPetals = Math.max(0, school.totalPetals + score);
    const progressPercent = progressFromTotal(totalPetals);

    return {
      ...school,
      totalPetals,
      bloomRate: progressPercent,
      progressPercent,
      level: levelFromProgress(progressPercent),
    };
  });

  saveStoredSchools(nextSchools);
}

export function applyShake(schoolId: string, amount = 30) {
  const nextSchools = getStoredSchools().map((school) => {
    if (school.id !== schoolId) {
      return school;
    }

    const totalPetals = Math.max(0, school.totalPetals - amount);
    const progressPercent = progressFromTotal(totalPetals);

    return {
      ...school,
      totalPetals,
      bloomRate: progressPercent,
      progressPercent,
      level: levelFromProgress(progressPercent),
    };
  });

  saveStoredSchools(nextSchools);
}
