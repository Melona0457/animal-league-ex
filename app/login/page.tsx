import Link from "next/link";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{
    signup?: string;
    user?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const signupNotice =
    params.signup === "success"
      ? params.user
        ? `${params.user} 계정이 만들어졌어요. 바로 로그인해보세요.`
        : "회원가입이 완료됐어요. 이제 로그인해보세요."
      : "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff8fb_0%,#ffe5ef_42%,#ffd1df_100%)] px-4 py-6 text-stone-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-3rem] top-20 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute right-[-2rem] top-32 h-32 w-32 rounded-full bg-rose-200/60 blur-2xl" />
        <div className="absolute bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-pink-100/70 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="px-2 pt-6 lg:px-6">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-stone-700 backdrop-blur"
          >
            초기화면으로
          </Link>
          <div className="mt-8 max-w-xl">
            <p className="text-sm font-semibold tracking-[0.28em] text-rose-500">
              BLOSSOM SAVE
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-stone-950 md:text-6xl">
              오늘도 공부 대신
              <br />
              우리 학교 벚꽃부터
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-stone-600 md:text-lg">
              로그인하고, 시험기간 감성 가득한 학교 대항전에 바로 합류해보세요.
              모바일에서도 한 손으로 빠르게 들어올 수 있게 구성했어요.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <LoginForm signupNotice={signupNotice} />
        </section>
      </div>
    </main>
  );
}
