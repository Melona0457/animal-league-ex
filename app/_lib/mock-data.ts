import { SCHOOL_CATALOG } from "./school-catalog";

export type SchoolRecord = {
  id: string;
  name: string;
  totalPetals: number;
  bloomRate: number;
  level: number;
  rank: number;
  progressPercent: number;
  shakeAvailable: boolean;
  order: number;
};

export const SCHOOLS: SchoolRecord[] = SCHOOL_CATALOG.map((school, index) => {
  const totalPetals = 9600 - index * 87;
  const progressPercent = Math.max(12, Math.min(100, Math.floor(totalPetals / 100)));
  const level =
    progressPercent >= 80
      ? 5
      : progressPercent >= 60
        ? 4
        : progressPercent >= 40
          ? 3
          : progressPercent >= 20
            ? 2
            : 1;

  return {
    id: school.id,
    name: school.name,
    totalPetals,
    bloomRate: progressPercent,
    level,
    rank: index + 1,
    progressPercent,
    shakeAvailable: true,
    order: index,
  };
});

export function getDefaultSchoolRecords() {
  return SCHOOLS.map((school) => ({ ...school }));
}

export function getSchoolById(schoolId: string) {
  return SCHOOLS.find((school) => school.id === schoolId);
}

export function getRankedSchools() {
  return [...SCHOOLS].sort((a, b) => a.rank - b.rank);
}

export function getSchoolsByName() {
  return [...SCHOOLS].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export function getLevelLabel(level: number) {
  return `Lv.${level}`;
}

export function getTreeStage(bloomRate: number) {
  if (bloomRate >= 80) {
    return "만개 직전";
  }
  if (bloomRate >= 60) {
    return "벚꽃 풍성";
  }
  if (bloomRate >= 40) {
    return "가지가 차오름";
  }
  if (bloomRate >= 20) {
    return "꽃눈 생성";
  }
  return "새싹 단계";
}

export function getLandingBackgroundImage() {
  return "/images/landing/hero-background.jpg";
}

export function getSchoolBackgroundImage(schoolId: string) {
  return `/images/schools/${schoolId}/main-background.jpg`;
}

export function getSchoolTreeImage(schoolId: string, level: number) {
  return `/images/schools/${schoolId}/tree-level-${level}.png`;
}
