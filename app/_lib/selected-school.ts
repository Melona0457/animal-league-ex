"use client";

import {
  SELECTED_SCHOOL_COOKIE_KEY,
  SELECTED_SCHOOL_COOKIE_MAX_AGE_SECONDS,
  SELECTED_SCHOOL_STORAGE_KEY,
} from "./selected-school-constants";

function readCookieValue(cookieKey: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedKey = `${encodeURIComponent(cookieKey)}=`;
  const cookies = document.cookie.split("; ");

  for (let index = 0; index < cookies.length; index += 1) {
    const cookie = cookies[index];

    if (cookie.startsWith(encodedKey)) {
      return decodeURIComponent(cookie.slice(encodedKey.length));
    }
  }

  return null;
}

export function getSelectedSchoolId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSchoolId = window.localStorage.getItem(SELECTED_SCHOOL_STORAGE_KEY);

  if (storedSchoolId) {
    return storedSchoolId;
  }

  return readCookieValue(SELECTED_SCHOOL_COOKIE_KEY);
}

export function setSelectedSchoolId(schoolId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SELECTED_SCHOOL_STORAGE_KEY, schoolId);
  document.cookie = `${encodeURIComponent(SELECTED_SCHOOL_COOKIE_KEY)}=${encodeURIComponent(
    schoolId,
  )}; path=/; max-age=${SELECTED_SCHOOL_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearSelectedSchoolId() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SELECTED_SCHOOL_STORAGE_KEY);
  document.cookie = `${encodeURIComponent(
    SELECTED_SCHOOL_COOKIE_KEY,
  )}=; path=/; max-age=0; samesite=lax`;
}
