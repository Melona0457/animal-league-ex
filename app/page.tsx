import Link from "next/link";
import { getLandingBackgroundImage } from "./_lib/mock-data";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-900 text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster={getLandingBackgroundImage()}
      >
        <source src="/videos/intro.mp4" type="video/mp4" />
      </video>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(33, 17, 25, 0.38), rgba(33, 17, 25, 0.74)), url('${getLandingBackgroundImage()}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <Link
        href="/login"
        className="group relative z-10 flex min-h-screen flex-col items-center justify-between px-5 py-8 sm:px-8"
      >
        <div className="flex w-full justify-between text-xs font-semibold tracking-[0.24em] text-rose-100 sm:text-sm">
          <span>SPRING LEAGUE</span>
          <span>2026 SEASON</span>
        </div>

        <div className="relative flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
          <div className="absolute inset-x-0 top-[16%] mx-auto h-40 w-40 rounded-full bg-white/15 blur-3xl sm:h-56 sm:w-56" />
          <div className="absolute bottom-[18%] left-[8%] h-24 w-24 rounded-full bg-rose-300/20 blur-2xl" />
          <div className="absolute right-[10%] top-[24%] h-28 w-28 rounded-full bg-pink-100/20 blur-2xl" />

          <div className="relative flex w-full flex-col items-center rounded-[2rem] border border-white/10 bg-black/20 px-5 py-10 text-center backdrop-blur-sm">
            <div className="mb-6 flex items-end gap-3">
              <span className="text-4xl sm:text-5xl">🌸</span>
              <span className="text-5xl sm:text-6xl">🌸</span>
              <span className="text-4xl sm:text-5xl">🌸</span>
            </div>

            <p className="text-sm font-semibold tracking-[0.36em] text-rose-100 sm:text-base">
              시험기간 집중력 파괴 프로젝트
            </p>
            <h1 className="mt-4 text-[3.2rem] font-black tracking-[-0.08em] text-white sm:text-[5.4rem]">
              벚꽃살리기
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/78 sm:max-w-xl sm:text-lg sm:leading-8">
              우리 학교 벚꽃은 살리고, 남의 학교는 흔들고, 랭킹은 끝까지
              확인하게 되는 봄 시즌 대항전.
            </p>
            <div className="mt-10 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur transition group-hover:scale-[1.02] sm:text-base">
              화면 아무 곳이나 눌러 입장하기
            </div>
          </div>
        </div>

        <div className="w-full text-center text-xs text-white/70 sm:text-sm">
          친구랑 같이 들어와서 우리 학교 벚꽃 수명 연장하기
        </div>
      </Link>
    </main>
  );
}
