import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import { MATCH_STATUS_LABELS, POST_STATUS_LABELS, formatDate } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [matches, transfers, mercenaries, venues] = await Promise.all([
    prisma.matchPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: true } }),
    prisma.transferPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: true } }),
    prisma.mercenaryPost.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { author: true } }),
    prisma.venue.findMany({ take: 4 }),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-pitch-600 px-8 py-10 text-white">
        <h1 className="text-3xl font-extrabold">이번 주말, 같이 차실래요?</h1>
        <p className="mt-2 text-pitch-100">
          상대팀 매칭 · 구장 양도 · 용병 모집 · 구장 예약 · 팀 프로필까지 한 곳에서.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/matches/new" className="btn-secondary">
            매치 올리기
          </Link>
          <Link href="/venues" className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">
            구장 예약하기
          </Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">⚔️ 매치찾기</h2>
            <Link href="/matches" className="text-xs text-gray-400 hover:text-pitch-600">
              더보기 →
            </Link>
          </header>
          <ul className="space-y-2.5">
            {matches.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge color={statusColor(p.status)}>{MATCH_STATUS_LABELS[p.status]}</Badge>
                <Link href={`/matches/${p.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(p.matchDate)}</span>
              </li>
            ))}
            {matches.length === 0 && <li className="text-sm text-gray-400">아직 게시글이 없습니다.</li>}
          </ul>
        </section>

        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">🎫 구장양도</h2>
            <Link href="/transfers" className="text-xs text-gray-400 hover:text-pitch-600">
              더보기 →
            </Link>
          </header>
          <ul className="space-y-2.5">
            {transfers.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge color={p.tradeType === "GIVE" ? "orange" : "blue"}>
                  {p.tradeType === "GIVE" ? "양도" : "양수"}
                </Badge>
                <Link href={`/transfers/${p.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {p.title}
                </Link>
                <span className="shrink-0 text-xs text-gray-400">{formatDate(p.matchDate)}</span>
              </li>
            ))}
            {transfers.length === 0 && <li className="text-sm text-gray-400">아직 게시글이 없습니다.</li>}
          </ul>
        </section>

        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">🏃 용병</h2>
            <Link href="/mercenaries" className="text-xs text-gray-400 hover:text-pitch-600">
              더보기 →
            </Link>
          </header>
          <ul className="space-y-2.5">
            {mercenaries.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <Badge color={p.postType === "RECRUIT" ? "red" : "blue"}>
                  {p.postType === "RECRUIT" ? "구해요" : "갈게요"}
                </Badge>
                <Link href={`/mercenaries/${p.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {p.title}
                </Link>
                <Badge color={statusColor(p.status)}>{POST_STATUS_LABELS[p.status]}</Badge>
              </li>
            ))}
            {mercenaries.length === 0 && <li className="text-sm text-gray-400">아직 게시글이 없습니다.</li>}
          </ul>
        </section>

        <section className="card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">🏟️ 구장예약</h2>
            <Link href="/venues" className="text-xs text-gray-400 hover:text-pitch-600">
              더보기 →
            </Link>
          </header>
          <ul className="space-y-2.5">
            {venues.map((v) => (
              <li key={v.id} className="flex items-center gap-2 text-sm">
                <Badge color={v.venueType === "FUTSAL" ? "blue" : "green"}>
                  {v.venueType === "FUTSAL" ? "풋살장" : "축구장"}
                </Badge>
                <Link href={`/venues/${v.id}`} className="flex-1 truncate hover:text-pitch-600">
                  {v.name}
                </Link>
                <span className="shrink-0 text-xs text-gray-400">{v.region.replace("서울 ", "")}</span>
              </li>
            ))}
            {venues.length === 0 && <li className="text-sm text-gray-400">등록된 구장이 없습니다.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
