"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { findAccount, getSchoolName } from "../_lib/mock-auth";

type LoginFormProps = {
  signupNotice?: string;
};

export function LoginForm({ signupNotice = "" }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const demoNotice = "테스트 계정: springhero / 1234";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const account = findAccount(username, password);

    if (!account) {
      setError("존재하지 않는 계정 정보예요. 아이디와 비밀번호를 다시 확인해주세요.");
      return;
    }

    setError("");
    router.push(
      `/main?schoolId=${account.schoolId}&school=${encodeURIComponent(getSchoolName(account.schoolId))}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[2rem] border border-white/65 bg-white/80 p-6 shadow-[0_24px_80px_rgba(124,58,89,0.16)] backdrop-blur md:p-8"
    >
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold tracking-[0.2em] text-rose-500">
          LOGIN
        </p>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-stone-900">
          내 학교 벚꽃 지키러 입장
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          시험기간인데도 들어오게 되는, 딱 그 감성으로 가볍게 시작해봐요.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {demoNotice}
      </div>

      {signupNotice ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {signupNotice}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">
            아이디
          </span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="아이디를 입력하세요"
            className="h-13 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            autoComplete="username"
          />
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
            autoComplete="current-password"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3">
        <button
          type="submit"
          className="h-13 rounded-2xl bg-stone-900 text-base font-semibold text-white transition hover:bg-stone-800"
        >
          로그인
        </button>
        <Link
          href="/signup"
          className="flex h-13 items-center justify-center rounded-2xl border border-stone-200 bg-white text-base font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          회원가입
        </Link>
      </div>
    </form>
  );
}
