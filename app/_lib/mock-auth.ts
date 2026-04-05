"use client";

import { getSchoolById } from "./mock-data";
import { SCHOOL_CATALOG } from "./school-catalog";

export type SchoolOption = {
  id: string;
  name: string;
};

export type MockAccount = {
  username: string;
  password: string;
  schoolId: string;
};

export const SCHOOL_OPTIONS: SchoolOption[] = SCHOOL_CATALOG;

const STORAGE_KEY = "blossom-save-accounts";

const DEFAULT_ACCOUNTS: MockAccount[] = [
  { username: "springhero", password: "1234", schoolId: "school-045" },
  { username: "petalrush", password: "1234", schoolId: "school-006" },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getAccounts() {
  if (!canUseStorage()) {
    return DEFAULT_ACCOUNTS;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }

  try {
    return JSON.parse(saved) as MockAccount[];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }
}

export function findAccount(username: string, password: string) {
  return getAccounts().find(
    (account) =>
      account.username === username.trim() && account.password === password,
  );
}

export function createAccount(account: MockAccount) {
  const accounts = getAccounts();
  const normalizedUsername = account.username.trim();
  const exists = accounts.some(
    (savedAccount) => savedAccount.username === normalizedUsername,
  );

  if (exists) {
    return { ok: false as const, message: "이미 존재하는 아이디예요." };
  }

  const nextAccounts = [
    ...accounts,
    { ...account, username: normalizedUsername },
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAccounts));

  return { ok: true as const };
}

export function getSchoolName(schoolId: string) {
  return getSchoolById(schoolId)?.name ?? schoolId;
}
