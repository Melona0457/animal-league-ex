import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff9fb_0%,#ffeef4_36%,#ffd7df_100%)] px-4 py-6 text-stone-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-2rem] top-28 h-28 w-28 rounded-full bg-white/70 blur-2xl" />
        <div className="absolute right-0 top-16 h-40 w-40 rounded-full bg-rose-100/80 blur-3xl" />
        <div className="absolute bottom-16 left-10 h-28 w-28 rounded-full bg-pink-100/70 blur-2xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-10 lg:grid lg:grid-cols-[1fr_1fr] lg:items-center">
        <section className="px-2 pt-6 lg:px-6">
          <Link
            href="/login"
            className="inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-stone-700 backdrop-blur"
          >
            로그인으로
          </Link>
          <div className="mt-8 max-w-xl">
            <p className="text-sm font-semibold tracking-[0.28em] text-rose-500">
              NEW PLAYER
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-stone-950 md:text-6xl">
              소속 학교 고르고
              <br />
              벚꽃 전쟁 시작하기
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-stone-600 md:text-lg">
              학교 소속감, 봄 시즌감, 짧고 직관적인 참여 흐름을 살린 MVP
              회원가입 화면이에요.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <SignupForm />
        </section>
      </div>
    </main>
  );
}
