import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { POST_STATUS_LABELS, formatDate, levelLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MercenariesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; type?: string }>;
}) {
  const { region, type } = await searchParams;
  const posts = await prisma.mercenaryPost.findMany({
    where: {
      ...(region ? { region } : {}),
      ...(type ? { postType: type } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { nickname: true } } },
  });

  const tab = (t: string | undefined, label: string) => {
    const qs = new URLSearchParams();
    if (region) qs.set("region", region);
    if (t) qs.set("type", t);
    const href = `/mercenaries${qs.size ? `?${qs}` : ""}`;
    const active = (type ?? "") === (t ?? "");
    return (
      <Link
        key={label}
        href={href}
        className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? "bg-pitch-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">🏃 용병</h1>
        <Link href="/mercenaries/new" className="btn-primary">
          글쓰기
        </Link>
      </div>
      <div className="mb-3 flex gap-2">
        {tab(undefined, "전체")}
        {tab("RECRUIT", "용병 구해요")}
        {tab("OFFER", "용병 갈게요")}
      </div>
      <RegionFilter basePath="/mercenaries" current={region} />
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/mercenaries/${p.id}`} className="card flex items-center gap-3 !py-3 hover:border-pitch-500">
              <Badge color={p.postType === "RECRUIT" ? "red" : "blue"}>
                {p.postType === "RECRUIT" ? "구해요" : "갈게요"}
              </Badge>
              <Badge color={statusColor(p.status)}>{POST_STATUS_LABELS[p.status]}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {p.region}
                  {p.matchDate ? ` · ${formatDate(p.matchDate)}` : ""} · {p.position || "포지션 무관"} ·{" "}
                  {levelLabel(p.level)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{p.author.nickname}</span>
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="card text-center text-sm text-gray-400">게시글이 없습니다.</li>}
      </ul>
    </div>
  );
}
