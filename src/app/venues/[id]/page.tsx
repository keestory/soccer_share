import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Badge from "@/components/Badge";
import ReservationForm from "@/components/ReservationForm";
import { formatDate, formatPrice } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

function localYmd(d: Date): string {
  // 로컬 시간 기준 YYYY-MM-DD (toISOString의 UTC 변환 off-by-one 방지)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nextDays(count: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(localYmd(d));
  }
  return out;
}

export default async function VenueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const days = nextDays(7);
  const { date: rawDate } = await searchParams;
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : days[0];

  const venue = await prisma.venue.findUnique({
    where: { id },
    include: {
      reservations: { where: { date, status: "CONFIRMED" }, orderBy: { startHour: "asc" } },
    },
  });
  if (!venue) notFound();
  const user = await getCurrentUser();
  const t = (await getDict()).venues;

  const hours = Array.from({ length: venue.closeHour - venue.openHour }, (_, i) => venue.openHour + i);
  const reservedHours = new Set(
    venue.reservations.flatMap((r) => Array.from({ length: r.endHour - r.startHour }, (_, i) => r.startHour + i)),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <article className="card">
        <div className="mb-1.5 flex items-center gap-2">
          <Badge color={venue.venueType === "FUTSAL" ? "blue" : "green"}>
            {venue.venueType === "FUTSAL" ? t.futsal : t.soccer}
          </Badge>
          <Badge>{venue.surface}</Badge>
        </div>
        <h1 className="text-xl font-bold">{venue.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {venue.region} · {venue.address}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-bold text-pitch-700">{formatPrice(venue.pricePerHour)}</span>
          <span className="text-gray-400"> {t.perHour} · {t.operating(venue.openHour, venue.closeHour)}</span>
        </p>
        {venue.description && <p className="mt-3 text-sm text-gray-700">{venue.description}</p>}
      </article>

      <section className="card mt-4">
        <h2 className="mb-3 font-bold">{t.statusTitle}</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {days.map((d) => (
            <Link
              key={d}
              href={`/venues/${venue.id}?date=${d}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${d === date ? "bg-pitch-600 text-white" : "border border-gray-200 bg-white text-gray-600"}`}
            >
              {formatDate(d)}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-9">
          {hours.map((h) => (
            <div
              key={h}
              className={`rounded py-1.5 text-center text-xs font-semibold ${
                reservedHours.has(h) ? "bg-gray-200 text-gray-400 line-through" : "bg-pitch-100 text-pitch-700"
              }`}
            >
              {t.hour(h)}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">{t.legend}</p>

        <ReservationForm
          venueId={venue.id}
          date={date}
          openHour={venue.openHour}
          closeHour={venue.closeHour}
          loggedIn={!!user}
          labels={{
            start: t.startTime,
            end: t.endTime,
            book: t.book(date),
            booking: t.booking,
            login: t.loginToBook,
          }}
        />
      </section>
    </div>
  );
}
