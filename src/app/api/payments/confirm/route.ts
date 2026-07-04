import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSignature } from "@/lib/payments";

// MockProvider의 결제 완료 리다이렉트 처리. 서명 토큰 검증 후 참가자를 PAID로 전환.
export async function GET(req: NextRequest) {
  const participantId = req.nextUrl.searchParams.get("participantId");
  const token = req.nextUrl.searchParams.get("token");
  const gameId = req.nextUrl.searchParams.get("gameId") ?? "";

  if (!participantId || !token || token !== paymentSignature(participantId)) {
    return NextResponse.json({ ok: false, reason: "invalid token" }, { status: 400 });
  }

  await prisma.gameParticipant.update({
    where: { id: participantId },
    data: { paymentStatus: "PAID" },
  });

  return NextResponse.redirect(new URL(`/games/${gameId}?paid=1`, req.nextUrl.origin));
}
