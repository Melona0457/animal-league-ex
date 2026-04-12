"use client";

import Image from "next/image";
import {
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import type { SchoolRecord } from "../_lib/mock-data";
import { applyGameScore, getStoredSchools } from "../_lib/school-state";

type PrototypeOneGameClientProps = {
  schoolId: string;
  schoolName: string;
};

type FacingDirection = "left" | "right";
type LionPose = "idle" | "run" | "jump1" | "jump2";

type PlayerState = {
  x: number;
  jumpOffset: number;
  velocityY: number;
  jumpCount: number;
  facing: FacingDirection;
  isRunning: boolean;
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

const PLAYER_WIDTH = 0.09;
const PLAYER_HEIGHT = 0.13;
const GROUND_LINE_Y = 0.22;
const SKY_GROUND_BOUNDARY_Y = 0.52;
const PLAYER_GROUND_Y = GROUND_LINE_Y;
const UPPER_GROUND_HEIGHT = SKY_GROUND_BOUNDARY_Y - GROUND_LINE_Y;
const LOWER_GROUND_HEIGHT = GROUND_LINE_Y;
const PLAYER_MOVE_SPEED = 0.72;
const PLAYER_JUMP_VELOCITY = 1.04;
const PLAYER_DOUBLE_JUMP_VELOCITY = 0.98;
const GRAVITY = 2.8;
const PETAL_COLLISION_SIZE = 0.05;
const PETAL_RENDER_SIZE = 0.058;
const PETAL_SPAWN_INTERVAL = 0.22;
const BEE_COLLISION_WIDTH = 0.072;
const BEE_COLLISION_HEIGHT = 0.045;
const BEE_RENDER_WIDTH = 0.082;
const BEE_RENDER_HEIGHT = 0.052;
const BEE_COLLISION_PLAYER_WIDTH_FACTOR = 0.72;
const BEE_COLLISION_PLAYER_HEIGHT_FACTOR = 0.74;
const BEE_COLLISION_BEE_WIDTH_FACTOR = 0.72;
const BEE_COLLISION_BEE_HEIGHT_FACTOR = 0.72;
const BASE_BEE_SPAWN_INTERVAL = 1.5;
const DIFFICULTY_SCALE_INTERVAL = 10;
const DIFFICULTY_MULTIPLIER_STEP = 1.5;
const GAME_RENDER_FPS = 50;
const HUD_UPDATE_FPS = 15;
const PROTOTYPE_ONE_PETAL_IMAGE = "/images/game/prototype1/petal.webp";
const PROTOTYPE_ONE_BEE_IMAGE = "/images/game/prototype1/bee.webp";
const PROTOTYPE_ONE_TREE_IMAGE = "/images/game/prototype1/tree.webp";
const PROTOTYPE_ONE_BG_SKY_IMAGE = "/images/game/prototype1/background/sky.webp";
const PROTOTYPE_ONE_BG_UPPER_GREEN_IMAGE =
  "/images/game/prototype1/background/upper-green.webp";
const PROTOTYPE_ONE_BG_LOWER_GREEN_IMAGE =
  "/images/game/prototype1/background/lower-green.webp";
const PROTOTYPE_ONE_LION_SPRITES = {
  idle: {
    left: "/images/game/prototype1/lion/lion-idle-left.webp",
    right: "/images/game/prototype1/lion/lion-idle-right.webp",
  },
  run: {
    left: "/images/game/prototype1/lion/lion-run-left.webp",
    right: "/images/game/prototype1/lion/lion-run-right.webp",
  },
  jump1: {
    left: "/images/game/prototype1/lion/lion-jump1-left.webp",
    right: "/images/game/prototype1/lion/lion-jump1-right.webp",
  },
  jump2: {
    left: "/images/game/prototype1/lion/lion-jump2-left.webp",
    right: "/images/game/prototype1/lion/lion-jump2-right.webp",
  },
} as const;

const INITIAL_PLAYER: PlayerState = {
  x: 0.5,
  jumpOffset: 0,
  velocityY: 0,
  jumpCount: 0,
  facing: "right",
  isRunning: false,
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

function hasBatchim(word: string) {
  const trimmed = word.trim();

  if (!trimmed) {
    return false;
  }

  const lastChar = trimmed[trimmed.length - 1];
  const code = lastChar.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return false;
  }

  return (code - 0xac00) % 28 !== 0;
}

function topicParticle(word: string) {
  return hasBatchim(word) ? "은" : "는";
}

function subjectParticle(word: string) {
  return hasBatchim(word) ? "이" : "가";
}

function getLionVisual(player: PlayerState): { path: string; pose: LionPose } {
  if (player.jumpOffset > 0.0001) {
    if (player.jumpCount >= 2) {
      return {
        path: PROTOTYPE_ONE_LION_SPRITES.jump2[player.facing],
        pose: "jump2",
      };
    }

    return {
      path: PROTOTYPE_ONE_LION_SPRITES.jump1[player.facing],
      pose: "jump1",
    };
  }

  if (player.isRunning) {
    return {
      path: PROTOTYPE_ONE_LION_SPRITES.run[player.facing],
      pose: "run",
    };
  }

  return {
    path: PROTOTYPE_ONE_LION_SPRITES.idle[player.facing],
    pose: "idle",
  };
}

function getLionScale(pose: LionPose) {
  switch (pose) {
    case "run":
      return 1.4;
    case "jump1":
      return 1.08;
    case "jump2":
      return 1.1;
    default:
      return 1;
  }
}

function getLionGroundOffset(pose: LionPose) {
  switch (pose) {
    case "run":
      return 0.016;
    default:
      return 0;
  }
}

function isLikelyTouchDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const touchPoints = window.navigator.maxTouchPoints > 0;
  return coarsePointer || touchPoints;
}

function isMoveLeftInput(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  return key === "a" || key === "arrowleft" || key === "ㅁ" || event.code === "KeyA";
}

function isMoveRightInput(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  return key === "d" || key === "arrowright" || key === "ㅇ" || event.code === "KeyD";
}

export function PrototypeOneGameClient({
  schoolId,
  schoolName,
}: PrototypeOneGameClientProps) {
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [survivalSeconds, setSurvivalSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [petals, setPetals] = useState<FallingPetal[]>([]);
  const [bees, setBees] = useState<FlyingBee[]>([]);
  const [roundKey, setRoundKey] = useState(0);
  const [shareBonus, setShareBonus] = useState(0);
  const [hasAppliedShareBonus, setHasAppliedShareBonus] = useState(false);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);

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
  const lastRenderCommitRef = useRef(0);
  const lastHudCommitRef = useRef(0);
  const petalSpawnElapsedRef = useRef(0);
  const beeSpawnElapsedRef = useRef(0);
  const nextPetalIdRef = useRef(1);
  const nextBeeIdRef = useRef(1);
  const roundStartTimeRef = useRef(0);

  useEffect(() => {
    isFinishedRef.current = isFinished;
  }, [isFinished]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      const storedSchools = await getStoredSchools();

      if (isActive) {
        setSchools(storedSchools);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  function tryJump() {
    if (isFinishedRef.current || playerRef.current.jumpCount >= 2) {
      return;
    }

    const currentPlayer = playerRef.current;
    const nextJumpCount = currentPlayer.jumpCount + 1;
    const jumpVelocity =
      currentPlayer.jumpCount === 0
        ? PLAYER_JUMP_VELOCITY
        : PLAYER_DOUBLE_JUMP_VELOCITY;

    const updatedPlayer: PlayerState = {
      ...currentPlayer,
      velocityY: jumpVelocity,
      jumpCount: nextJumpCount,
      isRunning: false,
    };

    playerRef.current = updatedPlayer;
    setPlayer(updatedPlayer);
  }

  function handleMoveControl(direction: "left" | "right", isPressed: boolean) {
    if (direction === "left") {
      keysRef.current.left = isPressed;
      return;
    }

    keysRef.current.right = isPressed;
  }

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscrollBehavior = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscrollBehavior;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const syncTouchDevice = () => {
      setShowTouchControls(isLikelyTouchDevice());
    };
    const syncTimer = window.setTimeout(syncTouchDevice, 0);

    if (media.addEventListener) {
      media.addEventListener("change", syncTouchDevice);
    } else {
      media.addListener(syncTouchDevice);
    }

    window.addEventListener("resize", syncTouchDevice);

    return () => {
      window.clearTimeout(syncTimer);

      if (media.removeEventListener) {
        media.removeEventListener("change", syncTouchDevice);
      } else {
        media.removeListener(syncTouchDevice);
      }

      window.removeEventListener("resize", syncTouchDevice);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isMoveLeftInput(event)) {
        event.preventDefault();
        keysRef.current.left = true;
      }

      if (isMoveRightInput(event)) {
        event.preventDefault();
        keysRef.current.right = true;
      }

      if (event.code === "Space") {
        event.preventDefault();

        if (!event.repeat) {
          tryJump();
        }
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (isMoveLeftInput(event)) {
        keysRef.current.left = false;
      }

      if (isMoveRightInput(event)) {
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

    playerRef.current = INITIAL_PLAYER;
    petalsRef.current = [];
    beesRef.current = [];
    petalSpawnElapsedRef.current = 0;
    beeSpawnElapsedRef.current = 0;
    const roundStart = performance.now();
    roundStartTimeRef.current = roundStart;
    lastFrameRef.current = roundStart;
    lastRenderCommitRef.current = roundStart;
    lastHudCommitRef.current = roundStart;

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

    function spawnBee(speedMultiplier: number) {
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
      const beeSpeed = (0.42 + Math.random() * 0.22) * speedMultiplier;

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
      const elapsedSeconds = (now - roundStartTimeRef.current) / 1000;

      if (now - lastHudCommitRef.current >= 1000 / HUD_UPDATE_FPS) {
        lastHudCommitRef.current = now;
        setSurvivalSeconds(elapsedSeconds);
      }

      const difficultyTier = Math.floor(elapsedSeconds / DIFFICULTY_SCALE_INTERVAL);
      const difficultyMultiplier = DIFFICULTY_MULTIPLIER_STEP ** difficultyTier;

      const moveDirection =
        (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);

      const currentPlayer = playerRef.current;
      let nextVelocityY = currentPlayer.velocityY - GRAVITY * delta;
      let nextJumpOffset = currentPlayer.jumpOffset + nextVelocityY * delta;
      let nextJumpCount = currentPlayer.jumpCount;

      if (nextJumpOffset < 0) {
        nextJumpOffset = 0;
        nextVelocityY = 0;
        nextJumpCount = 0;
      }

      const nextX = clamp(
        currentPlayer.x + moveDirection * PLAYER_MOVE_SPEED * delta,
        PLAYER_WIDTH / 2,
        1 - PLAYER_WIDTH / 2,
      );
      const nextFacing: FacingDirection =
        moveDirection < 0 ? "left" : moveDirection > 0 ? "right" : currentPlayer.facing;
      const isOnGround = nextJumpOffset <= 0.0001;

      const nextPlayer: PlayerState = {
        x: nextX,
        jumpOffset: nextJumpOffset,
        velocityY: nextVelocityY,
        jumpCount: nextJumpCount,
        facing: nextFacing,
        isRunning: isOnGround && moveDirection !== 0,
      };

      petalSpawnElapsedRef.current += delta;
      while (petalSpawnElapsedRef.current >= PETAL_SPAWN_INTERVAL) {
        petalSpawnElapsedRef.current -= PETAL_SPAWN_INTERVAL;
        spawnPetal();
      }

      beeSpawnElapsedRef.current += delta;
      const currentBeeSpawnInterval = BASE_BEE_SPAWN_INTERVAL / difficultyMultiplier;
      while (beeSpawnElapsedRef.current >= currentBeeSpawnInterval) {
        beeSpawnElapsedRef.current -= currentBeeSpawnInterval;
        spawnBee(difficultyMultiplier);
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
            PETAL_COLLISION_SIZE,
            PETAL_COLLISION_SIZE,
          )
        ) {
          deltaScore += 10;
          continue;
        }

        nextPetals.push(updated);
      }

      const nextBees: FlyingBee[] = [];
      let hitByBee = false;
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
            PLAYER_WIDTH * BEE_COLLISION_PLAYER_WIDTH_FACTOR,
            PLAYER_HEIGHT * BEE_COLLISION_PLAYER_HEIGHT_FACTOR,
            updated.x,
            updated.y,
            BEE_COLLISION_WIDTH * BEE_COLLISION_BEE_WIDTH_FACTOR,
            BEE_COLLISION_HEIGHT * BEE_COLLISION_BEE_HEIGHT_FACTOR,
          )
        ) {
          hitByBee = true;
          break;
        }

        nextBees.push(updated);
      }

      const nextScore = Math.max(0, scoreRef.current + deltaScore);
      const shouldCommitRender = now - lastRenderCommitRef.current >= 1000 / GAME_RENDER_FPS;

      if (hitByBee) {
        playerRef.current = nextPlayer;
        petalsRef.current = nextPetals;
        beesRef.current = nextBees;
        scoreRef.current = nextScore;
        lastRenderCommitRef.current = now;
        lastHudCommitRef.current = now;
        setSurvivalSeconds(elapsedSeconds);
        setPlayer(nextPlayer);
        setPetals(nextPetals);
        setBees(nextBees);
        if (deltaScore !== 0) {
          setScore(nextScore);
        }
        setIsFinished(true);
        return;
      }

      playerRef.current = nextPlayer;
      petalsRef.current = nextPetals;
      beesRef.current = nextBees;
      scoreRef.current = nextScore;

      if (shouldCommitRender || deltaScore !== 0) {
        lastRenderCommitRef.current = now;
        setPlayer(nextPlayer);
        setPetals(nextPetals);
        setBees(nextBees);
      }

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
      router.push(`/main?score=${finalScore}`);
    });
  }


  function handleRestart() {
    setSurvivalSeconds(0);
    setIsFinished(false);
    setScore(0);
    setPlayer(INITIAL_PLAYER);
    setPetals([]);
    setBees([]);
    scoreRef.current = 0;
    keysRef.current = {
      left: false,
      right: false,
    };
    playerRef.current = INITIAL_PLAYER;
    petalsRef.current = [];
    beesRef.current = [];
    setShareBonus(0);
    setHasAppliedShareBonus(false);
    setRoundKey((current) => current + 1);
  }

  function handleCloseGame() {
    router.push("/game/select");
  }

  function handleHudPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  function preventTouchScroll(event: ReactTouchEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  async function handleShareResult() {
    const shareUrl =
      typeof window === "undefined"
        ? ""
        : `${window.location.origin}/main`;

    if (!shareUrl) {
      return;
    }

    const shareRankText = currentSchool ? `${currentSchool.rank}위` : "순위";
    const shareText = `[${schoolName}] 방금 미니게임으로 벚꽃 ${score.toLocaleString()}개 획득. 이번 시즌 ${shareRankText} 굳히는 중. 같이 들어와서 우리 학교 도와줘!!`;

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
          return;
        }

        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    } catch {
    }
  }

  const finalAppliedScore = score + shareBonus;
  const currentSchool = schools.find((item) => item.id === schoolId) ?? null;
  const currentSchoolIndex = schools.findIndex((item) => item.id === schoolId);
  const previousSchool = currentSchoolIndex > 0 ? schools[currentSchoolIndex - 1] : null;
  const lionVisual = getLionVisual(player);
  const lionScale = getLionScale(lionVisual.pose);
  const lionGroundOffset = getLionGroundOffset(lionVisual.pose);

  return (
    <main className="relative min-h-screen overflow-hidden text-stone-900">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[84rem] flex-col px-4 py-5">
        <section className="relative flex flex-1 flex-col items-stretch justify-center py-4 sm:py-6">
          <div className="relative mt-4 min-h-[80vh] w-full overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.24))] shadow-[0_24px_80px_rgba(120,73,96,0.12)] sm:mt-6 sm:min-h-[86vh]">
            <div className="absolute inset-x-0 top-0 z-20 flex h-16 items-center border-b border-sky-400/80 bg-[linear-gradient(180deg,#9ed8ff,#69bfff)] px-4 sm:h-[68px] sm:px-5">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-white/80 bg-white/82 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-sky-700 shadow-[0_6px_18px_rgba(91,141,176,0.16)]">
                    BLOSSOM DROP
                  </div>
                  <div className="hidden translate-y-1 items-center gap-1.5 sm:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/95" />
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500/95" />
                    <span className="h-1.5 w-1.5 rounded-full bg-pink-400/95" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="minimize"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90 bg-white text-stone-500 shadow-[0_4px_12px_rgba(91,141,176,0.14)]"
                  >
                    <span className="block h-[2px] w-3 rounded-full bg-stone-400" />
                  </button>
                  <button
                    type="button"
                    aria-label="maximize"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90 bg-white text-stone-500 shadow-[0_4px_12px_rgba(91,141,176,0.14)]"
                  >
                    <span className="relative block h-3.5 w-3.5">
                      <span className="absolute right-0 top-0 h-3 w-3 rounded-[2px] border border-stone-400 bg-white" />
                      <span className="absolute bottom-0 left-0 h-3 w-3 rounded-[2px] border border-stone-400 bg-white" />
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="close"
                    onClick={handleCloseGame}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200/90 bg-rose-300 text-white shadow-[0_4px_12px_rgba(244,114,182,0.18)] transition-colors duration-150 hover:bg-rose-400 active:bg-rose-500"
                  >
                    <span className="text-sm font-bold leading-none">×</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-4 bottom-4 top-20 overflow-hidden rounded-[1.7rem] border border-white/60 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(255,255,255,0.26))] select-none touch-none sm:inset-x-5 sm:bottom-5 sm:top-[88px]">
              <div className="absolute inset-0 [image-rendering:pixelated]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#6fb7ff_0%,#9bd3ff_48%,#68b861_48%,#549f4f_100%)]" />
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 top-0"
                style={{
                  height: `${(1 - SKY_GROUND_BOUNDARY_Y) * 100}%`,
                }}
              >
                <Image
                  src={PROTOTYPE_ONE_BG_SKY_IMAGE}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  draggable={false}
                  className="object-cover opacity-95 [image-rendering:pixelated]"
                />
              </div>

              <div
                className="pointer-events-none absolute inset-x-0"
                style={{
                  bottom: `${GROUND_LINE_Y * 100}%`,
                  height: `${UPPER_GROUND_HEIGHT * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-[#66b95a]/90" />
                <Image
                  src={PROTOTYPE_ONE_BG_UPPER_GREEN_IMAGE}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  draggable={false}
                  className="object-cover opacity-90 [image-rendering:pixelated]"
                />
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 bg-[#295529]"
                style={{
                  bottom: `${GROUND_LINE_Y * 100}%`,
                  height: "6px",
                }}
              />

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0"
                style={{
                  height: `${LOWER_GROUND_HEIGHT * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-[#4fa24b]/90" />
                <Image
                  src={PROTOTYPE_ONE_BG_LOWER_GREEN_IMAGE}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  draggable={false}
                  className="object-cover opacity-90 [image-rendering:pixelated]"
                />
              </div>

              <div
                onPointerDown={handleHudPointerDown}
                className="absolute inset-x-0 top-0 z-20 flex select-none items-center justify-between px-5 py-4 sm:px-6"
              >
                <div className="text-stone-900">
                  <p className="text-2xl font-black sm:text-3xl">
                    {survivalSeconds.toFixed(1)}
                    <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">초</span>
                  </p>
                </div>
                <div className="text-right text-stone-900">
                  <p className="text-2xl font-black sm:text-3xl">
                    {score}
                    <span className="ml-1.5 text-base font-bold text-rose-500 sm:text-lg">점</span>
                  </p>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />

              <div className="pointer-events-none absolute left-1/2 top-[6%] h-[92%] w-[108%] -translate-x-1/2">
                <Image
                  src={PROTOTYPE_ONE_TREE_IMAGE}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 122vw, 92vw"
                  draggable={false}
                  className="object-contain [image-rendering:pixelated]"
                />
              </div>

              {petals.map((petal) => (
                <div
                  key={petal.id}
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${petal.x * 100}%`,
                    bottom: `${petal.y * 100}%`,
                    width: `${PETAL_RENDER_SIZE * 100}%`,
                    height: `${PETAL_RENDER_SIZE * 100}%`,
                    transform: `translate(-50%, 50%) rotate(${petal.rotation}deg)`,
                  }}
                >
                  <Image
                    src={PROTOTYPE_ONE_PETAL_IMAGE}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    sizes="40px"
                    draggable={false}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                  />
                </div>
              ))}

              {bees.map((bee) => (
                <div
                  key={bee.id}
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${bee.x * 100}%`,
                    bottom: `${bee.y * 100}%`,
                    width: `${BEE_RENDER_WIDTH * 100}%`,
                    height: `${BEE_RENDER_HEIGHT * 100}%`,
                  }}
                >
                  <Image
                    src={PROTOTYPE_ONE_BEE_IMAGE}
                    alt=""
                    width={72}
                    height={52}
                    unoptimized
                    sizes="72px"
                    draggable={false}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                  />
                </div>
              ))}

              <div
                className="pointer-events-none absolute z-30 -translate-x-1/2"
                style={{
                  left: `${player.x * 100}%`,
                  bottom: `${(PLAYER_GROUND_Y + player.jumpOffset - lionGroundOffset) * 100}%`,
                  width: `${PLAYER_WIDTH * 100}%`,
                  height: `${PLAYER_HEIGHT * 100}%`,
                }}
              >
                <div
                  className="relative h-full w-full"
                  style={{
                    transform: `scale(${lionScale})`,
                    transformOrigin: "center bottom",
                  }}
                >
                  <Image
                    src={lionVisual.path}
                    alt=""
                    width={112}
                    height={112}
                    unoptimized
                    sizes="112px"
                    draggable={false}
                    className="h-full w-full object-contain [image-rendering:pixelated]"
                  />
                </div>
              </div>

              {showTouchControls && !isFinished ? (
                <div
                  className="absolute inset-x-0 bottom-4 z-40 flex items-end justify-between px-4 touch-none sm:px-6"
                  onTouchStart={preventTouchScroll}
                  onTouchMove={preventTouchScroll}
                  onTouchEnd={preventTouchScroll}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="왼쪽 이동"
                      className="pointer-events-auto flex h-14 w-14 touch-none items-center justify-center rounded-2xl border border-white/65 bg-black/38 text-2xl font-black text-white backdrop-blur-sm active:scale-95"
                      onTouchStart={preventTouchScroll}
                      onTouchMove={preventTouchScroll}
                      onTouchEnd={preventTouchScroll}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleMoveControl("left", true);
                      }}
                      onPointerUp={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleMoveControl("left", false);
                      }}
                      onPointerCancel={() => {
                        handleMoveControl("left", false);
                      }}
                      onPointerLeave={() => {
                        handleMoveControl("left", false);
                      }}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      aria-label="오른쪽 이동"
                      className="pointer-events-auto flex h-14 w-14 touch-none items-center justify-center rounded-2xl border border-white/65 bg-black/38 text-2xl font-black text-white backdrop-blur-sm active:scale-95"
                      onTouchStart={preventTouchScroll}
                      onTouchMove={preventTouchScroll}
                      onTouchEnd={preventTouchScroll}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleMoveControl("right", true);
                      }}
                      onPointerUp={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleMoveControl("right", false);
                      }}
                      onPointerCancel={() => {
                        handleMoveControl("right", false);
                      }}
                      onPointerLeave={() => {
                        handleMoveControl("right", false);
                      }}
                    >
                      ▶
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="점프"
                    className="pointer-events-auto flex h-16 min-w-20 touch-none items-center justify-center rounded-2xl border border-rose-100/75 bg-rose-500/85 px-5 text-base font-black text-white shadow-[0_8px_24px_rgba(244,114,182,0.3)] backdrop-blur-sm active:scale-95"
                    onTouchStart={preventTouchScroll}
                    onTouchMove={preventTouchScroll}
                    onTouchEnd={preventTouchScroll}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      tryJump();
                    }}
                  >
                    점프
                  </button>
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(214,162,177,0),rgba(151,99,125,0.22))]" />
            </div>
          </div>
        </section>
      </div>

      {isFinished ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/46 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/92 p-6 text-center text-stone-900 shadow-2xl">
            <div className="relative">
              <h2 className="text-3xl font-bold">벚꽃 드랍 게임 종료</h2>
              <div className="mt-5 rounded-[1.6rem] border border-stone-200 bg-stone-50 px-5 py-6">
                <p className="text-sm font-semibold tracking-[0.24em] text-rose-500">
                  게임 결과
                </p>
                <p className="mt-3 text-5xl font-black tracking-[-0.05em] text-stone-900 sm:text-6xl">
                  {finalAppliedScore}
                  <span className="ml-2 text-2xl font-bold text-rose-500 sm:ml-3 sm:text-3xl">
                    점
                  </span>
                </p>
                <p className="mt-3 text-sm font-medium text-stone-500">
                  생존 시간 {survivalSeconds.toFixed(1)}초
                </p>
              </div>
              {currentSchool ? (
                <p className="mt-5 text-sm text-stone-500">
                  현재 {schoolName}{topicParticle(schoolName)} {currentSchool.rank}위예요.
                  {previousSchool
                    ? ` 바로 위에 ${previousSchool.name}${subjectParticle(previousSchool.name)} 있어요.`
                    : ""}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleShareResult}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700 transition-transform duration-200 hover:scale-[1.02]"
                >
                  친구에게 공유하고 점수 더 받기
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-4 text-sm font-semibold text-stone-700 transition-transform duration-200 hover:scale-[1.02]"
                >
                  다시하기
                </button>
                <button
                  type="button"
                  onClick={handleApplyScore}
                  disabled={isSaving}
                  className="rounded-2xl bg-stone-900 px-4 py-4 text-center text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02]"
                >
                  메인으로
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
