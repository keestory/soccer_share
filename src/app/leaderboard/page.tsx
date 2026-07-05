import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/locale";
import RegionFilter from "@/components/RegionFilter";
import Leaderboard, { type RankedUser } from "@/components/Leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const d = await getDict();
  const t = d.leaderboard;

  // 픽업 참가 기록 + 팀 로스터(회원 연결) 기록을 유저별로 통합 집계 → 전체 랭킹
  const [parts, rosterEvents, rosterApps] = await Promise.all([
    prisma.gameParticipant.findMany({
      where: { game: { status: { in: ["CONFIRMED", "CLOSED"] } }, ...(region ? { user: { region } } : {}) },
      select: { userId: true, goals: true, assists: true, mvp: true },
    }),
    prisma.playerEvent.findMany({
      where: { player: { userId: { not: null }, ...(region ? { user: { region } } : {}) } },
      select: { type: true, player: { select: { userId: true } } },
    }),
    prisma.appearance.findMany({
      where: { player: { userId: { not: null }, ...(region ? { user: { region } } : {}) } },
      select: { player: { select: { userId: true } } },
    }),
  ]);

  type Agg = { goals: number; assists: number; mvp: number; games: number };
  const agg = new Map<string, Agg>();
  const bump = (uid: string | null, fn: (a: Agg) => void) => {
    if (!uid) return;
    const cur = agg.get(uid) ?? { goals: 0, assists: 0, mvp: 0, games: 0 };
    fn(cur);
    agg.set(uid, cur);
  };
  parts.forEach((p) =>
    bump(p.userId, (a) => {
      a.goals += p.goals;
      a.assists += p.assists;
      a.mvp += p.mvp ? 1 : 0;
      a.games += 1;
    }),
  );
  rosterEvents.forEach((e) => bump(e.player.userId, (a) => (e.type === "GOAL" ? a.goals++ : a.assists++)));
  rosterApps.forEach((ap) => bump(ap.player.userId, (a) => a.games++));

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(agg.keys()) } },
    select: { id: true, nickname: true, position: true },
  });
  const players: RankedUser[] = users.map((u) => ({ id: u.id, nickname: u.nickname, position: u.position, ...agg.get(u.id)! }));

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
