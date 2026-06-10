"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions";
import { LEVEL_LABELS, POSITIONS, REGIONS } from "@/lib/constants";

export default function SignupPage() {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(signup, {});

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">회원가입</h1>
      <form action={action} className="card space-y-4">
        <div>
          <label className="label">이메일</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">닉네임</label>
          <input name="nickname" className="input" required maxLength={20} />
        </div>
        <div>
          <label className="label">비밀번호 (4자 이상)</label>
          <input name="password" type="password" className="input" required minLength={4} />
        </div>
        <div>
          <label className="label">주 활동 지역</label>
          <select name="region" className="input">
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">선호 포지션</label>
            <select name="position" className="input">
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">실력 레벨</label>
            <select name="level" className="input" defaultValue={3}>
              {Object.entries(LEVEL_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>
          {pending ? "가입 중..." : "가입하기"}
        </button>
        <p className="text-center text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-pitch-600">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
