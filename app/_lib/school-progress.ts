export function getLevelRange(totalPetals: number) {
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

export function progressFromTotal(totalPetals: number) {
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

export function levelFromTotal(totalPetals: number) {
  return getLevelRange(totalPetals).level;
}
