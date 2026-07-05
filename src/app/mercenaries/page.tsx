import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge, { statusColor } from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { formatDate } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function MercenariesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; type?: string }>;
}) {
  const d = await getDict();
  const t = d.mercenaries;
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
        <h1 className="text-xl font-bold">🏃 {t.title}</h1>
        <Link href="/mercenaries/new" className="btn-primary">
          {t.write}
        </Link>
      </div>
      <div className="mb-3 flex gap-2">
        {tab(undefined, d.common.regionAll)}
        {tab("RECRUIT", t.recruitTab)}
        {tab("OFFER", t.offerTab)}
      </div>
      <RegionFilter basePath="/mercenaries" current={region} allLabel={d.common.regionAll} />
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/mercenaries/${p.id}`} className="card flex items-center gap-3 !py-3 hover:border-pitch-500">
              <Badge color={p.postType === "RECRUIT" ? "red" : "blue"}>
                {p.postType === "RECRUIT" ? t.recruit : t.offer}
              </Badge>
              <Badge color={statusColor(p.status)}>{d.common.postStatus[p.status]}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {p.region}
                  {p.matchDate ? ` · ${formatDate(p.matchDate)}` : ""} · {p.position || t.posNone} ·{" "}
                  {d.common.levels[p.level - 1]}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{p.author.nickname}</span>
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li className="card text-center text-sm text-gray-400">{t.empty}</li>}
      </ul>
    </div>
  );
}
