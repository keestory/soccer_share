"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions";
import type { Dict } from "@/lib/dictionaries";

export default function LoginForm({ t }: { t: Dict["auth"] }) {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(login, {});

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">{t.loginTitle}</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">{t.email}</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">{t.password}</label>
          <input name="password" type="password" className="input" required />
        </div>
        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? t.loggingIn : t.loginBtn}
        </button>
        <p className="text-center text-sm text-gray-500">
          {t.noAccount}{" "}
          <Link href="/signup" className="font-semibold text-pitch-600">
            {t.toSignup}
          </Link>
        </p>
      </form>
    </div>
  );
}
