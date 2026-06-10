import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createTransferPost } from "@/lib/actions";
import { REGIONS } from "@/lib/constants";

export default async function NewTransferPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">구장 양도/양수 글쓰기</h1>
      <form action={createTransferPost} className="card space-y-4">
        <div>
          <label className="label">유형</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="tradeType" value="GIVE" defaultChecked /> 양도합니다
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="tradeType" value="TAKE" /> 양수 원해요
            </label>
          </div>
        </div>
        <div>
          <label className="label">제목</label>
          <input name="title" className="input" placeholder="예) 6/14(일) 13-15시 대진고 축구장 양도합니다" required />
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
            <label className="label">구장명</label>
            <input name="venueName" className="input" placeholder="예) 대진고등학교 축구장" required />
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
          <label className="label">양도 금액 (원)</label>
          <input name="price" type="number" min={0} step={1000} className="input" placeholder="예) 90000" required />
        </div>
        <div>
          <label className="label">내용</label>
          <textarea name="content" className="input min-h-32" placeholder="예약 조건, 입금 방법 등을 적어주세요." required />
        </div>
        <button className="btn-primary w-full">등록하기</button>
      </form>
    </div>
  );
}
