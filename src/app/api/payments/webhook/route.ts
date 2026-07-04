import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";

// PG 웹훅 수신 지점 (provider-agnostic). 운영에서 Stripe 등의 결제완료 이벤트를 받아 참가자 상태 갱신.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-payment-signature") ?? req.headers.get("stripe-signature");

  const provider = getPaymentProvider();
  const result = provider.parseWebhook(rawBody, signature);

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 400 });
  }

  await prisma.gameParticipant.update({
    where: { id: result.participantId },
    data: { paymentStatus: result.paid ? "PAID" : "REFUNDED" },
  });

  return NextResponse.json({ ok: true });
}
