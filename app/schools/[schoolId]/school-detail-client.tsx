"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PetalOverlay } from "../../_components/petal-overlay";
import {
  getDefaultSchoolRecords,
  getLevelLabel,
  getSchoolBackgroundImage,
  getTreeImage,
  getTreeStage,
  type SchoolRecord,
} from "../../_lib/mock-data";
import { getPetalsBySchoolId, shakePetals, type PetalPlacement } from "../../_lib/petal-state";
import { applyShake, getStoredSchoolById } from "../../_lib/school-state";

type SchoolDetailClientProps = {
  schoolId: string;
  fromSchoolId: string;
  shakenCount: number;
};

export function SchoolDetailClient({
  schoolId,
  fromSchoolId,
  shakenCount,
}: SchoolDetailClientProps) {
  const [petals, setPetals] = useState<PetalPlacement[]>([]);
  const [school, setSchool] = useState<SchoolRecord | undefined>(
    getDefaultSchoolRecords().find((item) => item.id === schoolId),
  );
  const [shakeMode, setShakeMode] = useState<"idle" | "countdown" | "result">("idle");
  const [shakeSeconds, setShakeSeconds] = useState(8);
  const [shakeCount, setShakeCount] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const lastMotionRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    async function loadSchool() {
      const [storedSchool, storedPetals] = await Promise.all([
        getStoredSchoolById(schoolId),
        getPetalsBySchoolId(schoolId),
      ]);
      const fallbackSchool =
        storedSchool ?? getDefaultSchoolRecords().find((item) => item.id === schoolId);

      if (isActive) {
        setSchool(fallbackSchool);
        setPetals(storedPetals);
      }
    }

    loadSchool();

    return () => {
      isActive = false;
    };
  }, [schoolId, shakenCount]);

  useEffect(() => {
    if (shakeMode !== "countdown") {
      return;
    }

    async function requestMotionPermissionIfNeeded() {
      const requestPermission = (
        DeviceMotionEvent as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        }
      ).requestPermission;

      if (typeof requestPermission === "function") {
        await requestPermission().catch(() => null);
      }
    }

    void requestMotionPermissionIfNeeded();

    function handleMotion(event: DeviceMotionEvent) {
      const acceleration = event.accelerationIncludingGravity;

      if (!acceleration) {
        return;
      }

      const power =
        Math.abs(acceleration.x ?? 0) +
        Math.abs(acceleration.y ?? 0) +
        Math.abs(acceleration.z ?? 0);

      if (power < 28) {
        return;
      }

      const now = Date.now();

      if (now - lastMotionRef.current < 220) {
        return;
      }

      lastMotionRef.current = now;
      setShakeCount((current) => current + 1);
    }

    const timer = window.setInterval(() => {
      setShakeSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [shakeMode]);

  useEffect(() => {
    if (shakeMode !== "countdown" || shakeSeconds > 0) {
      return;
    }

    void (async () => {
      const result = await shakePetals(schoolId, shakeCount);
      await applyShake(schoolId, result.removedCount);
      const nextSchool = await getStoredSchoolById(schoolId);
      setPetals(result.petals);
      setSchool(nextSchool);
      setDroppedCount(result.removedCount);
      setShakeMode("result");
    })();
  }, [shakeMode, shakeSeconds, schoolId, shakeCount]);

  function handleShakeStart() {
    setShakeCount(0);
    setDroppedCount(0);
    setShakeSeconds(8);
    setShakeMode("countdown");
  }

  if (!school) {
    return null;
  }

  return (
    <main
      className="min-h-screen bg-stone-900 px-4 py-5 text-white"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(34, 18, 26, 0.28), rgba(34, 18, 26, 0.72)), url('${getSchoolBackgroundImage(school.id)}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col">
        <header className="grid grid-cols-[0.9fr_1.4fr_0.7fr] gap-2 rounded-[1.75rem] border border-white/15 bg-black/30 p-3 backdrop-blur-sm sm:gap-3 sm:p-4">
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">현재 순위</p>
            <p className="mt-1 text-xl font-bold sm:text-3xl">#{school.rank}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">레벨</p>
            <p className="mt-1 text-base font-bold sm:text-2xl">
              {getLevelLabel(school.level)} · {school.bloomRate}%
            </p>
            <p className="mt-1 text-[11px] text-white/65 sm:text-xs">
              총 벚꽃 수 {school.totalPetals.toLocaleString()}
            </p>
          </div>
          <Link
            href={`/ranking?schoolId=${fromSchoolId}`}
            className="rounded-2xl bg-white/10 px-3 py-3 text-left"
          >
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">돌아가기</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">목록</p>
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-4">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
            <p className="mb-3 rounded-full bg-black/30 px-4 py-2 text-xs text-white/75 backdrop-blur-sm">
              {school.name} · {getTreeStage(school.bloomRate)}
            </p>
            <div
              className="relative flex h-[46vh] min-h-[300px] w-full items-end justify-center bg-contain bg-bottom bg-no-repeat"
              style={{
                backgroundImage: `url('${getTreeImage(school.level)}')`,
              }}
            >
              <PetalOverlay petals={petals} className="z-10" />
              <div className="mb-6 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                나무 이미지 슬롯: `/public${getTreeImage(school.level)}`
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3 pb-2">
          <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white/85 backdrop-blur-sm">
            다른 학교를 8초 동안 흔들어 벚꽃잎을 떨어뜨려보세요. 현재 확인용 사용 횟수: {shakenCount}회
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleShakeStart}
              className="rounded-3xl bg-rose-400 px-4 py-4 text-center text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
            >
              흔들기 사용하기
            </button>
            <Link
              href={`/main?schoolId=${fromSchoolId}`}
              className="rounded-3xl border border-white/20 bg-white/10 px-4 py-4 text-center text-base font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
            >
              내 학교로 돌아가기
            </Link>
          </div>
        </section>
      </div>

      {shakeMode === "countdown" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-stone-950/92 p-6 text-center text-white backdrop-blur-sm">
            <p className="text-sm font-semibold tracking-[0.24em] text-rose-300">SHAKE MODE</p>
            <h2 className="mt-3 text-3xl font-bold">지금 흔들어주세요</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              휴대폰을 흔들면 카운트가 올라가고, 끝나면 그 수만큼 벚꽃잎이 떨어져요.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs text-white/55">남은 시간</p>
                <p className="mt-2 text-3xl font-bold">{shakeSeconds}s</p>
              </div>
              <div>
                <p className="text-xs text-white/55">흔든 횟수</p>
                <p className="mt-2 text-3xl font-bold">{shakeCount}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShakeCount((current) => current + 1)}
              className="mt-5 rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white"
            >
              흔들기 감지가 안 되면 탭해서 +1
            </button>
          </div>
        </div>
      ) : null}

      {shakeMode === "result" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-stone-950/92 p-6 text-center text-white backdrop-blur-sm">
            <p className="text-sm font-semibold tracking-[0.24em] text-rose-300">RESULT</p>
            <h2 className="mt-3 text-3xl font-bold">시간이 다 되었어요</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              이번 방해에서 <span className="font-semibold text-white">{droppedCount}개</span>의
              벚꽃잎이 떨어졌어요.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShakeMode("idle")}
                className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-stone-950"
              >
                확인
              </button>
              <Link
                href={`/ranking?schoolId=${fromSchoolId}`}
                className="rounded-2xl border border-white/15 px-4 py-4 text-sm font-semibold text-white"
              >
                모아보기로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
