# ⚽ 사커쉐어 (Soccer Share)

아마추어 축구/풋살을 위한 커뮤니티 기반 매칭 서비스. **경기를 뛰면 선수 기록이 자동으로 쌓이는** 것이 핵심 차별점입니다.

> 제품 전략 근거는 [`RESEARCH.md`](./RESEARCH.md), 로드맵은 [`ROADMAP.md`](./ROADMAP.md) 참고.

## 핵심 기능

| 기능 | 경로 | 설명 |
| --- | --- | --- |
| 픽업 게임 | `/games` | 정원·최소 인원을 정한 게임에 참가/취소. 최소 인원이 차면 **자동 성사(CONFIRMED)**. 무료 매칭 |
| 리더보드 | `/leaderboard` | 픽업 경기 결과를 유저별로 집계한 **전체 선수 랭킹**(골·도움·MVP·출전), 지역 필터 |
| 매치찾기 | `/matches` | 상대팀을 찾는 게시판. 지역/상태(모집중·매치완료·마감) 필터, 팀 명의 게시 |
| 구장양도 | `/transfers` | 예약한 구장을 양도/양수하는 글. 금액·일시·구장 정보 |
| 용병 | `/mercenaries` | 팀의 용병 모집(구해요) / 개인의 용병 지원(갈게요). 포지션·실력·참가비 |
| 구장예약 | `/venues` | 풋살장/축구장 날짜별 시간대 현황 조회 및 시간 단위 예약, 중복 예약 방지 |
| 팀/선수 | `/teams`, `/players/[id]` | 팀 전적(승·무·패)·멤버 이력, 선수 프로필 + **픽업 기록 자동 집계 카드** |
| 선수관리/랭킹 | `/teams/[id]/players` | 팀 로스터 관리, 쿼터별 골·도움·평점·출석·클린시트 랭킹(펼침 기록) |

### 자동 스탯 플라이휠 (차별점)

픽업 경기 참가 → 주최자가 결과(골·도움·MVP) 한 번 입력 → **모든 참가자의 선수 카드에 자동 누적** → 전체 리더보드에 랭크. 수기 입력에 의존하는 기존 팀관리 앱과 달리, 매칭 활동 자체가 랭킹 데이터를 만듭니다.

공통: 회원가입/로그인(세션 쿠키), 게시글 댓글, 지역 필터, 조회수.

## 국제화 (i18n)

앱 전체가 **한국어 / English / Bahasa Indonesia** 를 지원합니다. 우측 상단 언어 전환기로 즉시 전환(쿠키 저장). 진입 시장 전략(인도네시아 우선)에 맞춰 인도네시아어를 포함합니다. 문자열은 `src/lib/dictionaries.ts`에 있습니다.

## PWA (모바일)

- 홈 화면 설치 가능(`manifest.ts`, 앱 아이콘), 서비스워커(`public/sw.js`)로 오프라인 대비
- 모바일 하단 탭 내비게이션(`MobileNav`), `md` 이상에선 상단 내비

## 기술 스택

- **Next.js 15** (App Router, Server Components + Server Actions)
- **TypeScript**, **Tailwind CSS**
- **Prisma + SQLite** (개발용 — 운영 전환 시 `schema.prisma`의 provider만 PostgreSQL 등으로 교체)

## 시작하기

```bash
npm install
cp .env.example .env       # SESSION_SECRET 값 변경 권장
npm run db:push            # SQLite DB 생성
npm run db:seed            # 샘플 데이터 (데모 계정: demo@soccershare.kr / test1234)
npm run dev                # http://localhost:3000
```

## 구조

```
prisma/schema.prisma       # User, Team, TeamMember, MatchRecord, Player, PlayerEvent,
                           # Appearance, MatchPost, TransferPost, MercenaryPost,
                           # Venue, Reservation, PickupGame, GameParticipant, Comment
src/lib/actions.ts         # 서버 액션 (게시글, 댓글, 예약, 팀, 픽업 게임, 결과 입력, locale 등)
src/lib/auth.ts            # scrypt 해시 + HMAC 서명 쿠키 세션
src/lib/dictionaries.ts    # ko/en/id 언어팩,  src/lib/locale.ts  # locale 쿠키·getDict
src/app/...                # 페이지 (픽업/리더보드/게시판/구장/팀/선수/인증)
src/components/...          # Nav, MobileNav, RankingBoard, Leaderboard, PlayerManagement 등
```

## 다음 단계 아이디어

- 매칭 성사 흐름을 쪽지/채팅으로 연결
- 픽업 경기 결과 ↔ 팀 전적 자동 연동
- 용병/동료 평가(매너·실력)로 프로필 신뢰도 강화
- 실결제 연동(Stripe/현지 PG) — 수요 검증 후 재도입
- 지도 기반 구장 탐색, 새 글 푸시 알림, 인도네시아 시장 현지화(현지 결제·구장 데이터)
