import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "@/lib/actions";
import { LEVEL_LABELS, POSITIONS, REGIONS } from "@/lib/constants";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-bold">프로필 수정</h1>
      <form action={updateProfile} className="card space-y-4">
        <div>
          <label className="label">닉네임</label>
          <input className="input bg-gray-100" value={user.nickname} disabled />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">선호 포지션</label>
            <select name="position" className="input" defaultValue={user.position ?? "무관"}>
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">실력 레벨</label>
            <select name="level" className="input" defaultValue={user.level}>
              {Object.entries(LEVEL_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">주 활동 지역</label>
          <select name="region" className="input" defaultValue={user.region ?? REGIONS[0]}>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">자기소개</label>
          <textarea name="bio" className="input min-h-24" defaultValue={user.bio ?? ""} placeholder="플레이 스타일, 활동 가능 시간 등" />
        </div>
        <button className="btn-primary w-full">저장하기</button>
      </form>
    </div>
  );
}
