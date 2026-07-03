// 국제화 기반 (P0). 전면 문자열 i18n은 P1 — 여기서는 locale/통화/포맷 유틸만 제공.

export type Locale = "ko" | "en";

export const DEFAULT_LOCALE: Locale = "ko";

// 지역(시장)별 기본 통화·locale·지배적 경기 포맷 — 리서치의 진입 시장 순서 반영
export const MARKETS = {
  KR: { label: "한국", locale: "ko", currency: "KRW", defaultFormat: "풋살(5vs5)" },
  AU: { label: "Australia", locale: "en", currency: "AUD", defaultFormat: "5-a-side" },
  GB: { label: "United Kingdom", locale: "en", currency: "GBP", defaultFormat: "5-a-side" },
  US: { label: "United States", locale: "en", currency: "USD", defaultFormat: "7인제" },
} as const;

export type CurrencyCode = "KRW" | "USD" | "GBP" | "AUD";

const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  KRW: "ko-KR",
  USD: "en-US",
  GBP: "en-GB",
  AUD: "en-AU",
};

export const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "KRW", label: "₩ 원 (KRW)" },
  { code: "USD", label: "$ USD" },
  { code: "GBP", label: "£ GBP" },
  { code: "AUD", label: "$ AUD" },
];

// 통화 인식 금액 포맷. KRW는 소수점 없음, 그 외는 통화 규칙을 Intl에 위임.
export function formatMoney(amount: number, currency: CurrencyCode = "KRW"): string {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
