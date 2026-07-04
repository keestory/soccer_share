import "server-only";
import { cookies } from "next/headers";
import { dictionaries, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "en" ? "en" : "ko";
}

// 서버 컴포넌트에서 사전 획득: const t = await getDict();
export async function getDict() {
  return dictionaries[await getLocale()];
}
