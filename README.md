# ⚽ 사커쉐어 (Soccer Share)

아마추어 축구/풋살을 위한 커뮤니티 기반 매칭 서비스 MVP.

## 핵심 기능

| 기능 | 경로 | 설명 |
| --- | --- | --- |
| 매치찾기 | `/matches` | 상대팀을 찾는 게시판. 지역/상태(모집중·매치완료·마감) 필터, 팀 명의 게시 가능 |
| 구장양도 | `/transfers` | 예약한 구장을 양도하거나 양수를 원하는 글. 금액·일시·구장 정보 포함 |
| 용병 | `/mercenaries` | 팀이 용병을 구하거나(구해요), 개인이 용병으로 참여(갈게요). 포지션/실력/참가비 명시 |
| 구장예약 | `/venues` | 등록된 풋살장/축구장의 날짜별 시간대 현황 조회 및 시간 단위 예약, 중복 예약 방지 |
| 팀/선수 프로필 | `/teams`, `/players/[id]` | 팀 전적(승·무·패), 멤버 구성과 합류 시기, 선수의 포지션·레벨·활동 이력 |

공통: 회원가입/로그인(세션 쿠키), 게시글 댓글, 지역 필터, 조회수.

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
prisma/schema.prisma   # User, Team, TeamMember, MatchRecord,
                       # MatchPost, TransferPost, MercenaryPost,
                       # Venue, Reservation, Comment
src/lib/actions.ts     # 모든 서버 액션 (글 작성, 댓글, 예약, 팀 가입 등)
src/lib/auth.ts        # scrypt 해시 + HMAC 서명 쿠키 세션
src/app/...            # 페이지 (게시판 3종, 구장, 팀, 프로필, 인증)
```

## 다음 단계 아이디어

- 쪽지/채팅으로 매칭 성사 흐름 연결
- 매치 결과 ↔ 팀 전적 자동 연동 및 지역 랭킹
- 구장 예약 결제 연동, 양도 글 ↔ 예약 데이터 연결
- 용병 평가(매너/실력 리뷰)로 프로필 신뢰도 강화
- 지도 기반 구장 탐색, 푸시 알림(새 글 구독)
