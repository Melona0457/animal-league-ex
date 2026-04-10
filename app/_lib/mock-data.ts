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
  const level =
    totalPetals >= 12000
      ? 7
      : totalPetals >= 4001
        ? 6
        : totalPetals >= 2001
          ? 5
          : totalPetals >= 1001
            ? 4
            : totalPetals >= 601
              ? 3
              : totalPetals >= 301
                ? 2
                : 1;
  const progressPercent =
    level >= 7
      ? 100
      : level === 6
        ? Math.floor(((totalPetals - 4000) / 8000) * 100)
        : level === 5
          ? Math.floor(((totalPetals - 2000) / 2000) * 100)
          : level === 4
            ? Math.floor(((totalPetals - 1000) / 1000) * 100)
            : level === 3
              ? Math.floor(((totalPetals - 600) / 400) * 100)
              : level === 2
                ? Math.floor(((totalPetals - 300) / 300) * 100)
                : Math.floor((totalPetals / 300) * 100);

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
  if (bloomRate >= 100) return "만개";
  if (bloomRate >= 80) return "절정 직전";
  if (bloomRate >= 60) return "벚꽃 풍성";
  if (bloomRate >= 40) return "가지가 차오름";
  if (bloomRate >= 20) return "꽃눈 생성";
  return "새싹 단계";
}

export function getLandingBackgroundImage() {
  return "/images/landing/hero-background.jpg";
}

export function getSchoolBackgroundImage(_schoolId: string) {
  void _schoolId;
  return "/images/backgrounds/main-background.png";
}

export function getTreeImage(level: number) {
  return `/images/trees/tree-level-${level}.webp`;
}

export function getSchoolLogoImage(schoolId: string) {
  return `/images/schools/${schoolId}/logo.avif`;
}
