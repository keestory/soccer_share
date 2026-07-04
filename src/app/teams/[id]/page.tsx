import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addMatchRecord, joinTeam, leaveTeam } from "@/lib/actions";
import Badge from "@/components/Badge";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getDict();
  const t = d.teams;
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, nickname: true, position: true, level: true } } },
        orderBy: { joinedAt: "asc" },
      },
      records: { orderBy: { playedAt: "desc" } },
    },
  });
  if (!team) notFound();

  const user = await getCurrentUser();
  const isMember = !!user && team.members.some((m) => m.userId === user.id);
  const isOwner = user?.id === team.ownerId;

  const wins = team.records.filter((r) => r.result === "WIN").length;
  const draws = team.records.filter((r) => r.result === "DRAW").length;
  const losses = team.records.filter((r) => r.result === "LOSS").length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <article className="card">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge color="green">{d.common.levels[team.level - 1]}</Badge>
          <Badge>{team.region}</Badge>
        </div>
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold">{team.name}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={`/teams/${team.id}/players`} className="btn-secondary !py-1.5 text-xs">
              {t.manage}
            </Link>
            {user && !isOwner && (
              <form action={(isMember ? leaveTeam : joinTeam).bind(null, team.id)}>
                <button className={isMember ? "btn-secondary !py-1.5 text-xs" : "btn-primary !py-1.5 text-xs"}>
                  {isMember ? t.leave : t.join}
                </button>
              </form>
            )}
          </div>
        </div>
        {team.description && <p className="mt-2 text-sm text-gray-700">{team.description}</p>}
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg bg-gray-50 p-4 text-center">
          <div>
            <p className="text-lg font-extrabold">{team.records.length}</p>
            <p className="text-xs text-gray-400">{t.games}</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-pitch-600">{wins}</p>
            <p className="text-xs text-gray-400">{t.win}</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-500">{draws}</p>
            <p className="text-xs text-gray-400">{t.draw}</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-red-500">{losses}</p>
            <p className="text-xs text-gray-400">{t.loss}</p>
          </div>
        </div>
      </article>

      <section className="card">
        <h2 className="mb-3 font-bold">{t.members(team.members.length)}</h2>
        <ul className="space-y-2">
          {team.members.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-sm">
              <Link href={`/players/${m.user.id}`} className="font-semibold hover:text-pitch-600">
                {m.user.nickname}
              </Link>
              {m.role === "OWNER" && <Badge color="orange">{t.captain}</Badge>}
              <span className="text-xs text-gray-400">
                {m.user.position ?? "-"} · {d.common.levels[m.user.level - 1]} · {m.joinedAt.toLocaleDateString("ko-KR")} {t.joined}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold">{t.recordsTitle}</h2>
        <ul className="space-y-2">
          {team.records.map((r) => (
            <li key={r.id} className="flex items-center gap-3 text-sm">
              <Badge color={r.result === "WIN" ? "green" : r.result === "LOSS" ? "red" : "gray"}>
                {r.result === "WIN" ? t.win : r.result === "LOSS" ? t.loss : t.draw}
              </Badge>
              <span className="flex-1">
                vs {r.opponent}{" "}
                <span className="font-bold">
                  {r.scoreFor} : {r.scoreAgainst}
                </span>
              </span>
              <span className="text-xs text-gray-400">{r.playedAt.toLocaleDateString("ko-KR")}</span>
            </li>
          ))}
          {team.records.length === 0 && <li className="text-sm text-gray-400">{t.noRecords}</li>}
        </ul>

        {isOwner && (
          <form action={addMatchRecord} className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-5">
            <input type="hidden" name="teamId" value={team.id} />
            <input name="opponent" className="input sm:col-span-2" placeholder={t.opponent} required />
            <input name="playedAt" type="date" className="input" required />
            <div className="flex items-center gap-1">
              <input name="scoreFor" type="number" min={0} className="input" placeholder="득" required />
              <span className="text-gray-400">:</span>
              <input name="scoreAgainst" type="number" min={0} className="input" placeholder="실" required />
            </div>
            <button className="btn-primary">{t.addRecord}</button>
          </form>
        )}
      </section>
    </div>
  );
}
