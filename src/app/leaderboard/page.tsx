import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/locale";
import RegionFilter from "@/components/RegionFilter";
import Leaderboard, { type RankedUser } from "@/components/Leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const d = await getDict();
  const t = d.leaderboard;

  // 성사/마감된 픽업 게임의 참가 기록을 유저별로 집계 → 전체 랭킹
  const rows = await prisma.gameParticipant.findMany({
    where: {
      game: { status: { in: ["CONFIRMED", "CLOSED"] } },
      ...(region ? { user: { region } } : {}),
    },
    include: { user: { select: { id: true, nickname: true, position: true } } },
  });

  const byUser = new Map<string, RankedUser>();
  for (const r of rows) {
    const cur =
      byUser.get(r.userId) ??
      { id: r.user.id, nickname: r.user.nickname, position: r.user.position, goals: 0, assists: 0, mvp: 0, games: 0 };
    cur.goals += r.goals;
    cur.assists += r.assists;
    cur.mvp += r.mvp ? 1 : 0;
    cur.games += 1;
    byUser.set(r.userId, cur);
  }
  const players = Array.from(byUser.values());

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold">{t.title}</h1>
      <p className="mb-4 mt-1 text-sm text-gray-400">{t.subtitle}</p>
      <RegionFilter basePath="/leaderboard" current={region} allLabel={d.common.regionAll} />
      <Leaderboard
        players={players}
        labels={{ goals: t.goals, assists: t.assists, mvp: t.mvp, games: t.games }}
        emptyLabel={t.empty}
      />
    </div>
  );
}
