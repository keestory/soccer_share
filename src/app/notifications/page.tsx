import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getDict, getLocale } from "@/lib/locale";
import { markNotificationsRead } from "@/lib/actions";

export const dynamic = "force-dynamic";

const LOCALE_TAG: Record<string, string> = { ko: "ko-KR", en: "en-US", id: "id-ID" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const t = (await getDict()).notif;
  const tag = LOCALE_TAG[locale] ?? "en-US";

  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.title}</h1>
        {items.some((i) => !i.read) && (
          <form action={markNotificationsRead}>
            <button className="btn-secondary !py-1.5 text-xs">{t.markRead}</button>
          </form>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <Link
              href={n.link}
              className={`card flex items-center gap-3 !py-3 hover:border-pitch-500 ${n.read ? "" : "border-pitch-300 bg-pitch-50/40"}`}
            >
              {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-pitch-500" />}
              <span className="min-w-0 flex-1 text-sm text-gray-800">
                {t.message(n.type, n.actor ?? "", n.title ?? "")}
              </span>
              <span className="shrink-0 text-xs text-gray-400">
                {n.createdAt.toLocaleDateString(tag)}
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="card text-center text-sm text-gray-400">{t.empty}</li>}
      </ul>
    </div>
  );
}
