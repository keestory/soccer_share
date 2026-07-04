import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "@/lib/actions";
import { POSITIONS, REGIONS } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const d = await getDict();
  const t = d.me;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-bold">{t.editTitle}</h1>
      <form action={updateProfile} className="card space-y-4">
        <div>
          <label className="label">{t.nickname}</label>
          <input className="input bg-gray-100" value={user.nickname} disabled />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.position}</label>
            <select name="position" className="input" defaultValue={user.position ?? "무관"}>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p === "무관" ? d.common.any : p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.level}</label>
            <select name="level" className="input" defaultValue={user.level}>
              {d.common.levels.map((label, i) => (
                <option key={i + 1} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">{t.region}</label>
          <select name="region" className="input" defaultValue={user.region ?? REGIONS[0]}>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.bio}</label>
          <textarea name="bio" className="input min-h-24" defaultValue={user.bio ?? ""} />
        </div>
        <button className="btn-primary w-full">{t.save}</button>
      </form>
    </div>
  );
}
