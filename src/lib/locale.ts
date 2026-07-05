import "server-only";
import { cookies } from "next/headers";
import { dictionaries, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "en" || v === "id" ? v : "ko";
}

// 서버 컴포넌트에서 사전 획득: const t = await getDict();
export async function getDict() {
  return dictionaries[await getLocale()];
}
