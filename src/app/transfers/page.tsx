import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { POST_STATUS_LABELS, formatDate, formatPrice } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function TransfersPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const posts = await prisma.transferPost.findMany({
    where: region ? { region } : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { nickname: true } } },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🎫 구장양도</h1>
        <Link href="/transfers/new" className="btn-primary">
          글쓰기
        </Link>
      </div>
      <RegionFilter basePath="/transfers" current={region} />
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/transfers/${p.id}`} className="card flex items-center gap-3 !py-3 hover:border-pitch-500">
              <Badge color={p.tradeType === "GIVE" ? "orange" : "blue"}>{p.tradeType === "GIVE" ? "양도" : "양수"}</Badge>
              <Badge color={statusColor(p.status)}>{POST_STATUS_LABELS[p.status]}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {p.region} · {p.venueName} · {formatDate(p.matchDate)} {p.startTime}~{p.endTime}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs">
                <p className="font-bold text-pitch-700">{formatPrice(p.price)}</p>
                <p className="text-gray-400">{p.author.nickname}</p>
              </div>
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="card text-center text-sm text-gray-400">게시글이 없습니다.</li>}
      </ul>
    </div>
  );
}
