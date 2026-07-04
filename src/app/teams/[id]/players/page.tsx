import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import PlayerManagement from "@/components/PlayerManagement";
import type { RankedPlayer, StatRecord } from "@/components/RankingBoard";
import { formatPlayedAt } from "@/lib/constants";
import { getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function PlayerManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      records: { orderBy: { playedAt: "desc" } },
      players: {
        orderBy: { createdAt: "asc" },
        include: {
          events: { include: { matchRecord: true } },
          appearances: { include: { matchRecord: true } },
        },
      },
    },
  });
  if (!team) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === team.ownerId;

  const players: RankedPlayer[] = team.players.map((p) => {
    const goalEvents = p.events.filter((e) => e.type === "GOAL");
    const assistEvents = p.events.filter((e) => e.type === "ASSIST");
    const ratings = p.appearances.filter((a) => a.rating != null).map((a) => a.rating as number);
    const ratingAvg = ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null;

    const toRecord = (date: Date, opponent: string, extra?: Partial<StatRecord>): StatRecord => ({
      date: formatPlayedAt(date),
      opponent,
      ...extra,
    });

    const sortByDate = (a: { matchRecord: { playedAt: Date } }, b: { matchRecord: { playedAt: Date } }) =>
      b.matchRecord.playedAt.getTime() - a.matchRecord.playedAt.getTime();

    return {
      id: p.id,
      name: p.name,
      position: p.position,
      number: p.number,
      goals: goalEvents.length,
      assists: assistEvents.length,
      attendance: p.appearances.length,
      cleanSheet: p.appearances.filter((a) => a.cleanSheet).length,
      ratingAvg,
      goalRecords: [...goalEvents]
        .sort(sortByDate)
        .map((e) => toRecord(e.matchRecord.playedAt, e.matchRecord.opponent, { quarter: e.quarter })),
      assistRecords: [...assistEvents]
        .sort(sortByDate)
        .map((e) => toRecord(e.matchRecord.playedAt, e.matchRecord.opponent, { quarter: e.quarter })),
      ratingRecords: [...p.appearances]
        .filter((a) => a.rating != null)
        .sort(sortByDate)
        .map((a) => toRecord(a.matchRecord.playedAt, a.matchRecord.opponent, { rating: a.rating })),
      attendanceRecords: [...p.appearances]
        .sort(sortByDate)
        .map((a) => toRecord(a.matchRecord.playedAt, a.matchRecord.opponent)),
      cleanSheetRecords: [...p.appearances]
        .filter((a) => a.cleanSheet)
        .sort(sortByDate)
        .map((a) => toRecord(a.matchRecord.playedAt, a.matchRecord.opponent)),
    };
  });

  const matches = team.records.map((r) => ({
    id: r.id,
    label: `${formatPlayedAt(r.playedAt)} vs ${r.opponent}`,
    quarters: r.quarters,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/teams/${team.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-pitch-600">
        ← {team.name}
      </Link>
      <PlayerManagement teamId={team.id} isOwner={isOwner} players={players} matches={matches} locale={await getLocale()} />
    </div>
  );
}
