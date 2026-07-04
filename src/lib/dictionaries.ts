// 언어팩 (ko/en). 순수 모듈 — 서버/클라이언트 어디서나 import 가능.
// 페이지별 문자열은 이 사전으로 점진 이관한다. (현재: 공용 UI + 홈)

export type Locale = "ko" | "en";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
];

const ko = {
  brand: "사커쉐어",
  nav: {
    games: "픽업게임",
    matches: "매치찾기",
    transfers: "구장양도",
    mercenaries: "용병",
    venues: "구장예약",
    teams: "팀",
    myReservations: "내 예약",
    login: "로그인",
    signup: "회원가입",
    logout: "로그아웃",
  },
  home: {
    heroTitle: "이번 주말, 같이 차실래요?",
    heroSubtitle: "상대팀 매칭 · 구장 양도 · 용병 모집 · 구장 예약 · 팀 프로필까지 한 곳에서.",
    ctaGame: "게임 열기",
    ctaBook: "구장 예약하기",
    secGames: "🥅 픽업게임",
    secMatches: "⚔️ 매치찾기",
    secTransfers: "🎫 구장양도",
    secMercenaries: "🏃 용병",
    secVenues: "🏟️ 구장예약",
    more: "더보기 →",
    empty: "아직 게시글이 없습니다.",
    emptyVenue: "등록된 구장이 없습니다.",
  },
  footer: "사커쉐어 — 아마추어 축구/풋살 커뮤니티",
};

const en: typeof ko = {
  brand: "SoccerShare",
  nav: {
    games: "Pickup",
    matches: "Matches",
    transfers: "Transfers",
    mercenaries: "Guests",
    venues: "Venues",
    teams: "Teams",
    myReservations: "My bookings",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
  },
  home: {
    heroTitle: "Playing this weekend?",
    heroSubtitle: "Match opponents, transfer pitches, find guest players, book venues, and track your team — all in one place.",
    ctaGame: "Host a game",
    ctaBook: "Book a venue",
    secGames: "🥅 Pickup games",
    secMatches: "⚔️ Find a match",
    secTransfers: "🎫 Pitch transfers",
    secMercenaries: "🏃 Guest players",
    secVenues: "🏟️ Book a venue",
    more: "More →",
    empty: "No posts yet.",
    emptyVenue: "No venues yet.",
  },
  footer: "SoccerShare — amateur football/futsal community",
};

export const dictionaries = { ko, en };
export type Dict = typeof ko;
