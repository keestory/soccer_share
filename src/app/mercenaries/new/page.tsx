import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createMercenaryPost } from "@/lib/actions";
import { POSITIONS, REGIONS } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export default async function NewMercenaryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const d = await getDict();
  const t = d.mercenaries;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">{t.newTitle}</h1>
      <form action={createMercenaryPost} className="card space-y-4">
        <div>
          <label className="label">{t.type}</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="postType" value="RECRUIT" defaultChecked /> {t.recruitTeam}
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="postType" value="OFFER" /> {t.offerIndiv}
            </label>
          </div>
        </div>
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
            <label className="label">{t.dateOptional}</label>
            <input name="matchDate" type="date" className="input" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">{t.position}</label>
            <select name="position" className="input" defaultValue="무관">
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p === "무관" ? d.common.any : p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.wantLevel}</label>
            <select name="level" className="input" defaultValue={3}>
              {d.common.levels.map((label, i) => (
                <option key={i + 1} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.fee}</label>
            <input name="fee" type="number" min={0} step={1000} className="input" defaultValue={0} />
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
