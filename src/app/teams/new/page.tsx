import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createTeam } from "@/lib/actions";
import { REGIONS } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export default async function NewTeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const d = await getDict();
  const t = d.teams;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-bold">{t.newTitle}</h1>
      <form action={createTeam} className="card space-y-4">
        <div>
          <label className="label">{t.name}</label>
          <input name="name" className="input" required maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.region}</label>
            <select name="region" className="input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.teamLevel}</label>
            <select name="level" className="input" defaultValue={3}>
              {d.common.levels.map((label, i) => (
                <option key={i + 1} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">{t.intro}</label>
          <textarea name="description" className="input min-h-24" />
        </div>
        <button className="btn-primary w-full">{t.createBtn}</button>
      </form>
    </div>
  );
}
