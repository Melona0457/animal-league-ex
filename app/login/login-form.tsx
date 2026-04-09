"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInAccount } from "../_lib/mock-auth";
import { setSelectedSchoolId } from "../_lib/selected-school";

type LoginFormProps = {
  signupNotice?: string;
};

export function LoginForm({ signupNotice = "" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await signInAccount(email, password);

    if (!result.ok) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    setError("");
    setSelectedSchoolId(result.schoolId);
    router.push("/main");
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

      {signupNotice ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {signupNotice}
        </div>
      ) : null}

      <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Supabase Auth 기준으로 이메일과 비밀번호로 로그인해요.
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
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
          {isSubmitting ? "로그인 중..." : "로그인"}
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
