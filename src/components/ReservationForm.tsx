"use client";

import { useActionState } from "react";
import { createReservation } from "@/lib/actions";

export default function ReservationForm({
  venueId,
  date,
  openHour,
  closeHour,
  loggedIn,
}: {
  venueId: string;
  date: string;
  openHour: number;
  closeHour: number;
  loggedIn: boolean;
}) {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(createReservation, {});
  const hours = Array.from({ length: closeHour - openHour }, (_, i) => openHour + i);

  if (!loggedIn) {
    return <p className="mt-4 text-sm text-gray-400">예약하려면 로그인이 필요합니다.</p>;
  }

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="venueId" value={venueId} />
      <input type="hidden" name="date" value={date} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">시작 시간</label>
          <select name="startHour" className="input">
            {hours.map((h) => (
              <option key={h} value={h}>
                {h}:00
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">종료 시간</label>
          <select name="endHour" className="input" defaultValue={Math.min(openHour + 2, closeHour)}>
            {hours.map((h) => (
              <option key={h + 1} value={h + 1}>
                {h + 1}:00
              </option>
            ))}
          </select>
        </div>
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? "예약 중..." : `${date} 예약하기`}
      </button>
    </form>
  );
}
