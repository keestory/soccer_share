import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { formatDate } from "@/lib/constants";

export const dynamic = "force-dynamic";

const GAME_STATUS: Record<string, string> = {
  OPEN: "모집중",
  CONFIRMED: "성사됨",
  CLOSED: "마감",
  CANCELLED: "취소",
};

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const games = await prisma.pickupGame.findMany({
    where: region ? { region } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { participants: true } }, host: { select: { nickname: true } } },
  });

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-bold">🥅 픽업 게임</h1>
        <Link href="/games/new" className="btn-primary">
          게임 열기
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-400">최소 인원을 채우면 게임이 자동으로 성사됩니다 · 무료 매칭</p>
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
                    {GAME_STATUS[g.status]}
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
                    {filled}/{g.capacity}명
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
        {games.length === 0 && <li className="card text-center text-sm text-gray-400">열린 게임이 없습니다.</li>}
      </ul>
    </div>
  );
}
