import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { levelLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function TeamsPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const teams = await prisma.team.findMany({
    where: region ? { region } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { members: true } }, records: true },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">👥 팀</h1>
        <Link href="/teams/new" className="btn-primary">
          팀 만들기
        </Link>
      </div>
      <RegionFilter basePath="/teams" current={region} />
      <div className="grid gap-3 sm:grid-cols-2">
        {teams.map((t) => {
          const wins = t.records.filter((r) => r.result === "WIN").length;
          const draws = t.records.filter((r) => r.result === "DRAW").length;
          const losses = t.records.filter((r) => r.result === "LOSS").length;
          return (
            <Link key={t.id} href={`/teams/${t.id}`} className="card hover:border-pitch-500">
              <div className="mb-1.5 flex items-center gap-2">
                <Badge color="green">{levelLabel(t.level)}</Badge>
                <Badge>{t.region}</Badge>
              </div>
              <h2 className="font-bold">{t.name}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-gray-400">{t.description}</p>
              <p className="mt-2 text-xs text-gray-500">
                멤버 {t._count.members}명 · 전적 {wins}승 {draws}무 {losses}패
              </p>
            </Link>
          );
        })}
        {teams.length === 0 && <p className="card text-center text-sm text-gray-400 sm:col-span-2">등록된 팀이 없습니다.</p>}
      </div>
    </div>
  );
}
