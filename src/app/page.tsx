import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import { formatDate } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getDict();
  const [matches, transfers, mercenaries, venues, gameStats] = await Promise.all([
    prisma.matchPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: true } }),
    prisma.transferPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: true } }),
    prisma.mercenaryPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: true } }),
    prisma.venue.findMany({ take: 4 }),
    prisma.gameParticipant.groupBy({
      by: ["userId"],
      where: { game: { status: { in: ["CONFIRMED", "CLOSED"] } }, goals: { gt: 0 } },
      _sum: { goals: true },
      orderBy: { _sum: { goals: "desc" } },
      take: 3,
    }),
  ]);
  const topScorers = (
    await Promise.all(
      gameStats.map(async (g) => {
        const u = await prisma.user.findUnique({ where: { id: g.userId }, select: { id: true, nickname: true } });
        return u ? { ...u, goals: g._sum.goals ?? 0 } : null;
      }),
    )
  ).filter((x): x is { id: string; nickname: string; goals: number } => x !== null);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-pitch-600 px-8 py-10 text-white">
        <h1 className="text-3xl font-extrabold">{t.home.heroTitle}</h1>
        <p className="mt-2 text-pitch-100">{t.home.heroSubtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/games/new" className="btn-secondary">
            {t.home.ctaGame}
          </Link>
          <Link href="/venues" className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">
            {t.home.ctaBook}
          </Link>
        </div>
      </section>

      {topScorers.length > 0 && (
        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{t.home.secLeaderboard}</h2>
            <Link href="/leaderboard" className="text-xs text-gray-400 hover:text-pitch-600">
              {t.home.more}
            </Link>
          </header>
          <ul className="grid gap-2 sm:grid-cols-3">
            {topScorers.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/players/${s.id}`}
                  className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      ["bg-yellow-400", "bg-gray-300", "bg-amber-700"][i]
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{s.nickname}</span>
                  <span className="shrink-0 text-sm font-extrabold text-blue-600">
                    {s.goals}
                    <span className="ml-0.5 text-xs font-semibold text-gray-400">{t.leaderboard.goals}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{t.home.secMatches}</h2>
            <Link href="/matches" className="text-xs text-gray-400 hover:text-pitch-600">
              {t.home.more}
            </Link>
          </header>
          <ul className="space-y-2.5">
            {matches.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge color={statusColor(p.status)}>{t.matches.status[p.status]}</Badge>
                <Link href={`/matches/${p.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(p.matchDate)}</span>
              </li>
            ))}
            {matches.length === 0 && <li className="text-sm text-gray-400">{t.home.empty}</li>}
          </ul>
        </section>

        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{t.home.secTransfers}</h2>
            <Link href="/transfers" className="text-xs text-gray-400 hover:text-pitch-600">
              {t.home.more}
            </Link>
          </header>
          <ul className="space-y-2.5">
            {transfers.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge color={p.tradeType === "GIVE" ? "orange" : "blue"}>
                  {p.tradeType === "GIVE" ? t.transfers.give : t.transfers.take}
                </Badge>
                <Link href={`/transfers/${p.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(p.matchDate)}</span>
              </li>
            ))}
            {transfers.length === 0 && <li className="text-sm text-gray-400">{t.home.empty}</li>}
          </ul>
        </section>

        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{t.home.secMercenaries}</h2>
            <Link href="/mercenaries" className="text-xs text-gray-400 hover:text-pitch-600">
              {t.home.more}
            </Link>
          </header>
          <ul className="space-y-2.5">
            {mercenaries.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge color={p.postType === "RECRUIT" ? "red" : "blue"}>
                  {p.postType === "RECRUIT" ? t.mercenaries.recruit : t.mercenaries.offer}
                </Badge>
                <Link href={`/mercenaries/${p.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {p.title}
                </Link>
                <Badge color={statusColor(p.status)}>{t.common.postStatus[p.status]}</Badge>
              </li>
            ))}
            {mercenaries.length === 0 && <li className="text-sm text-gray-400">{t.home.empty}</li>}
          </ul>
        </section>

        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{t.home.secVenues}</h2>
            <Link href="/venues" className="text-xs text-gray-400 hover:text-pitch-600">
              {t.home.more}
            </Link>
          </header>
          <ul className="space-y-2.5">
            {venues.map((v) => (
              <li key={v.id} className="flex items-center gap-2 text-sm">
                <Badge color={v.venueType === "FUTSAL" ? "blue" : "green"}>
                  {v.venueType === "FUTSAL" ? t.venues.futsal : t.venues.soccer}
                </Badge>
                <Link href={`/venues/${v.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {v.name}
                </Link>
                <span className="shrink-0 text-xs text-gray-400">{v.region.replace("서울 ", "")}</span>
              </li>
            ))}
            {venues.length === 0 && <li className="text-sm text-gray-400">{t.home.emptyVenue}</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
