import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Badge from "@/components/Badge";
import { formatDate } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getDict();
  const t = d.players;
  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nickname: true,
      position: true,
      level: true,
      region: true,
      bio: true,
      createdAt: true,
      memberships: { include: { team: true }, orderBy: { joinedAt: "asc" } },
      _count: { select: { matchPosts: true, mercenaryPosts: true, transferPosts: true, comments: true } },
      gameJoins: {
        where: { game: { status: { in: ["CONFIRMED", "CLOSED"] } } },
        include: { game: { select: { id: true, title: true, matchDate: true, format: true } } },
        orderBy: { joinedAt: "desc" },
      },
    },
  });
  if (!player) notFound();
  const me = await getCurrentUser();

  // 픽업 게임 결과 자동 집계 → 개인 선수 카드
  const played = player.gameJoins;
  const pickup = {
    games: played.length,
    goals: played.reduce((s, g) => s + g.goals, 0),
    assists: played.reduce((s, g) => s + g.assists, 0),
    mvp: played.filter((g) => g.mvp).length,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <article className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{player.nickname}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge color="green">{d.common.levels[player.level - 1]}</Badge>
              {player.position && <Badge color="blue">{player.position}</Badge>}
              {player.region && <Badge>{player.region}</Badge>}
            </div>
          </div>
          {me?.id === player.id && (
            <Link href="/me" className="btn-secondary !py-1.5 text-xs">
              {t.edit}
            </Link>
          )}
        </div>
        {player.bio && <p className="mt-3 text-sm text-gray-700">{player.bio}</p>}
        <p className="mt-3 text-xs text-gray-400">
          {player.createdAt.toLocaleDateString("ko-KR")} {t.joinedSuffix} · {t.statMatch} {player._count.matchPosts} · {t.statMerc}{" "}
          {player._count.mercenaryPosts} · {t.statTransfer} {player._count.transferPosts} · {t.statComment} {player._count.comments}
        </p>
      </article>

      <section className="card">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-bold">{t.pickupTitle}</h2>
          <span className="text-xs text-gray-400">{t.autoAgg}</span>
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-gray-50 p-4 text-center">
          <div>
            <p className="text-lg font-extrabold">{pickup.games}</p>
            <p className="text-xs text-gray-400">{t.played}</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-pitch-600">{pickup.goals}</p>
            <p className="text-xs text-gray-400">{t.goals}</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-blue-600">{pickup.assists}</p>
            <p className="text-xs text-gray-400">{t.assists}</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-orange-500">{pickup.mvp}</p>
            <p className="text-xs text-gray-400">{t.mvp}</p>
          </div>
        </div>
        {played.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {played.slice(0, 5).map((g) => (
              <li key={g.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                <span className="shrink-0 text-xs font-semibold text-gray-500">{formatDate(g.game.matchDate)}</span>
                <Link href={`/games/${g.game.id}`} className="min-w-0 flex-1 truncate hover:text-pitch-600">
                  {g.game.title}
                </Link>
                {g.mvp && <Badge color="orange">MVP</Badge>}
                {g.goals > 0 && <span className="shrink-0 text-xs text-gray-500">⚽ {g.goals}</span>}
                {g.assists > 0 && <span className="shrink-0 text-xs text-gray-500">👟 {g.assists}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-400">{t.noPickup}</p>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">{t.teamsTitle}</h2>
        <ul className="space-y-2">
          {player.memberships.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm">
              <Link href={`/teams/${m.team.id}`} className="font-semibold hover:text-pitch-600">
                {m.team.name}
              </Link>
              {m.role === "OWNER" && <Badge color="orange">{t.captain}</Badge>}
              <span className="text-xs text-gray-400">
                {m.team.region} · {m.joinedAt.toLocaleDateString("ko-KR")}{t.activeFrom}
              </span>
            </li>
          ))}
          {player.memberships.length === 0 && <li className="text-sm text-gray-400">{t.noTeams}</li>}
        </ul>
      </section>
    </div>
  );
}
