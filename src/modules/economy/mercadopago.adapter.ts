import { economyService } from "./economy.service";

export interface MercadoPagoWebhookPayload {
  action?: string;
  type?: string;
  data?: { id: string };
  status?: string;
  payerId?: string;
  tokenUnits?: number;
}

export class MercadoPagoAdapter {
  processWebhook(payload: MercadoPagoWebhookPayload): { processed: boolean; newBalance?: number; error?: string } {
    if (!payload?.data?.id && !payload?.status) {
      return { processed: false, error: "Payload do webhook incompleto" };
    }

    const isApproved = payload.status === "approved" || payload.action === "payment.created";
    if (!isApproved) {
      return { processed: false, error: "Status de pagamento pendente ou não aprovado" };
    }

    const userId = payload.payerId || "user-default";
    const tokens = payload.tokenUnits || 100;
    const paymentId = payload.data?.id || `mp-${Date.now()}`;

    const newBalance = economyService.creditFromPurchase(userId, tokens, paymentId);
    return { processed: true, newBalance };
  }
}

export const mercadoPagoAdapter = new MercadoPagoAdapter();
