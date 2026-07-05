"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions";
import { POSITIONS, REGIONS } from "@/lib/constants";
import type { Dict } from "@/lib/dictionaries";

export default function SignupForm({ t }: { t: Dict["auth"] }) {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(signup, {});

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">{t.signupTitle}</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">{t.email}</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">{t.nickname}</label>
          <input name="nickname" className="input" required maxLength={20} />
        </div>
        <div>
          <label className="label">{t.passwordHint}</label>
          <input name="password" type="password" className="input" required minLength={4} />
        </div>
        <div>
          <label className="label">{t.region}</label>
          <select name="region" className="input">
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.position}</label>
            <select name="position" className="input">
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p === "무관" ? t.any : p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.level}</label>
            <select name="level" className="input" defaultValue={3}>
              {t.levels.map((label, i) => (
                <option key={i} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? t.signingUp : t.signupBtn}
        </button>
        <p className="text-center text-sm text-gray-500">
          {t.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-pitch-600">
            {t.toLogin}
          </Link>
        </p>
      </form>
    </div>
  );
}
