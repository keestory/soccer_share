"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(login, {});

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">로그인</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">이메일</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">비밀번호</label>
          <input name="password" type="password" className="input" required />
        </div>
        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "로그인 중..." : "로그인"}
        </button>
        <p className="text-center text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-pitch-600">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}
