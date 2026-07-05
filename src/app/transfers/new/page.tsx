import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createTransferPost } from "@/lib/actions";
import { REGIONS } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export default async function NewTransferPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const d = await getDict();
  const t = d.transfers;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">{t.newTitle}</h1>
      <form action={createTransferPost} className="card space-y-4">
        <div>
          <label className="label">{t.type}</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" name="tradeType" value="GIVE" defaultChecked /> {t.giveFull}
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" name="tradeType" value="TAKE" /> {t.takeFull}
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
            <label className="label">{t.venueName}</label>
            <input name="venueName" className="input" required />
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
          <label className="label">{t.price}</label>
          <input name="price" type="number" min={0} step={1000} className="input" required />
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
