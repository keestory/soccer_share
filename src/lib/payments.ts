// 결제 추상화 계층 (P0). 지역별 PG를 갈아끼울 수 있도록 provider 인터페이스로 분리.
// - 실 키가 없는 개발 환경: MockProvider (즉시 결제 완료 URL 반환)
// - 운영: StripeProvider (STRIPE_SECRET_KEY 설정 시 활성화) — 실제 SDK 호출은 TODO 스텁
//
// 정책: no-confirm-no-charge. 게임이 CONFIRMED 되기 전에는 결제 세션을 만들지 않는다.

import { createHmac } from "crypto";

export type CheckoutRequest = {
  participantId: string;
  gameId: string;
  amount: number; // 최소 화폐 단위가 아닌 표시 단위 (KRW 8000, AUD 6.00 등)
  currency: string;
  description: string;
};

export type CheckoutSession = {
  provider: string;
  sessionId: string;
  // 사용자가 결제를 진행할 URL. Mock은 즉시 성공 콜백으로 보낸다.
  checkoutUrl: string;
};

export type WebhookResult =
  | { ok: true; participantId: string; paid: boolean }
  | { ok: false; reason: string };

export interface PaymentProvider {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  // provider별 서명 검증 + 이벤트 파싱
  parseWebhook(rawBody: string, signature: string | null): WebhookResult;
}

const webhookSecret = () => process.env.PAYMENTS_WEBHOOK_SECRET ?? "dev-webhook-secret";

function sign(value: string) {
  return createHmac("sha256", webhookSecret()).update(value).digest("hex");
}

// 개발/데모용: 결제 UI 없이 즉시 "결제 완료" 콜백 URL을 돌려준다.
class MockProvider implements PaymentProvider {
  readonly name = "mock";

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const sessionId = `mock_${req.participantId}`;
    const token = sign(req.participantId);
    // 내부 확인 라우트로 바로 이동 → webhook 대신 서명된 리다이렉트로 결제 완료 처리
    const url = `/api/payments/confirm?participantId=${encodeURIComponent(req.participantId)}&token=${token}&gameId=${encodeURIComponent(req.gameId)}`;
    return { provider: this.name, sessionId, checkoutUrl: url };
  }

  parseWebhook(rawBody: string, signature: string | null): WebhookResult {
    try {
      const body = JSON.parse(rawBody) as { participantId?: string; paid?: boolean };
      if (!body.participantId) return { ok: false, reason: "participantId 누락" };
      if (signature !== sign(body.participantId)) return { ok: false, reason: "서명 불일치" };
      return { ok: true, participantId: body.participantId, paid: body.paid !== false };
    } catch {
      return { ok: false, reason: "본문 파싱 실패" };
    }
  }
}

// 운영용 스텁: 실제 Stripe SDK 연동 지점. 키가 있어도 SDK 호출부는 TODO.
class StripeProvider implements PaymentProvider {
  readonly name = "stripe";
  constructor(private secretKey: string) {}

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    // TODO: stripe.checkout.sessions.create({ line_items, mode:'payment', success_url, ... })
    // KRW는 정수 최소단위, 그 외는 *100. success_url은 /games/[gameId].
    throw new Error(
      "StripeProvider는 아직 SDK 미연동 상태입니다. STRIPE_SECRET_KEY와 함께 stripe SDK 연동을 구현하세요.",
    );
  }

  parseWebhook(rawBody: string, signature: string | null): WebhookResult {
    // TODO: stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
    //       → checkout.session.completed 에서 metadata.participantId 추출
    return { ok: false, reason: "Stripe webhook 미구현" };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const key = process.env.STRIPE_SECRET_KEY;
  if (key) return new StripeProvider(key);
  return new MockProvider();
}

export const paymentSignature = sign;
