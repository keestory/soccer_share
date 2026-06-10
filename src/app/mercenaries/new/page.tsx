import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createMercenaryPost } from "@/lib/actions";
import { LEVEL_LABELS, POSITIONS, REGIONS } from "@/lib/constants";

export default async function NewMercenaryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">용병 글쓰기</h1>
      <form action={createMercenaryPost} className="card space-y-4">
        <div>
          <label className="label">유형</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="postType" value="RECRUIT" defaultChecked /> 용병 구해요 (팀)
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="postType" value="OFFER" /> 용병 갈게요 (개인)
            </label>
          </div>
        </div>
        <div>
          <label className="label">제목</label>
          <input name="title" className="input" placeholder="예) 6/13(토) 오전 용병 2명 구합니다 (DF/MF)" required />
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
            <label className="label">날짜 (선택)</label>
            <input name="matchDate" type="date" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">포지션</label>
            <select name="position" className="input" defaultValue="무관">
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">희망 실력</label>
            <select name="level" className="input" defaultValue={3}>
              {Object.entries(LEVEL_LABELS).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">참가비 (원)</label>
            <input name="fee" type="number" min={0} step={1000} className="input" defaultValue={0} />
          </div>
        </div>
        <div>
          <label className="label">내용</label>
          <textarea
            name="content"
            className="input min-h-32"
            placeholder="경기 시간, 구장, 실력대, 연락 방법 등을 적어주세요."
            required
          />
        </div>
        <button className="btn-primary w-full">등록하기</button>
      </form>
    </div>
  );
}
