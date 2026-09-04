import { Hono } from "hono";
import { economyService } from "./economy.service";
import { mercadoPagoAdapter } from "./mercadopago.adapter";

export const economyRoutes = new Hono();

economyRoutes.get("/wallet/:userId", (c) => {
  const userId = c.req.param("userId");
  const balance = economyService.getBalance(userId);
  return c.json({ userId, balance });
});

// Mercado Pago Webhook (CON-002)
economyRoutes.post("/wallet/webhook/mercadopago", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const result = mercadoPagoAdapter.processWebhook(body);

  if (!result.processed) {
    return c.json({ error: result.error }, 400);
  }

  return c.json({ success: true, newBalance: result.newBalance }, 200);
});

// Prohibited endpoints
economyRoutes.post("/wallet/cashout", (c) => {
  const attempt = economyService.attemptCashOut();
  return c.json(attempt, 400);
});

economyRoutes.post("/wallet/p2p", (c) => {
  const attempt = economyService.attemptP2PTransfer();
  return c.json(attempt, 400);
});
