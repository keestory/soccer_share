import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createTeam } from "@/lib/actions";
import { LEVEL_LABELS, REGIONS } from "@/lib/constants";

export default async function NewTeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-bold">팀 만들기</h1>
      <form action={createTeam} className="card space-y-4">
        <div>
          <label className="label">팀 이름</label>
          <input name="name" className="input" required maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">활동 지역</label>
            <select name="region" className="input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">팀 실력</label>
            <select name="level" className="input" defaultValue={3}>
              {Object.entries(LEVEL_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">팀 소개</label>
          <textarea name="description" className="input min-h-24" placeholder="활동 요일, 팀 분위기 등을 소개해주세요." />
        </div>
        <button className="btn-primary w-full">팀 생성하기</button>
      </form>
    </div>
  );
}
