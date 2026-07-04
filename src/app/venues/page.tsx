import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import RegionFilter from "@/components/RegionFilter";
import { formatPrice } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function VenuesPage({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const { region } = await searchParams;
  const d = await getDict();
  const t = d.venues;
  const venues = await prisma.venue.findMany({
    where: region ? { region } : undefined,
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">{t.title}</h1>
      <RegionFilter basePath="/venues" current={region} allLabel={d.common.regionAll} />
      <div className="grid gap-3 sm:grid-cols-2">
        {venues.map((v) => (
          <Link key={v.id} href={`/venues/${v.id}`} className="card hover:border-pitch-500">
            <div className="mb-1.5 flex items-center gap-2">
              <Badge color={v.venueType === "FUTSAL" ? "blue" : "green"}>
                {v.venueType === "FUTSAL" ? t.futsal : t.soccer}
              </Badge>
              <Badge>{v.surface}</Badge>
            </div>
            <h2 className="font-bold">{v.name}</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {v.region} · {v.address}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-bold text-pitch-700">{formatPrice(v.pricePerHour)}</span>
              <span className="text-gray-400"> {t.perHour} · {t.operating(v.openHour, v.closeHour)}</span>
            </p>
          </Link>
        ))}
        {venues.length === 0 && <p className="card text-center text-sm text-gray-400 sm:col-span-2">{t.empty}</p>}
      </div>
    </div>
  );
}
