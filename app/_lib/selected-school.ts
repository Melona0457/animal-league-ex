"use client";

const SELECTED_SCHOOL_STORAGE_KEY = "blossom-save:selected-school";

export function getSelectedSchoolId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SELECTED_SCHOOL_STORAGE_KEY);
}

export function setSelectedSchoolId(schoolId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SELECTED_SCHOOL_STORAGE_KEY, schoolId);
}

export function clearSelectedSchoolId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SELECTED_SCHOOL_STORAGE_KEY);
}
