# CHANGELOG

## 2026-04-05

### 생성한 파일
- `CHANGELOG.md`
- `app/_lib/mock-auth.ts`
- `app/_lib/mock-data.ts`
- `app/login/page.tsx`
- `app/login/login-form.tsx`
- `app/signup/page.tsx`
- `app/signup/signup-form.tsx`
- `app/main/page.tsx`
- `app/game/game-client.tsx`
- `app/game/page.tsx`
- `app/ranking/page.tsx`
- `app/schools/[schoolId]/page.tsx`

### 수정한 파일
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`

### 이번 작업에서 구현한 화면과 기능
- 초기화면 MVP 골격 구현
- 로그인 화면 MVP 골격 구현
- 회원가입 화면 MVP 골격 구현
- 로그인 후 메인 화면으로 이동하도록 연결
- 메인 화면 MVP 골격 구현
- 미니게임 화면 MVP 골격 구현
- 랭킹 화면 MVP 골격 구현
- 다른 학교 상세 화면 MVP 골격 구현
- 화면 간 라우팅 연결
- 더미 데이터 기반 학교 상태 표시
- 미니게임 15초, 벚꽃 `+1`, 벌레 `-2` 규칙 반영
- 게임 종료 후 메인 화면으로 점수 전달
- `npx next build --webpack` 기준 빌드 검증 완료

### 더미 데이터 및 실제 연결 필요 항목
- 학교 랭킹, 벚꽃 수, 개화율, 레벨은 모두 `app/_lib/mock-data.ts`의 더미 데이터 사용
- 로그인/회원가입은 로컬 스토리지 기반 임시 인증 흐름 사용
- 미니게임 점수는 서버 저장 없이 URL 파라미터로만 반영
- 흔들기 기능은 실제 반영 없이 더미 수치와 안내 문구로 처리
- 학교 상태 변화, 랭킹 재계산, 계정 세션 유지, 실제 DB/API 연동 필요

## 2026-04-05 추가 점검

### 생성한 파일
- `app/community/page.tsx`

### 수정한 파일
- `app/main/page.tsx`
- `app/game/game-client.tsx`
- `app/ranking/page.tsx`
- `app/schools/[schoolId]/page.tsx`
- `CHANGELOG.md`

### 이번 점검에서 추가한 동작
- 메인 화면의 `실시간 댓글 커뮤니티` 버튼을 실제 라우트로 연결
- `/community` 더미 커뮤니티 화면 추가
- 게임 화면에서 랭킹, 커뮤니티로 이동 가능하도록 링크 추가
- 랭킹 화면에서 게임, 커뮤니티로 이동 가능하도록 링크 추가
- 학교 상세 화면에서 메인, 커뮤니티로 이동 가능하도록 링크 추가
- 학교 상세의 흔들기 버튼을 더미 상태 변경 방식으로 연결
- 흔들기 사용 후 안내 문구가 보이도록 처리

### 아직 미구현인 부분
- 커뮤니티 댓글 작성/실시간 반영 기능
- 흔들기 실제 서버 반영 및 하루 1회 제한 영속화
- 미니게임 점수의 실제 누적 저장
- 사용자 세션 유지 및 학교 상태의 실제 동기화

## 2026-04-05 디자인 구조 보강

### 생성한 파일
- `app/main/main-client.tsx`

### 수정한 파일
- `app/page.tsx`
- `app/main/page.tsx`
- `app/game/game-client.tsx`
- `app/ranking/page.tsx`
- `app/_lib/mock-data.ts`
- `app/globals.css`
- `CHANGELOG.md`

### 이번 작업에서 추가한 내용
- 초기화면을 이미지 배경 슬롯 구조로 변경
- 메인 화면을 이미지 배경 + 레벨별 나무 이미지 슬롯 구조로 변경
- 메인 화면 진행도 바 UI 추가
- 메인 화면 메뉴 버튼 및 드로어 오버레이 구현
- 미니게임을 낙하 애니메이션 기반 인터랙션으로 고도화
- 랭킹 화면 랭킹순에서 상위 3개 단상 UI 추가

### 이미지 자산 연결 방식
- 초기화면 배경: `/public/images/landing/hero-background.jpg`
- 학교별 메인 배경: `/public/images/schools/{schoolId}/main-background.jpg`
- 학교별 레벨 나무 이미지: `/public/images/schools/{schoolId}/tree-level-{level}.png`

### 아직 남은 실제 연결 포인트
- 실제 이미지 파일 추가 필요
- 학교별 나무 이미지 단계 세분화 필요
- 메뉴 내부 로그아웃/커뮤니티 상태를 실제 세션과 연결 필요

## 2026-04-05 메인 구조 및 게임 수정

### 수정한 파일
- `app/main/main-client.tsx`
- `app/game/game-client.tsx`
- `app/globals.css`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 메인 화면을 카드 분할 구조에서 전면형 레이아웃으로 변경
- 상단 바를 `현재 순위 / 레벨(퍼센트+총벚꽃수) / 메뉴` 구성으로 정리
- 중앙에는 학교 나무 이미지만 크게 보이도록 정리
- 하단에는 `벚꽃 붙이기`, `방해하러 가기` 버튼만 남기도록 정리
- 메뉴 안으로 나머지 이동 링크를 넣어 메인 화면을 단순화
- 미니게임 낙하 애니메이션을 `top` 기반에서 `translateY` 기반으로 변경
- 벚꽃/벌레가 실제로 보이고 떨어지도록 회전/이동 키프레임을 수정

## 2026-04-05 흐름 정리 추가 수정

### 수정한 파일
- `app/main/main-client.tsx`
- `app/game/game-client.tsx`
- `app/schools/[schoolId]/page.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 메뉴의 `우리학교 벚꽃 현황`이 학교 상세가 아니라 메인 화면으로 가도록 수정
- 미니게임 화면을 전체 화면형 레이아웃으로 변경
- 게임 종료 시 중앙 결과 오버레이와 `점수 반영하고 메인으로` 버튼을 강조
- 방해하러가기 학교 상세 화면을 메인처럼 전체 화면형으로 변경
- 흔들기 제한을 테스트용으로 해제하고 연속 확인 가능하도록 수정

## 2026-04-05 로컬 저장 및 학교 목록 갱신

### 생성한 파일
- `app/_lib/school-catalog.ts`
- `app/_lib/school-state.ts`
- `app/ranking/ranking-client.tsx`
- `app/schools/[schoolId]/school-detail-client.tsx`

### 수정한 파일
- `app/_lib/mock-auth.ts`
- `app/_lib/mock-data.ts`
- `app/main/main-client.tsx`
- `app/main/page.tsx`
- `app/game/game-client.tsx`
- `app/game/page.tsx`
- `app/ranking/page.tsx`
- `app/schools/[schoolId]/page.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 지원 학교 목록을 요청한 목록 기준으로 전체 교체
- 중복으로 들어온 `서강대`는 1회만 유지
- 학교 데이터를 공통 카탈로그 기반으로 정리
- 게임 점수를 `localStorage`에 저장하도록 변경
- 메인 화면 새로고침 후에도 학교 점수/레벨/진행도가 유지되도록 수정
- 랭킹 화면도 저장된 학교 상태를 읽어오도록 수정
- 학교 상세 화면도 저장된 상태를 기준으로 표시하도록 수정
- 흔들기 사용 시 학교 총 벚꽃 수가 로컬 저장 기준으로 실제 차감되도록 수정

## 2026-04-05 Supabase 환경변수 정리

### 생성한 파일
- `.env.local`
- `app/_lib/supabase.ts`

### 수정한 파일
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 잘못된 위치의 `app/login/.env.local`을 프로젝트 루트 `.env.local`로 이동
- Supabase URL, Publishable Key를 Next.js가 읽을 수 있는 위치로 정리
- 프로젝트에서 바로 import 가능한 Supabase 클라이언트 파일 추가

## 2026-04-05 Supabase 연동 전환

### 수정한 파일
- `app/_lib/school-state.ts`
- `app/main/main-client.tsx`
- `app/game/game-client.tsx`
- `app/ranking/ranking-client.tsx`
- `app/schools/[schoolId]/school-detail-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 학교 상태 저장 방식을 `localStorage`에서 Supabase `schools` 테이블 기준으로 변경
- 메인 화면이 Supabase에서 학교 상태를 읽도록 변경
- 게임 점수 반영 버튼이 Supabase 업데이트 후 메인으로 이동하도록 변경
- 랭킹 화면이 Supabase 데이터를 읽어 실제 순위를 표시하도록 변경
- 학교 상세 화면의 흔들기가 Supabase 수치 차감으로 반영되도록 변경

## 2026-04-05 기본 학교 숭실대 기준 조정

### 수정한 파일
- `app/_lib/mock-auth.ts`
- `app/main/page.tsx`
- `app/game/page.tsx`
- `app/ranking/page.tsx`
- `app/schools/[schoolId]/page.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 기본 테스트 계정 학교를 숭실대(`school-044`)로 변경
- 메인/게임/랭킹/학교상세의 fallback 학교를 숭실대로 변경

## 2026-04-06 랭킹 이미지 슬롯 추가

### 수정한 파일
- `app/_lib/mock-data.ts`
- `app/ranking/ranking-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 랭킹순 TOP3 단상에 학교별 나무 이미지 슬롯 추가
- 랭킹순/가나다순 리스트에 학교 로고 이미지 슬롯 추가
- 학교 로고 파일 경로 helper 추가

### 이미지 파일 경로
- 단상 나무 이미지: `/public/images/schools/{schoolId}/tree-level-{level}.png`
- 리스트 로고 이미지: `/public/images/schools/{schoolId}/logo.avif`

## 2026-04-06 공통 나무 이미지 구조 변경

### 수정한 파일
- `app/_lib/mock-data.ts`
- `app/main/main-client.tsx`
- `app/ranking/ranking-client.tsx`
- `app/schools/[schoolId]/school-detail-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 학교별 나무 이미지 경로를 공통 레벨 이미지 경로로 변경
- 메인 화면, 학교 상세 화면, 랭킹 TOP3 단상이 모두 같은 레벨 기준 나무를 사용하도록 정리
- 학교별로 다른 비주얼은 로고와 배경만 남기고, 나무는 공통 자산으로 정리

### 이미지 파일 경로
- 공통 나무 이미지: `/public/images/trees/tree-level-{level}.png`
- 학교별 로고 이미지: `/public/images/schools/{schoolId}/logo.avif`
- 학교별 메인 배경 이미지: `/public/images/schools/{schoolId}/main-background.jpg`

## 2026-04-06 로고 확장자 폴백 추가

### 수정한 파일
- `app/ranking/ranking-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 랭킹 리스트의 학교 로고가 `logo.avif`를 우선 시도하고, 없으면 `logo.webp`로 자동 폴백되도록 수정
- 두 확장자 모두 없을 때만 기존 로고 자리 안내 텍스트가 보이도록 유지

## 2026-04-06 로고 플레이스홀더 표시 조정

### 수정한 파일
- `app/ranking/ranking-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 학교 로고 이미지가 정상적으로 보일 때는 `로고` 안내 텍스트가 겹치지 않도록 수정
- 실제 이미지가 없을 때만 플레이스홀더 텍스트가 보이도록 정리

## 2026-04-06 커뮤니티 MVP 작성 기능 추가

### 생성한 파일
- `app/_lib/community-comments.ts`
- `app/community/community-client.tsx`

### 수정한 파일
- `app/community/page.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 커뮤니티 화면을 더미 목록 전용 화면에서 실제 작성 가능한 MVP 구조로 변경
- 댓글 작성 시 기본 작성자 표시는 `익명`으로 고정
- `소속 대학 공개` 체크박스를 켜면 `익명 · 학교명` 형식으로 표시되도록 추가
- 댓글 작성 시간을 한국 기준 표시로 포맷팅
- 현재 로그인 학교 댓글은 리스트에서 연한 강조색과 `내 학교` 배지로 구분
- 댓글 데이터는 우선 브라우저 로컬 스토리지에 저장되도록 구현

### 아직 더미 데이터인 부분
- 댓글은 아직 Supabase가 아니라 로컬 스토리지 기준으로 저장됨
- 다른 사용자와 댓글을 실시간 공유하려면 별도 댓글 테이블과 API 연동이 필요

## 2026-04-06 커뮤니티 Supabase 연동

### 수정한 파일
- `app/_lib/community-comments.ts`
- `app/community/community-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 커뮤니티 댓글 조회를 로컬 스토리지에서 Supabase `comments` 테이블 조회 방식으로 변경
- 댓글 등록도 Supabase `insert` 기준으로 변경
- 댓글 등록 후 전체 목록을 다시 읽어와 다른 사용자와 공유 가능한 형태로 전환
- Supabase 연결 실패 시에는 기본 더미 댓글을 fallback으로 유지

## 2026-04-06 Supabase Auth 전환

### 수정한 파일
- `app/_lib/mock-auth.ts`
- `app/login/login-form.tsx`
- `app/login/page.tsx`
- `app/signup/signup-form.tsx`
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 로그인 방식을 로컬 스토리지 계정 비교에서 Supabase Auth 이메일/비밀번호 로그인으로 변경
- 회원가입 시 이메일, 비밀번호, 표시용 아이디, 소속 대학을 받아 Supabase Auth user metadata에 저장하도록 변경
- 이메일 인증이 필요한 경우 로그인 화면에서 인증 안내 문구가 보이도록 수정
- 메인 화면 로그아웃을 실제 Supabase 세션 종료 방식으로 변경

### 사용 전 필요한 설정
- Supabase Auth의 Email provider가 켜져 있어야 함
- 즉시 로그인 흐름을 원하면 Auth 설정에서 Confirm email을 끄거나, 메일 인증을 사용할 경우 Redirect URL에 배포 주소를 추가해야 함

## 2026-04-06 회원가입/커뮤니티 표시 규칙 보강

### 수정한 파일
- `app/_lib/mock-auth.ts`
- `app/_lib/community-comments.ts`
- `app/signup/signup-form.tsx`
- `app/community/community-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 회원가입 화면의 `아이디`를 `닉네임` 표시로 변경
- 학교 이메일 도메인을 `@ac.kr`, `@edu`로 제한하는 검증 추가
- 비밀번호를 영문+숫자 포함 8~20자로 제한하고 안내 문구 추가
- 커뮤니티 댓글 작성 시 `익명으로 작성` 여부와 `소속 대학 공개` 여부를 각각 선택할 수 있도록 변경
- 익명 해제 시에는 Supabase Auth metadata의 닉네임이 댓글 작성자 이름으로 표시되도록 수정

### Supabase 추가 작업 필요
- `comments` 테이블에 `nickname text`, `is_anonymous boolean default true` 컬럼 추가 필요

## 2026-04-06 인트로 영상 슬롯 추가

### 수정한 파일
- `app/page.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 초기화면 배경을 이미지 중심 구조에서 인트로 영상 자동재생 구조로 확장
- `/public/videos/intro.mp4` 경로의 mp4 파일을 자동재생/반복재생/음소거 배경 영상으로 사용하도록 수정
- 영상이 아직 없거나 로드되지 않을 때를 대비해 기존 배경 이미지를 poster/오버레이 폴백으로 유지

## 2026-04-06 메인 상단 카드 투명도 조정

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 메인 화면 상단 정보 영역 안쪽의 네모 카드 배경을 제거
- 상단 바가 3개 박스로 나뉘어 보이던 느낌을 줄이고, 더 투명한 오버레이 형태로 정리

## 2026-04-06 메인 상단 경쟁 정보 보강

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 메인 상단 메뉴 영역에서 `메뉴` 텍스트를 제거하고 햄버거 아이콘을 더 크게 표시
- 현재 순위 영역에 바로 위 학교와 바로 아래 학교의 점수 차이를 함께 표시하도록 추가
- 메인 화면이 현재 학교뿐 아니라 전체 학교 목록도 함께 읽어 경쟁 간격을 계산하도록 보강

## 2026-04-06 메인 레벨 게이지 HUD 조정

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 중앙 레벨 게이지를 더 두껍게 보이도록 조정
- 게이지 중앙에 현재 진행 퍼센트를 직접 표시하도록 변경
- 게이지 바깥 좌측 하단에 현재 레벨, 우측 하단에 다음 레벨을 표시하도록 추가
- 총 벚꽃 수를 게이지 상단 보조 정보로 재배치

## 2026-04-06 메인 게이지 표시 보정

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 메인 게이지 두께를 한 단계 더 키움
- 다음 레벨 표기를 `Level 4` 형식에서 `LV.4` 형식으로 통일
- 게이지 중앙 퍼센트 텍스트가 하단에 걸쳐 보이지 않도록 정렬과 line-height를 보정

## 2026-04-06 메인 게이지 중앙 정렬 방식 개선

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 퍼센트 텍스트 위치를 수동 오프셋 대신 `top-1/2 + translate(-50%, -50%)` 기준 중앙 정렬로 변경
- 게이지 높이가 바뀌어도 퍼센트가 더 안정적으로 중앙에 위치하도록 정리

## 2026-04-06 메인 게이지 기준 영역 분리

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 퍼센트 텍스트가 게이지 막대 높이만 기준으로 중앙 정렬되도록 구조를 분리
- 좌하단/우하단 레벨 표기를 게이지 바깥의 별도 줄로 정리해 시각적 중앙이 어긋나 보이던 문제를 완화

## 2026-04-06 메인 순위 카드 경쟁 학교 표시 강화

### 수정한 파일
- `app/main/main-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 메인 상단 좌측 순위 영역을 `윗순위 학교 / 내 순위 / 아랫순위 학교` 구조로 재배치
- 바로 위와 아래 학교에 로고 이미지, 학교명, 순위, 점수 차이를 함께 표시하도록 추가
- 현재 순위는 가운데에 두어 상대 위치를 직관적으로 비교할 수 있게 정리

## 2026-04-06 벚꽃 붙이기/흔들기 확장 구조 추가

### 생성한 파일
- `app/_lib/petal-state.ts`
- `app/_components/petal-overlay.tsx`
- `app/game/select/page.tsx`
- `app/game/game-client.tsx`

### 수정한 파일
- `app/game/page.tsx`
- `app/main/main-client.tsx`
- `app/schools/[schoolId]/school-detail-client.tsx`
- `app/globals.css`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- `벚꽃 붙이기` 진입 전에 모드 선택 화면을 추가
- 벚꽃 붙이기 방식을 `터치로 바로 붙이기`, `바닥 꽃잎 끌어다 놓기` 두 가지로 확장
- 각 모드에서 사용자가 배치한 꽃잎 위치를 퍼센트 좌표로 저장하는 구조 추가
- 메인 화면과 다른 학교 상세 화면에서 저장된 꽃잎 위치를 실제로 렌더링하도록 연결
- 다른 학교 흔들기 기능을 8초 카운트 기반 흔들기 세션으로 확장
- 모바일 흔들기 감지 외에도 브라우저 호환용 탭 +1 보조 입력을 추가
- 흔들기 종료 후 몇 개의 꽃잎이 떨어졌는지 결과 모달로 안내하도록 구현

### Supabase 추가 작업 필요
- `petal_placements` 테이블 생성 필요
- 학교별 꽃잎 위치를 저장하려면 `school_id`, `x_percent`, `y_percent`, `rotation`, `scale`, `created_at` 컬럼과 읽기/쓰기 정책이 필요

## 2026-04-06 드래그 모드 바닥 영역/꽃잎 시인성 보정

### 수정한 파일
- `app/game/game-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 드래그 모드 하단 바닥 영역의 연핑크 그라데이션을 더 중립적인 흰색 계열로 변경
- 아직 붙이지 않은 바닥 꽃잎에는 회색에 가까운 필터를 적용해 고정된 꽃잎과 구분되도록 보정
- 드래그 중 프리뷰 꽃잎은 원래 색으로 보여 배치 위치를 더 명확하게 확인할 수 있도록 유지

## 2026-04-06 나무/꽃잎 좌표 기준 통일

### 생성한 파일
- `app/_components/tree-scene.tsx`

### 수정한 파일
- `app/main/main-client.tsx`
- `app/schools/[schoolId]/school-detail-client.tsx`
- `app/game/game-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 나무 이미지와 꽃잎 렌더링을 동일한 고정 비율 캔버스 안에서 처리하도록 공통 `TreeScene` 컴포넌트 추가
- 메인, 학교 상세, 배치형 게임이 같은 나무 좌표 기준을 쓰도록 정리해 화면 비율 차이에 따른 어긋남을 완화
- 터치/드래그 배치도 같은 나무 캔버스 기준으로 잡히도록 맞춰 클릭 위치 오프셋 문제를 줄이는 방향으로 조정

## 2026-04-06 꽃잎 이미지 파일 형식 조정

### 수정한 파일
- `app/_components/petal-overlay.tsx`
- `app/game/game-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 꽃잎 이미지 경로를 `.avif`에서 `.png` 기준으로 변경
- 꽃잎 정적 자산 위치를 `/public/images/petals/petal.png` 기준으로 통일

## 2026-04-06 흔들기 결과 원인 표시 보강

### 수정한 파일
- `app/_lib/petal-state.ts`
- `app/schools/[schoolId]/school-detail-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 흔들기 결과를 `삭제 성공`, `저장된 꽃잎 없음`, `삭제 실패`로 구분해 반환하도록 수정
- `petal_placements` 조회/삽입/삭제 실패 시 콘솔에 원인 로그가 남도록 보강
- 흔들기 결과 모달이 항상 `0개`만 보여주지 않고 실제 원인을 안내하도록 수정
- 나무 이미지에 원래 포함된 꽃과 실제 저장된 꽃잎이 다르다는 설명 문구 추가

## 2026-04-06 흔들기 꽃잎 랜덤 제거 적용

### 수정한 파일
- `app/_lib/petal-state.ts`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 흔들기 시 저장된 꽃잎을 생성 순서대로 제거하지 않고 랜덤하게 선택해 떨어뜨리도록 변경
- 우수수 떨어지는 연출에 더 가깝게 보이도록 삭제 대상 선정 방식을 셔플 기반으로 조정

## 2026-04-06 흔들기 점수 차감과 시각 연출 분리

### 수정한 파일
- `app/schools/[schoolId]/school-detail-client.tsx`
- `CHANGELOG.md`

### 이번 작업에서 수정한 내용
- 흔들기 결과가 저장된 꽃잎 유무와 상관없이 `schools.total_petals`를 기준으로 항상 점수 차감되도록 수정
- 저장된 꽃잎이 있을 때만 `petal_placements`가 랜덤으로 떨어지는 시각 연출이 함께 반영되도록 정리
- 결과 모달 문구를 `점수 감소` 중심으로 바꾸고, 시각적으로 떨어진 꽃잎 수는 별도 정보로 안내하도록 수정
