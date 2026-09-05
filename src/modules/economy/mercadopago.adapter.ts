import { createHmac } from "node:crypto";
import { economyService } from "./economy.service";

export interface MercadoPagoWebhookPayload {
  action?: string;
  type?: string;
  data?: { id: string };
  status?: string;
  payerId?: string;
  tokenUnits?: number;
}

export const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || "mp-dev-webhook-secret-32chars!";
export const processedPayments = new Set<string>();

export class MercadoPagoAdapter {
  verifySignature(signatureHeader?: string, dataId?: string, requestId?: string): boolean {
    if (!signatureHeader) {
      return process.env.NODE_ENV !== "production";
    }

    try {
      // Format: ts=1700000000,v1=hash
      const parts = Object.fromEntries(
        signatureHeader.split(",").map((p) => p.trim().split("=") as [string, string])
      );
      const ts = parts["ts"];
      const v1 = parts["v1"];
      if (!ts || !v1) return false;

      const manifest = `id:${dataId || ""};request-id:${requestId || ""};ts:${ts};`;
      const expected = createHmac("sha256", MP_WEBHOOK_SECRET).update(manifest).digest("hex");
      return v1 === expected;
    } catch {
      return false;
    }
  }

  processWebhook(
    payload: MercadoPagoWebhookPayload,
    options?: { signature?: string; requestId?: string }
  ): { processed: boolean; newBalance?: number; error?: string } {
    if (!payload?.data?.id && !payload?.status) {
      return { processed: false, error: "Payload do webhook incompleto" };
    }

    const isApproved = payload.status === "approved" || payload.action === "payment.created";
    if (!isApproved) {
      return { processed: false, error: "Status de pagamento pendente ou não aprovado" };
    }

    // Cryptographic signature verification
    if (options?.signature || process.env.NODE_ENV === "production") {
      const isValid = this.verifySignature(options?.signature, payload.data?.id, options?.requestId);
      if (!isValid) {
        return { processed: false, error: "Assinatura do webhook inválida (HMAC SHA-256 falhou)" };
      }
    }

    const paymentId = payload.data?.id || `mp-${Date.now()}`;

    // Idempotency: avoid double-crediting
    if (processedPayments.has(paymentId)) {
      const currentBalance = economyService.getBalance(payload.payerId || "user-default");
      return { processed: true, newBalance: currentBalance };
    }

    // Enforce valid positive finite token amount
    const tokens = Number(payload.tokenUnits) || 100;
    if (tokens <= 0 || !Number.isFinite(tokens) || tokens > 100000) {
      return { processed: false, error: "Quantidade de tokens inválida" };
    }

    const userId = payload.payerId || "user-default";
    processedPayments.add(paymentId);

    const newBalance = economyService.creditFromPurchase(userId, tokens, paymentId);
    return { processed: true, newBalance };
  }
}

export const mercadoPagoAdapter = new MercadoPagoAdapter();
