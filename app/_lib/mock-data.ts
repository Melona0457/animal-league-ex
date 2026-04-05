export type SchoolRecord = {
  id: string;
  name: string;
  totalPetals: number;
  bloomRate: number;
  level: number;
  rank: number;
  progressPercent: number;
  shakeAvailable: boolean;
};

export const SCHOOLS: SchoolRecord[] = [
  {
    id: "yonsei",
    name: "연세대학교",
    totalPetals: 8420,
    bloomRate: 84,
    level: 5,
    rank: 1,
    progressPercent: 84,
    shakeAvailable: true,
  },
  {
    id: "korea",
    name: "고려대학교",
    totalPetals: 8110,
    bloomRate: 81,
    level: 5,
    rank: 2,
    progressPercent: 81,
    shakeAvailable: false,
  },
  {
    id: "snu",
    name: "서울대학교",
    totalPetals: 7340,
    bloomRate: 73,
    level: 4,
    rank: 3,
    progressPercent: 73,
    shakeAvailable: false,
  },
  {
    id: "ewha",
    name: "이화여자대학교",
    totalPetals: 6250,
    bloomRate: 62,
    level: 4,
    rank: 4,
    progressPercent: 62,
    shakeAvailable: false,
  },
  {
    id: "hanyang",
    name: "한양대학교",
    totalPetals: 5480,
    bloomRate: 54,
    level: 3,
    rank: 5,
    progressPercent: 54,
    shakeAvailable: false,
  },
  {
    id: "skku",
    name: "성균관대학교",
    totalPetals: 4720,
    bloomRate: 47,
    level: 3,
    rank: 6,
    progressPercent: 47,
    shakeAvailable: false,
  },
];

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
