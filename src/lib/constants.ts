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

// 로스터 선수 포지션 (코드값 저장, 한글/색상 표시)
export const PLAYER_POSITIONS = [
  { code: "FW", label: "공격수", color: "red" },
  { code: "MF", label: "미드필더", color: "green" },
  { code: "DF", label: "수비수", color: "blue" },
  { code: "GK", label: "골키퍼", color: "orange" },
] as const;

const POSITION_MAP = Object.fromEntries(PLAYER_POSITIONS.map((p) => [p.code, p]));

export function positionDot(code: string) {
  const colors: Record<string, string> = {
    red: "bg-red-500",
    green: "bg-pitch-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
  };
  return colors[POSITION_MAP[code]?.color ?? ""] ?? "bg-gray-400";
}

export function formatPlayedAt(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
