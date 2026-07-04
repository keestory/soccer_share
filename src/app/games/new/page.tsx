import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createPickupGame } from "@/lib/actions";
import { FORMATS, REGIONS } from "@/lib/constants";

export default async function NewGamePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">게임 열기</h1>
      <p className="mb-4 text-sm text-gray-400">정원과 최소 인원을 정하면, 최소 인원이 모이는 순간 자동으로 성사됩니다.</p>
      <form action={createPickupGame} className="card space-y-4">
        <div>
          <label className="label">제목</label>
          <input name="title" className="input" placeholder="예) 토요일 아침 풋살 한 자리씩 채워요" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">지역</label>
            <select name="region" className="input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">구장</label>
            <input name="venue" className="input" placeholder="예) 초안산 풋살파크" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">날짜</label>
            <input name="matchDate" type="date" className="input" required />
          </div>
          <div>
            <label className="label">시작</label>
            <input name="startTime" type="time" className="input" required />
          </div>
          <div>
            <label className="label">종료</label>
            <input name="endTime" type="time" className="input" required />
          </div>
        </div>
        <div>
          <label className="label">경기 방식</label>
          <select name="format" className="input">
            {FORMATS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">총 정원 (명)</label>
            <input name="capacity" type="number" min={2} defaultValue={10} className="input" required />
          </div>
          <div>
            <label className="label">성사 최소 인원 (명)</label>
            <input name="minToConfirm" type="number" min={2} defaultValue={6} className="input" required />
          </div>
        </div>
        <button className="btn-primary w-full">게임 열기 (내가 첫 참가자로 등록됩니다)</button>
      </form>
    </div>
  );
}
