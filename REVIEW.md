# 제품 리뷰 & 조치 기록

5개 역할(Product Manager · QA · Design/UX · Engineering · Business)의 전문가 패널 리뷰 결과와 조치 현황.

## 교차 합의 핵심 이슈 (여러 역할이 공통 지적)

1. **콜드스타트/유동성 장치 부재 + 연결수단·알림 없음** — 매칭이 "댓글 남기고 대기"에서 끊김 (PM·Business, 최상)
2. **"자동 스탯 플라이휠"이 실제론 주최자 수기 입력**, 픽업 스탯 ↔ 팀 로스터 스탯 분리 (PM·Business)
3. **Korea형 코드 vs Indonesia 전략 모순, i18n은 표면** (KRW·한글 요일/지역명) (Business·PM·Design)
4. **세션 보안**: 시크릿 기본값 위조·비폐기·비교 방식 (Engineering·QA)
5. **경쟁조건**: 예약 이중부킹·게임 정원 초과 (Engineering·QA)
6. **서버측 검증 누락**: 숫자·status·댓글 대상 (Engineering·QA)
7. **모바일 IA**: 하단탭이 일부 섹션 누락 (Design)
8. **수익 경로 없음** (Business·PM)
9. **접근성**: 대비·포커스·aria·로딩상태 (Design)
10. **서비스워커가 인증 페이지 캐싱** (Engineering)

## ✅ 이번에 조치 완료 (Tier 1 + 안전한 Tier 2)

**보안**
- `SESSION_SECRET` 운영 미설정/기본값 시 부팅 실패(위조 차단), 쿠키 `secure`(운영), 세션 서명 `timingSafeEqual` 비교 — `src/lib/auth.ts`
- 기본 보안 헤더(X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) — `next.config.mjs`

**서버측 검증 (`src/lib/actions.ts`)**
- level/rating/goals/assists/price/fee/capacity/quarter/score 전부 클램프 + NaN 가드
- status·postType·position 화이트리스트(`oneOf`), `updateGameStatus`는 마감/취소만 허용, `recordGameStats`는 성사/마감 게임에만
- 댓글: postType 검증 + 대상 게시글 존재 확인 + 길이 제한
- 회원가입/팀생성 P2002(중복) friendly 처리

**동시성**
- `joinGame` 정원확인+참가를 `$transaction`으로, `createReservation` 이중부킹 확인+생성을 `$transaction`으로 (SQLite 단일 writer 직렬화; Postgres 전환 시 제약/락으로 강화 필요)
- 성사(CONFIRMED)된 게임은 인원 이탈 시 자동 해제하지 않음

**모바일/UX/접근성**
- 모바일 하단탭에 **"더보기" 시트** 추가 → 리더보드·구장양도·용병·내예약 진입점 확보 — `MobileNav.tsx`
- 버튼 `focus-visible` 링, 선수 삭제 버튼 대비 상향, 경기결과 입력/선수·경기 select에 `aria-label`
- 댓글 타임스탬프 locale 반영

**엔지니어링 위생**
- DB 인덱스 추가(PickupGame.status, GameParticipant.userId, Reservation[venueId,date]/[userId])
- 홈 득점자 N+1 제거(단일 findMany), 데드코드 제거(i18n 후 미사용 constants)
- 서비스워커: 인증 HTML 캐싱 중단 → 정적 자산만 cache-first(`sw.js` v2)

## ⏳ 남은 항목 (Tier 2/3 — 방향 결정 필요)

**Tier 2 (엔지니어링, 규모 작업)**
- SQLite → **PostgreSQL** 마이그레이션 + 커넥션 풀링 (동시성 근본 해결: 예약 exclusion 제약 등)
- 문자열 enum → 실제 enum, 자동화 테스트 도입, ESLint 설정
- 리더보드/프로필 집계를 DB 집계 또는 materialized stats 테이블로(대규모 대비)
- 과거 경기 필터/자동 마감(현재 matchDate가 String), 예약 날짜 UTC off-by-one

**Tier 3 (제품/전략 결정)**
- **콜드스타트 메커니즘**: 알림/초대/추천 + 한 동네 집중. Business 권고 = *앱 개발 전, 한 지역에서 4-6주 수동 운영으로 필/재방문/지불의사 검증*
- **스탯 통합 & 실질 자동화**: 로스터 `Player`를 `User`에 연결(단일 선수카드·리더보드), MVP 참가자 투표
- **시장/결제 정합성**: region/currency/date를 시장별 데이터화(Market 설정), 결제 재도입 시점·현지 레일(GoPay/OVO 등) 명문화 — 또는 "Indonesia 준비완료" 주장 조정
- **연결/알림 레이어**: 성사·참가·댓글 알림 + 인앱 쪽지 (매칭 앱의 리텐션 핵심)
