export const REGIONS = [
  "서울 광진구",
  "서울 도봉구",
  "서울 노원구",
  "서울 중랑구",
  "서울 성동구",
  "서울 강북구",
  "서울 동대문구",
] as const;

export const POSITIONS = ["GK", "DF", "MF", "FW", "무관"] as const;

export const FORMATS = ["11vs11", "9vs9", "8vs8", "풋살(5vs5)", "풋살(6vs6)"] as const;

export const LEVEL_LABELS: Record<number, string> = {
  1: "입문",
  2: "초급",
  3: "중급",
  4: "상급",
  5: "선출급",
};

export const MATCH_STATUS_LABELS: Record<string, string> = {
  OPEN: "모집중",
  MATCHED: "매치완료",
  CLOSED: "마감",
};

export const POST_STATUS_LABELS: Record<string, string> = {
  OPEN: "진행중",
  DONE: "완료",
};

export function levelLabel(level: number) {
  return LEVEL_LABELS[level] ?? `Lv.${level}`;
}

export function formatDate(date: string) {
  // YYYY-MM-DD -> M/D(요일)
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}/${d.getDate()}(${days[d.getDay()]})`;
}

export function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}
