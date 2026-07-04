import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cancelReservation } from "@/lib/actions";
import Badge from "@/components/Badge";
import { formatDate, formatPrice } from "@/lib/constants";
import { getDict } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function MyReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const d = await getDict();
  const t = d.me;

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    include: { venue: true },
    orderBy: [{ date: "desc" }, { startHour: "asc" }],
  });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">{t.reservationsTitle}</h1>
      <ul className="space-y-2">
        {reservations.map((r) => (
          <li key={r.id} className="card flex items-center gap-3 !py-3">
            <Badge color={r.status === "CONFIRMED" ? "green" : "gray"}>
              {r.status === "CONFIRMED" ? t.confirmed : t.cancelled}
            </Badge>
            <div className="min-w-0 flex-1">
              <Link href={`/venues/${r.venue.id}`} className="text-sm font-semibold hover:text-pitch-600">
                {r.venue.name}
              </Link>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatDate(r.date)} {r.startHour}:00~{r.endHour}:00 ·{" "}
                {formatPrice(r.venue.pricePerHour * (r.endHour - r.startHour))}
              </p>
            </div>
            {r.status === "CONFIRMED" && (
              <form action={cancelReservation.bind(null, r.id)}>
                <button className="btn-secondary !py-1.5 text-xs">{t.cancel}</button>
              </form>
            )}
          </li>
        ))}
        {reservations.length === 0 && (
          <li className="card text-center text-sm text-gray-400">
            {t.noReservations}{" "}
            <Link href="/venues" className="font-semibold text-pitch-600">
              {t.viewVenues}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
