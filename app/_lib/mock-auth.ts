"use client";

import { getSchoolById } from "./mock-data";
import { SCHOOL_CATALOG } from "./school-catalog";
import { supabase } from "./supabase";

export type SchoolOption = {
  id: string;
  name: string;
};

export type AuthSignupInput = {
  nickname: string;
  email: string;
  password: string;
  schoolId: string;
};

export const SCHOOL_OPTIONS: SchoolOption[] = SCHOOL_CATALOG;

const SCHOOL_EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.(ac\.kr|edu)$/i;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=]{8,20}$/;

export function getSchoolName(schoolId: string) {
  return getSchoolById(schoolId)?.name ?? schoolId;
}

export function isValidSchoolEmail(email: string) {
  return SCHOOL_EMAIL_PATTERN.test(email.trim());
}

export function isValidPassword(password: string) {
  return PASSWORD_PATTERN.test(password);
}

export async function signInAccount(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return {
      ok: false as const,
      message:
        "로그인에 실패했어요. 이메일과 비밀번호를 다시 확인해주세요.",
    };
  }

  const schoolId = data.user.user_metadata.school_id as string | undefined;

  if (!schoolId) {
    return {
      ok: false as const,
      message: "계정에 학교 정보가 없어요. 다시 회원가입해주세요.",
    };
  }

  return { ok: true as const, schoolId };
}

export async function signUpAccount(input: AuthSignupInput) {
  const email = input.email.trim();
  const nickname = input.nickname.trim();
  const schoolName = getSchoolName(input.schoolId);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined,
      data: {
        nickname,
        school_id: input.schoolId,
        school_name: schoolName,
      },
    },
  });

  if (error) {
    return {
      ok: false as const,
      message: error.message.includes("already registered")
        ? "이미 가입된 이메일이에요."
        : "회원가입에 실패했어요. 입력값을 다시 확인해주세요.",
    };
  }

  const schoolId =
    (data.user?.user_metadata.school_id as string | undefined) ?? input.schoolId;

  return {
    ok: true as const,
    schoolId,
    needsEmailConfirmation: !data.session,
    nickname,
  };
}

export async function signOutAccount() {
  await supabase.auth.signOut();
}

export type AuthProfile = {
  nickname: string;
  schoolId: string;
  schoolName: string;
};

export async function getCurrentAuthProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const schoolId = (user.user_metadata.school_id as string | undefined) ?? "school-044";
  const schoolName =
    (user.user_metadata.school_name as string | undefined) ?? getSchoolName(schoolId);
  const nickname =
    (user.user_metadata.nickname as string | undefined) ?? "벚꽃러";

  return {
    nickname,
    schoolId,
    schoolName,
  } satisfies AuthProfile;
}
