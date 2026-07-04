import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMatchPost } from "@/lib/actions";
import { FORMATS, REGIONS } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export default async function NewMatchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = (await getDict()).matches;

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: { team: { select: { id: true, name: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">{t.newTitle}</h1>
      <form action={createMatchPost} className="card space-y-4">
        <div>
          <label className="label">{t.fTitle}</label>
          <input name="title" className="input" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.fRegion}</label>
            <select name="region" className="input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.fVenue}</label>
            <input name="venue" className="input" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">{t.fDate}</label>
            <input name="matchDate" type="date" className="input" required />
          </div>
          <div>
            <label className="label">{t.fStart}</label>
            <input name="startTime" type="time" className="input" required />
          </div>
          <div>
            <label className="label">{t.fEnd}</label>
            <input name="endTime" type="time" className="input" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.fFormat}</label>
            <select name="format" className="input">
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.fTeam}</label>
            <select name="teamId" className="input">
              <option value="">{t.fTeamNone}</option>
              {memberships.map((m) => (
                <option key={m.team.id} value={m.team.id}>
                  {m.team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">{t.fContent}</label>
          <textarea name="content" className="input min-h-32" required />
        </div>
        <button className="btn-primary w-full">{t.submit}</button>
      </form>
    </div>
  );
}
