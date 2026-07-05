import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/locale";
import { createPickupGame } from "@/lib/actions";
import { FORMATS, REGIONS } from "@/lib/constants";

export default async function NewGamePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = (await getDict()).games;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-bold">{t.newTitle}</h1>
      <p className="mb-4 text-sm text-gray-400">{t.newSubtitle}</p>
      <form action={createPickupGame} className="card space-y-4">
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
        <div>
          <label className="label">{t.fFormat}</label>
          <select name="format" className="input">
            {FORMATS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t.fCapacity}</label>
            <input name="capacity" type="number" min={2} defaultValue={10} className="input" required />
          </div>
          <div>
            <label className="label">{t.fMinToConfirm}</label>
            <input name="minToConfirm" type="number" min={2} defaultValue={6} className="input" required />
          </div>
        </div>
        <button className="btn-primary w-full">{t.submit}</button>
      </form>
    </div>
  );
}
