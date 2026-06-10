import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMatchPost } from "@/lib/actions";
import { FORMATS, REGIONS } from "@/lib/constants";

export default async function NewMatchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: { team: { select: { id: true, name: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">매치 글쓰기</h1>
      <form action={createMatchPost} className="card space-y-4">
        <div>
          <label className="label">제목</label>
          <input name="title" className="input" placeholder="예) 6/14(일) 18-20시 한양대 대운동장 매치 구합니다" required />
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
            <input name="venue" className="input" placeholder="예) 한양대학교 대운동장" required />
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">경기 방식</label>
            <select name="format" className="input">
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">우리 팀 (선택)</label>
            <select name="teamId" className="input">
              <option value="">개인 명의로 올리기</option>
              {memberships.map((m) => (
                <option key={m.team.id} value={m.team.id}>
                  {m.team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">내용</label>
          <textarea
            name="content"
            className="input min-h-32"
            placeholder="실력대, 구장비 부담 방식, 연락 방법 등을 적어주세요."
            required
          />
        </div>
        <button className="btn-primary w-full">등록하기</button>
      </form>
    </div>
  );
}
