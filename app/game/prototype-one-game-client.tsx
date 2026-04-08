"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { applyGameScore } from "../_lib/school-state";

type PrototypeOneGameClientProps = {
  schoolId: string;
  schoolName: string;
};

type PlayerState = {
  x: number;
  jumpOffset: number;
  velocityY: number;
};

type FallingPetal = {
  id: number;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  spin: number;
};

type FlyingBee = {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
};

const GAME_DURATION = 15;
const PLAYER_WIDTH = 0.09;
const PLAYER_HEIGHT = 0.13;
const PLAYER_GROUND_Y = 0.04;
const PLAYER_MOVE_SPEED = 0.72;
const PLAYER_JUMP_VELOCITY = 1.04;
const GRAVITY = 2.8;
const PETAL_SIZE = 0.038;
const PETAL_SPAWN_INTERVAL = 0.22;
const BEE_WIDTH = 0.072;
const BEE_HEIGHT = 0.045;
const BEE_SPAWN_INTERVAL = 1.1;

const INITIAL_PLAYER: PlayerState = {
  x: 0.5,
  jumpOffset: 0,
  velocityY: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function intersects(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
) {
  return Math.abs(ax - bx) <= (aw + bw) / 2 && Math.abs(ay - by) <= (ah + bh) / 2;
}

export function PrototypeOneGameClient({
  schoolId,
  schoolName,
}: PrototypeOneGameClientProps) {
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [petals, setPetals] = useState<FallingPetal[]>([]);
  const [bees, setBees] = useState<FlyingBee[]>([]);
  const [roundKey, setRoundKey] = useState(0);
  const [shareBonus, setShareBonus] = useState(0);
  const [hasAppliedShareBonus, setHasAppliedShareBonus] = useState(false);
  const [shareNotice, setShareNotice] = useState("");

  const keysRef = useRef({
    left: false,
    right: false,
  });
  const isFinishedRef = useRef(isFinished);
  const scoreRef = useRef(score);
  const playerRef = useRef<PlayerState>(INITIAL_PLAYER);
  const petalsRef = useRef<FallingPetal[]>([]);
  const beesRef = useRef<FlyingBee[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const petalSpawnElapsedRef = useRef(0);
  const beeSpawnElapsedRef = useRef(0);
  const nextPetalIdRef = useRef(1);
  const nextBeeIdRef = useRef(1);

  useEffect(() => {
    isFinishedRef.current = isFinished;
  }, [isFinished]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key === "a" || key === "arrowleft") {
        event.preventDefault();
        keysRef.current.left = true;
      }
      if (key === "d" || key === "arrowright") {
        event.preventDefault();
        keysRef.current.right = true;
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (
          !event.repeat &&
          !isFinishedRef.current &&
          playerRef.current.jumpOffset <= 0.0001
        ) {
          playerRef.current = {
            ...playerRef.current,
            velocityY: PLAYER_JUMP_VELOCITY,
          };
        }
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (key === "a" || key === "arrowleft") {
        keysRef.current.left = false;
      }
      if (key === "d" || key === "arrowright") {
        keysRef.current.right = false;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isFinished, roundKey]);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    playerRef.current = INITIAL_PLAYER;
    petalsRef.current = [];
    beesRef.current = [];
    petalSpawnElapsedRef.current = 0;
    beeSpawnElapsedRef.current = 0;
    lastFrameRef.current = performance.now();

    function spawnPetal() {
      const petal: FallingPetal = {
        id: nextPetalIdRef.current++,
        x: 0.05 + Math.random() * 0.9,
        y: 1.08,
        speed: 0.42 + Math.random() * 0.36,
        rotation: Math.random() * 360,
        spin: -120 + Math.random() * 240,
      };
      petalsRef.current = [...petalsRef.current.slice(-80), petal];
    }

    function spawnBee() {
      const spawnEdgeRoll = Math.random();
      let spawnX = 0;
      let spawnY = 0;

      if (spawnEdgeRoll < 0.34) {
        spawnX = -0.1;
        spawnY = Math.random() * 0.96;
      } else if (spawnEdgeRoll < 0.68) {
        spawnX = 1.1;
        spawnY = Math.random() * 0.96;
      } else {
        spawnX = Math.random();
        spawnY = 1.08;
      }

      const playerTargetX = playerRef.current.x;
      const playerTargetY =
        PLAYER_GROUND_Y + playerRef.current.jumpOffset + PLAYER_HEIGHT / 2;
      const toPlayerX = playerTargetX - spawnX;
      const toPlayerY = playerTargetY - spawnY;
      const length = Math.hypot(toPlayerX, toPlayerY) || 1;
      const beeSpeed = 0.34 + Math.random() * 0.18;

      const bee: FlyingBee = {
        id: nextBeeIdRef.current++,
        x: spawnX,
        y: spawnY,
        velocityX: (toPlayerX / length) * beeSpeed,
        velocityY: (toPlayerY / length) * beeSpeed,
      };
      beesRef.current = [...beesRef.current.slice(-26), bee];
    }

    function frame(now: number) {
      if (isFinishedRef.current) {
        return;
      }

      const delta = Math.min(0.033, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;

      const moveDirection =
        (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);

      const currentPlayer = playerRef.current;
      let nextVelocityY = currentPlayer.velocityY - GRAVITY * delta;
      let nextJumpOffset = currentPlayer.jumpOffset + nextVelocityY * delta;
      if (nextJumpOffset < 0) {
        nextJumpOffset = 0;
        nextVelocityY = 0;
      }

      const nextX = clamp(
        currentPlayer.x + moveDirection * PLAYER_MOVE_SPEED * delta,
        PLAYER_WIDTH / 2,
        1 - PLAYER_WIDTH / 2,
      );

      const nextPlayer: PlayerState = {
        x: nextX,
        jumpOffset: nextJumpOffset,
        velocityY: nextVelocityY,
      };

      petalSpawnElapsedRef.current += delta;
      while (petalSpawnElapsedRef.current >= PETAL_SPAWN_INTERVAL) {
        petalSpawnElapsedRef.current -= PETAL_SPAWN_INTERVAL;
        spawnPetal();
      }

      beeSpawnElapsedRef.current += delta;
      while (beeSpawnElapsedRef.current >= BEE_SPAWN_INTERVAL) {
        beeSpawnElapsedRef.current -= BEE_SPAWN_INTERVAL;
        spawnBee();
      }

      let deltaScore = 0;
      const playerCenterX = nextPlayer.x;
      const playerCenterY =
        PLAYER_GROUND_Y + nextPlayer.jumpOffset + PLAYER_HEIGHT / 2;

      const nextPetals: FallingPetal[] = [];
      for (let index = 0; index < petalsRef.current.length; index += 1) {
        const petal = petalsRef.current[index];
        const updated: FallingPetal = {
          ...petal,
          y: petal.y - petal.speed * delta,
          rotation: petal.rotation + petal.spin * delta,
        };

        if (updated.y < -0.08) {
          continue;
        }

        if (
          intersects(
            playerCenterX,
            playerCenterY,
            PLAYER_WIDTH,
            PLAYER_HEIGHT,
            updated.x,
            updated.y,
            PETAL_SIZE,
            PETAL_SIZE,
          )
        ) {
          deltaScore += 10;
          continue;
        }

        nextPetals.push(updated);
      }

      const nextBees: FlyingBee[] = [];
      for (let index = 0; index < beesRef.current.length; index += 1) {
        const bee = beesRef.current[index];
        const nextXPosition = bee.x + bee.velocityX * delta;
        const nextYPosition = bee.y + bee.velocityY * delta;
        const updated: FlyingBee = {
          ...bee,
          x: nextXPosition,
          y: nextYPosition,
        };

        if (updated.x < -0.18 || updated.x > 1.18 || updated.y < -0.2 || updated.y > 1.2) {
          continue;
        }

        if (
          intersects(
            playerCenterX,
            playerCenterY,
            PLAYER_WIDTH,
            PLAYER_HEIGHT,
            updated.x,
            updated.y,
            BEE_WIDTH,
            BEE_HEIGHT,
          )
        ) {
          deltaScore -= 2;
          continue;
        }

        nextBees.push(updated);
      }

      const nextScore = Math.max(0, scoreRef.current + deltaScore);

      playerRef.current = nextPlayer;
      petalsRef.current = nextPetals;
      beesRef.current = nextBees;
      scoreRef.current = nextScore;

      setPlayer(nextPlayer);
      setPetals(nextPetals);
      setBees(nextBees);
      if (deltaScore !== 0) {
        setScore(nextScore);
      }

      rafRef.current = window.requestAnimationFrame(frame);
    }

    rafRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isFinished, roundKey]);

  function handleApplyScore() {
    const finalScore = score + shareBonus;
    startSavingTransition(async () => {
      await applyGameScore(schoolId, finalScore);
      router.push(`/main?schoolId=${schoolId}&score=${finalScore}`);
    });
  }

  function handleRestart() {
    setTimeLeft(GAME_DURATION);
    setIsFinished(false);
    setScore(0);
    setPlayer(INITIAL_PLAYER);
    setPetals([]);
    setBees([]);
    scoreRef.current = 0;
    playerRef.current = INITIAL_PLAYER;
    petalsRef.current = [];
    beesRef.current = [];
    setShareBonus(0);
    setHasAppliedShareBonus(false);
    setShareNotice("");
    setRoundKey((current) => current + 1);
  }

  async function handleShareResult() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/main?schoolId=${schoolId}`;

    if (!shareUrl) {
      return;
    }

    const shareText = `${schoolName} 프로토타입1에서 ${score}점 획득! 같이 들어와서 벚꽃 받아내기 해줘.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${schoolName} 벚꽃살리기 결과`,
          text: shareText,
          url: shareUrl,
        });

        if (!hasAppliedShareBonus && score > 0) {
          const bonus = score;
          setShareBonus(bonus);
          setHasAppliedShareBonus(true);
          setShareNotice(`결과를 공유했고 공유 보너스 +${bonus}점을 얻었어요.`);
          return;
        }
        setShareNotice("결과 공유창을 열었어요.");
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      if (!hasAppliedShareBonus && score > 0) {
        const bonus = score;
        setShareBonus(bonus);
        setHasAppliedShareBonus(true);
        setShareNotice(`공유 문구와 링크를 복사했고 공유 보너스 +${bonus}점을 얻었어요.`);
        return;
      }
      setShareNotice("공유 문구와 링크를 복사했어요.");
    } catch {
      setShareNotice("공유를 완료하지 못했어요. 다시 시도해주세요.");
    }
  }

  const finalAppliedScore = score + shareBonus;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f172a] text-white">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5">
        <header className="grid grid-cols-[0.9fr_1.4fr_0.7fr] gap-2 rounded-[1.75rem] border border-white/20 bg-black/28 p-3 backdrop-blur sm:gap-3 sm:p-4">
          <div className="px-3 py-3">
            <p className="text-[11px] font-medium text-white/65 sm:text-xs">남은 시간</p>
            <p className="mt-1 text-xl font-bold sm:text-3xl">{timeLeft}s</p>
            <p className="mt-2 text-[11px] text-white/55 sm:text-xs">Prototype1</p>
          </div>
          <div className="px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-white/65 sm:text-xs">현재 점수</p>
                <p className="mt-1 text-xl font-bold sm:text-3xl">{score}</p>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-rose-100">
                2D
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-white/60 sm:text-xs">
              A/D 또는 방향키로 이동하고, 스페이스바로 점프하세요. 벚꽃은 +10점, 벌은
              -2점입니다.
            </p>
          </div>
          <Link
            href={`/game/select?schoolId=${schoolId}`}
            className="flex items-center justify-end px-3 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-medium text-white/65 sm:text-xs">다시 선택</p>
              <p className="mt-1 text-lg font-bold sm:text-2xl">모드</p>
            </div>
          </Link>
        </header>

        <section className="relative flex flex-1 flex-col py-4">
          <div className="relative h-full min-h-[66vh] overflow-hidden rounded-[2.2rem] border border-white/25 bg-[#0b1220] shadow-[0_24px_80px_rgba(8,9,16,0.48)]">
            <div className="absolute inset-0 [image-rendering:pixelated]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#57a6f3_0%,#83c7ff_49%,#4d9f49_49%,#3f8a3d_100%)]" />
              <div className="absolute inset-0 opacity-20 [background-size:14px_14px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.26)_1px,transparent_1px)]" />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-[14%] h-[56%] w-[50%] -translate-x-1/2">
              <div className="absolute bottom-[6%] left-1/2 h-[46%] w-[18%] -translate-x-1/2 border-[5px] border-[#5f311f] bg-[#8e4f2b]" />
              <div className="absolute bottom-[36%] left-[12%] h-[12%] w-[24%] border-[4px] border-[#5f311f] bg-[#8e4f2b]" />
              <div className="absolute bottom-[42%] right-[12%] h-[11%] w-[22%] border-[4px] border-[#5f311f] bg-[#8e4f2b]" />
              <div className="absolute left-1/2 top-0 h-[64%] w-full -translate-x-1/2 border-[6px] border-[#b8527f] bg-[#f9b0cf]" />
              <div className="absolute left-[6%] top-[10%] h-[26%] w-[24%] border-[5px] border-[#b8527f] bg-[#ffc0dc]" />
              <div className="absolute right-[5%] top-[13%] h-[24%] w-[24%] border-[5px] border-[#b8527f] bg-[#ffc0dc]" />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] border-t-[6px] border-[#295529] bg-[repeating-linear-gradient(90deg,#4fa24b_0px,#4fa24b_20px,#4aa046_20px,#4aa046_40px)]" />

            {petals.map((petal) => (
              <div
                key={petal.id}
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${petal.x * 100}%`,
                  bottom: `${petal.y * 100}%`,
                  width: `${PETAL_SIZE * 100}%`,
                  height: `${PETAL_SIZE * 100}%`,
                  transform: `translate(-50%, 50%) rotate(${petal.rotation}deg)`,
                }}
              >
                <div className="h-full w-full border-2 border-[#c2507f] bg-[#ffd0e6]" />
              </div>
            ))}

            {bees.map((bee) => (
              <div
                key={bee.id}
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${bee.x * 100}%`,
                  bottom: `${bee.y * 100}%`,
                  width: `${BEE_WIDTH * 100}%`,
                  height: `${BEE_HEIGHT * 100}%`,
                }}
              >
                <div className="relative h-full w-full border-2 border-black bg-[#ffd447]">
                  <span className="absolute inset-y-0 left-[30%] w-[2px] bg-black" />
                  <span className="absolute inset-y-0 left-[54%] w-[2px] bg-black" />
                  <span className="absolute -top-[34%] left-[10%] h-[38%] w-[36%] border-2 border-[#6ed8ff] bg-[#c7f2ff]" />
                  <span className="absolute -top-[34%] right-[10%] h-[38%] w-[36%] border-2 border-[#6ed8ff] bg-[#c7f2ff]" />
                </div>
              </div>
            ))}

            <div
              className="pointer-events-none absolute z-30 -translate-x-1/2"
              style={{
                left: `${player.x * 100}%`,
                bottom: `${(PLAYER_GROUND_Y + player.jumpOffset) * 100}%`,
                width: `${PLAYER_WIDTH * 100}%`,
                height: `${PLAYER_HEIGHT * 100}%`,
              }}
            >
              <div className="relative h-full w-full border-[4px] border-[#6f3f1e] bg-[#f4b355]">
                <span className="absolute left-[8%] top-[-18%] h-[28%] w-[24%] border-[3px] border-[#6f3f1e] bg-[#f4b355]" />
                <span className="absolute right-[8%] top-[-18%] h-[28%] w-[24%] border-[3px] border-[#6f3f1e] bg-[#f4b355]" />
                <span className="absolute left-[20%] top-[38%] h-[16%] w-[12%] bg-black" />
                <span className="absolute right-[20%] top-[38%] h-[16%] w-[12%] bg-black" />
                <span className="absolute left-[39%] top-[54%] h-[10%] w-[22%] bg-[#5a2f13]" />
              </div>
            </div>

            <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-[linear-gradient(180deg,rgba(10,14,20,0.72),rgba(10,14,20,0))] px-5 py-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-rose-300">MINI GAME</p>
                <h1 className="mt-1 text-2xl font-bold">{schoolName} 프로토타입1</h1>
              </div>
              <p className="text-sm text-white/75">벚꽃 +10 · 벌 -2</p>
            </div>
          </div>
        </section>
      </div>

      {isFinished ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/46 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/92 p-6 text-center text-stone-900 shadow-2xl">
            <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">RESULT</p>
            <h2 className="mt-3 text-3xl font-bold">프로토타입1 종료</h2>
            <p className="mt-4 text-base leading-7 text-stone-600">
              이번 판 점수는 {score}점이에요. 벚꽃을 먹으면 +10점, 벌에 닿으면 -2점이에요.
            </p>
            <p className="mt-2 text-sm text-stone-500">
              최종 반영 점수 {finalAppliedScore}점
              {shareBonus > 0 ? ` · 공유 보너스 +${shareBonus}` : ""}
            </p>
            {shareNotice ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {shareNotice}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleShareResult}
                disabled={hasAppliedShareBonus && score > 0}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700"
              >
                {hasAppliedShareBonus && score > 0
                  ? "공유 보너스 반영 완료"
                  : "친구에게 결과 공유하기"}
              </button>
              <button
                type="button"
                onClick={handleApplyScore}
                disabled={isSaving}
                className="rounded-2xl bg-stone-900 px-4 py-4 text-center text-sm font-semibold text-white"
              >
                {isSaving ? "점수 반영 중..." : "점수 반영하고 메인으로"}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-2xl border border-stone-200 px-4 py-4 text-sm font-semibold text-stone-700"
              >
                한 판 더 하기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
