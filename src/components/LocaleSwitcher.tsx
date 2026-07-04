"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/actions";
import { LOCALES, type Locale } from "@/lib/dictionaries";

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const change = (locale: Locale) => {
    if (locale === current) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5" aria-busy={pending}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => change(l.code)}
          className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
            current === l.code ? "bg-pitch-600 text-white" : "text-gray-500 hover:text-pitch-600"
          }`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
