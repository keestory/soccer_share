import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { formatDate } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const t = (await getDict()).games;
  const games = await prisma.pickupGame.findMany({
    where: region ? { region } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } }, host: { select: { nickname: true } } },
  });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.title}</h1>
        <Link href="/games/new" className="btn-primary">
          {t.open}
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-400">{t.subtitle}</p>
      <RegionFilter basePath="/games" current={region} />
      <ul className="space-y-2">
        {games.map((g) => {
          const filled = g._count.participants;
          const pct = Math.min(100, Math.round((filled / g.capacity) * 100));
          return (
            <li key={g.id}>
              <Link href={`/games/${g.id}`} className="card block hover:border-pitch-500">
                <div className="flex items-center gap-2">
                  <Badge color={statusColor(g.status === "CONFIRMED" ? "MATCHED" : g.status)}>
                    {t.status[g.status]}
                  </Badge>
                  <Badge>{g.format}</Badge>
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold">{g.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {g.region} · {g.venue} · {formatDate(g.matchDate)} {g.startTime}~{g.endTime}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full ${g.status === "CONFIRMED" ? "bg-blue-500" : "bg-pitch-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-gray-500">
                    {filled}/{g.capacity}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        {games.length === 0 && <li className="card text-center text-sm text-gray-400">{t.empty}</li>}
      </ul>
    </div>
  );
}
