# 벚꽃살리기

## 프로젝트 소개

`벚꽃살리기`는 시험기간 대학생을 대상으로 한 학교 대항 시즌형 웹 서비스입니다. 사용자는 내 학교를 선택하고, 미니게임으로 벚꽃 점수를 모아 학교 나무를 성장시키며, 랭킹에서 다른 학교를 확인하고 상대 학교 나무를 흔들어 점수를 줄일 수 있습니다.

이 프로젝트의 핵심은 생산성 향상이 아니라, 시험기간의 집중력을 유쾌하게 방해하는 짧은 참여 루프입니다.

- 내 학교 성장
- 다른 학교 방해
- 실시간 랭킹 확인
- 친구 공유와 재방문 유도

현재 구현은 로그인/회원가입 없이 학교 선택 기반으로 동작합니다. 선택한 학교는 브라우저 `localStorage`와 쿠키에 저장됩니다.

## 데모 / 배포 링크

- 로컬 실행: `http://localhost:3000`
- 배포: Vercel 프로젝트 삭제 예정이라 현재 README에는 고정 배포 링크를 남기지 않습니다.
- 백업: Supabase 삭제 전 로컬 백업을 `supabase-backups/2026-06-13-pre-delete/`에 생성했습니다.

주의: `supabase-backups/`는 `.gitignore`에 포함되어 원격 저장소에는 올라가지 않습니다. 다른 컴퓨터에서 복구해야 한다면 이 폴더를 별도로 압축하거나 외부 저장소에 보관해야 합니다.

## 주요 기능

- 랜딩 화면
  - 인트로 영상과 벚꽃 시즌 비주얼
  - 화면 클릭 또는 키보드 입력으로 학교 선택 화면 진입

- 학교 선택
  - 학교 목록에서 내 학교 선택
  - 선택값을 브라우저 저장소와 쿠키에 저장
  - 서버 컴포넌트에서도 쿠키를 통해 선택 학교 해석

- 메인 화면
  - 내 학교 나무, 학교명, 총 벚꽃 수 표시
  - 현재 순위, 이전/다음 경쟁 학교, 레벨, 진행도 표시
  - 미니게임, 랭킹, 온보딩, 공유, 공격 로그 진입

- 미니게임
  - `벚꽃 캐치`: 떨어지는 벚꽃을 클릭하고 벌레를 피하는 15초 게임
  - `벚꽃 톡톡`: 나무에 직접 꽃잎을 붙이는 15초 탭 게임
  - `벚꽃 드랍`: 이동/점프로 벚꽃을 먹고 벌을 피하는 프로토타입 게임
  - 게임 점수는 학교 총 벚꽃 수에 반영

- 랭킹
  - 학교별 총 벚꽃 수 기반 랭킹
  - TOP 3 포디움
  - 랭킹순/가나다순 정렬
  - 학교 검색과 상세 화면 이동

- 다른 학교 상세 / 흔들기
  - 상대 학교 나무와 상태 확인
  - 8초 동안 터치, Space 입력, 모바일 흔들기로 방해 점수 누적
  - 상대 학교 총 벚꽃 수 감소
  - 저장된 꽃잎 일부 랜덤 삭제
  - 공격 로그 생성과 공유 보너스

## 기술 스택

- Framework: Next.js App Router
- Language: TypeScript
- UI: React, Tailwind CSS v4
- Backend / DB: Supabase JavaScript Client, Supabase Database
- Analytics: Vercel Analytics, Vercel Speed Insights
- Assets: `public/` 정적 이미지/영상
- Package Manager: npm

## 핵심 구현 포인트

- 모바일 우선 UX
  - 짧은 조작, 큰 버튼, 세로형 화면 흐름을 우선했습니다.

- 게임형 참여 루프
  - 학교 선택 → 메인 → 미니게임 → 점수 반영 → 랭킹 → 방해하기 흐름이 빠르게 이어지도록 구성했습니다.

- 선택 학교 상태 공유
  - 클라이언트에서는 `localStorage`, 서버에서는 쿠키를 사용해 같은 학교 선택값을 해석합니다.

- Supabase 상태 동기화
  - 학교 점수, 레벨, 진행도, 꽃잎 위치, 공격 로그를 Supabase 테이블에 저장합니다.
  - 쓰기 작업은 Next.js API Route에서 처리합니다.

- 정적 미디어 기반 시즌 비주얼
  - 랜딩 영상, 나무 성장 영상, 배경 이미지, 학교 로고, 게임 이미지를 `public/`에서 관리합니다.

- 복구 가능한 문서화
  - 현재 앱이 요구하는 테이블, 환경 변수, 백업 위치, 복구 순서를 README에 남겨두었습니다.

## 아키텍처 / 데이터 흐름

### 화면 구조

| 경로 | 역할 |
| --- | --- |
| `/` | 랜딩 화면 |
| `/select-school` | 학교 선택 |
| `/main` | 내 학교 메인 |
| `/onboarding` | 서비스 온보딩 |
| `/game/select` | 미니게임 선택 |
| `/game?mode=fall` | 벚꽃 캐치 |
| `/game?mode=tap` | 벚꽃 톡톡 |
| `/game?mode=prototype1` | 벚꽃 드랍 |
| `/ranking` | 학교 랭킹 |
| `/schools/[schoolId]` | 다른 학교 상세 / 흔들기 |

### 데이터 흐름

```text
사용자
  -> 학교 선택
  -> localStorage + cookie 저장
  -> /main 서버 컴포넌트에서 cookie로 schoolId 해석
  -> Supabase에서 학교 상태 조회
  -> 미니게임 점수 획득
  -> Next.js API Route
  -> Supabase schools 업데이트
  -> /main?score=점수 로 복귀
```

다른 학교 흔들기 흐름:

```text
/ranking
  -> /schools/[schoolId]
  -> 흔들기 입력 8초 누적
  -> /api/petal-placements/shake 로 꽃잎 일부 삭제
  -> /api/schools/apply-shake 로 총 벚꽃 수 감소
  -> /api/attack-logs/create 로 공격 로그 저장
  -> 상세 화면과 랭킹에서 변경 상태 확인
```

### API Route

| 경로 | 역할 |
| --- | --- |
| `POST /api/schools/apply-score` | 학교 총 벚꽃 수 증가, 레벨/진행도 갱신 |
| `POST /api/schools/apply-shake` | 학교 총 벚꽃 수 감소, 레벨/진행도 갱신 |
| `POST /api/petal-placements/add` | 꽃잎 위치 저장 |
| `POST /api/petal-placements/shake` | 저장된 꽃잎 일부 삭제 |
| `POST /api/attack-logs/create` | 공격 로그 저장 |

### Supabase 테이블

현재 앱이 직접 사용하는 테이블은 3개입니다.

`schools`

| 컬럼 | 설명 |
| --- | --- |
| `id` | 학교 ID |
| `name` | 학교명 |
| `total_petals` | 총 벚꽃 수 |
| `bloom_rate` | 진행도 값 |
| `level` | 나무 레벨 |
| `rank` | 저장된 순위 값 |
| `progress_percent` | 현재 레벨 구간 내 진행도 |
| `created_at` | 생성 시각 |

`petal_placements`

| 컬럼 | 설명 |
| --- | --- |
| `id` | 꽃잎 ID |
| `school_id` | 학교 ID |
| `x_percent` | 나무 영역 내 X 위치 |
| `y_percent` | 나무 영역 내 Y 위치 |
| `rotation` | 꽃잎 회전값 |
| `scale` | 꽃잎 크기 |
| `created_at` | 생성 시각 |

`attack_logs`

| 컬럼 | 설명 |
| --- | --- |
| `id` | 로그 ID |
| `attacker_school_id` | 공격 학교 ID |
| `attacker_school_name` | 공격 학교명 |
| `target_school_id` | 대상 학교 ID |
| `target_school_name` | 대상 학교명 |
| `reduced_petals` | 감소 점수 |
| `created_at` | 생성 시각 |

### 레벨 / 진행도 규칙

| 레벨 | 총 벚꽃 수 구간 |
| --- | --- |
| Lv.1 | 0-300 |
| Lv.2 | 301-600 |
| Lv.3 | 601-1,000 |
| Lv.4 | 1,001-2,000 |
| Lv.5 | 2,001-4,000 |
| Lv.6 | 4,001-11,999 |
| Lv.7 | 12,000 이상 |

진행도는 현재 레벨 구간 안에서 0-100%로 계산합니다. 랭킹은 클라이언트에서 총 벚꽃 수 높은 순으로 다시 계산하며, 동점이면 학교 카탈로그 순서를 따릅니다.

### Supabase 백업

삭제 전 백업 위치:

```text
supabase-backups/2026-06-13-pre-delete/
```

백업 내용:

| 파일 | 내용 |
| --- | --- |
| `data/schools.json` | `schools` 79행 |
| `data/petal_placements.json` | `petal_placements` 114행 |
| `data/attack_logs.json` | `attack_logs` 494행 |
| `schema.sql` | 현재 앱 기준 테이블 생성 SQL |
| `restore.sql` | 백업 데이터를 다시 넣는 SQL |
| `backup-manifest.json` | 백업 시각, Supabase project ref, 테이블별 행 수 |
| `restore-notes.md` | 복구 절차와 백업 한계 |
| `export-supabase-backup.mjs` | 같은 방식으로 재백업할 수 있는 스크립트 |

이 백업은 Supabase REST API로 가져온 테이블 데이터 백업입니다. Supabase Auth, Storage, RLS 정책, DB 함수, 트리거, role/grant, extension, Vercel 설정, 비밀 환경변수는 포함하지 않습니다.

## 실행 방법

### 1. 일반 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

### 2. Supabase까지 포함해 복구 실행

1. 새 Supabase 프로젝트를 만듭니다.
2. Supabase SQL Editor에서 `supabase-backups/2026-06-13-pre-delete/schema.sql`을 실행합니다.
3. 이어서 `supabase-backups/2026-06-13-pre-delete/restore.sql`을 실행합니다.
4. 새 프로젝트의 API URL과 key를 `.env.local`에 넣습니다.
5. `npm install`을 실행합니다.
6. `npm run dev`를 실행합니다.
7. `/select-school`에서 학교를 선택합니다.
8. `/main`, `/ranking`, `/game/select`, `/schools/[schoolId]`를 확인합니다.

### 3. 최소 화면만 확인하기

Supabase 연결이 없으면 일부 화면은 기본 목 데이터로 보이지만, 점수 저장/꽃잎 저장/공격 로그 같은 쓰기 기능은 동작하지 않습니다. 전체 플로우를 확인하려면 Supabase 환경 변수를 설정해야 합니다.

## 환경 변수

`.env.local`에 아래 값을 설정합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

설명:

| 변수 | 사용 위치 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 클라이언트 / 서버 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 클라이언트 / 서버 fallback | 공개 가능한 Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 API Route | 학교 점수, 꽃잎, 공격 로그 쓰기 작업 |

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 노출하면 안 됩니다.
- `.env.local`은 `.gitignore`에 포함되어 있습니다.
- README와 백업 메타데이터에는 실제 secret 값을 적지 않았습니다.

## 트러블슈팅 / 회고

### Supabase를 삭제한 뒤 복구하려면

`supabase-backups/2026-06-13-pre-delete/` 폴더가 남아 있어야 합니다. 이 폴더 안의 `schema.sql`과 `restore.sql`을 새 Supabase 프로젝트에 실행하면 현재 MVP의 핵심 데이터는 복원할 수 있습니다.

단, 이 백업은 전체 DB 덤프가 아닙니다. 운영 수준의 완전 복구가 필요하다면 삭제 전에 `pg_dump` 또는 `supabase db dump`로 별도 백업을 남기는 것이 더 안전합니다.

### Vercel 프로젝트를 삭제한 뒤 다시 배포하려면

1. 새 Vercel 프로젝트를 만듭니다.
2. GitHub 저장소 또는 로컬 프로젝트를 연결합니다.
3. 환경 변수 3개를 Vercel Project Settings에 추가합니다.
4. 빌드 명령은 기본값 `npm run build`를 사용합니다.
5. 배포 후 `/select-school`에서 학교 선택과 `/main` 진입을 확인합니다.

### Supabase 환경 변수가 없을 때

현재 `app/_lib/supabase.ts`는 Supabase 환경 변수가 없으면 에러를 던집니다. 프로젝트를 완전히 정적 목 데이터만으로 살리고 싶다면 Supabase 클라이언트 의존 코드를 fallback 구조로 바꿔야 합니다.

### 현재 구현과 초기 기획의 차이

- 로그인/회원가입은 아직 구현되지 않았고 학교 선택으로 대체되어 있습니다.
- 계정당 하루 1회 흔들기 제한은 아직 구현되지 않았습니다.
- 커뮤니티는 후순위로 남아 있습니다.
- 학교 로고 파일은 사용하지만, 별도 마스코트나 학교별 나무 비주얼은 구현하지 않았습니다.

### 회고

- 짧은 MVP 기간에는 계정 시스템보다 학교 선택 기반 흐름이 화면 완성에 유리했습니다.
- 게임 점수, 랭킹, 방해 로그가 연결되면서 서비스의 반복 참여 루프가 빨리 드러났습니다.
- 추후 포트폴리오용으로 다시 정리한다면 계정/제한 정책/RLS를 보강해 "실제 운영 가능한 시즌 이벤트 서비스" 형태로 확장하는 것이 좋습니다.
