import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { formatDate } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const t = (await getDict()).matches;
  const posts = await prisma.matchPost.findMany({
    where: region ? { region } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { nickname: true } }, team: { select: { name: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t.title}</h1>
        <Link href="/matches/new" className="btn-primary">
          {t.write}
        </Link>
      </div>
      <RegionFilter basePath="/matches" current={region} />
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/matches/${p.id}`} className="card flex items-center gap-3 !py-3 hover:border-pitch-500">
              <Badge color={statusColor(p.status)}>{t.status[p.status]}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {p.region} · {p.venue} · {formatDate(p.matchDate)} {p.startTime}~{p.endTime} · {p.format}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-gray-400">
                <p className="font-medium text-gray-600">{p.team?.name ?? p.author.nickname}</p>
                <p>{t.views(p.views)}</p>
              </div>
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="card text-center text-sm text-gray-400">{t.empty}</li>}
      </ul>
    </div>
  );
}
