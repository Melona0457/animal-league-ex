"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  isValidPassword,
  isValidSchoolEmail,
  SCHOOL_OPTIONS,
  signUpAccount,
} from "../_lib/mock-auth";
import { setSelectedSchoolId } from "../_lib/selected-school";

export function SignupForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState(SCHOOL_OPTIONS[0].id);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (!nickname.trim() || !email.trim() || !password.trim()) {
      setError("닉네임, 이메일, 비밀번호를 모두 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidSchoolEmail(email)) {
      setError("학교 이메일만 사용할 수 있어요. `@ac.kr` 또는 `@edu` 도메인을 확인해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError("비밀번호는 영문+숫자를 포함한 8~20자로 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    const result = await signUpAccount({
      nickname,
      email,
      password,
      schoolId,
    });

    if (!result.ok) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      router.push(`/login?signup=verify&user=${encodeURIComponent(result.nickname)}`);
      return;
    }

    setSelectedSchoolId(result.schoolId);
    router.push("/main");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[2rem] border border-white/65 bg-white/82 p-6 shadow-[0_24px_80px_rgba(124,58,89,0.16)] backdrop-blur md:p-8"
    >
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold tracking-[0.2em] text-rose-500">
          SIGN UP
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-stone-900">
          우리 학교 대표 계정 만들기
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          학교를 고르고 계정을 만들면, 바로 벚꽃 붙이기 경쟁에 참여할 수 있어요.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            닉네임
          </span>
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="예: cherrycaptain"
            className="h-13 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            autoComplete="nickname"
          />
          <p className="mt-2 text-xs text-stone-500">
            커뮤니티에서 익명 해제 시 보이는 이름이에요.
          </p>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            이메일
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@school.com"
            className="h-13 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            autoComplete="email"
          />
          <p className="mt-2 text-xs text-stone-500">
            학교 이메일만 가능해요. `@ac.kr`, `@edu`
          </p>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            비밀번호
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="h-13 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            autoComplete="new-password"
          />
          <p className="mt-2 text-xs text-stone-500">
            영문과 숫자를 모두 포함한 8~20자
          </p>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            소속 대학
          </span>
          <select
            value={schoolId}
            onChange={(event) => setSchoolId(event.target.value)}
            className="h-13 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          >
            {SCHOOL_OPTIONS.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-3">
        <button
          type="submit"
          className="h-13 rounded-2xl bg-rose-500 text-base font-semibold text-white transition hover:bg-rose-400"
        >
          {isSubmitting ? "회원가입 중..." : "회원가입 완료"}
        </button>
        <Link
          href="/login"
          className="flex h-13 items-center justify-center rounded-2xl border border-stone-200 bg-white text-base font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    </form>
  );
}
