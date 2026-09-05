import { Hono } from "hono";
import { economyService } from "./economy.service";
import { mercadoPagoAdapter } from "./mercadopago.adapter";
import { getAuthenticatedUser } from "../../shared/auth";

export const economyRoutes = new Hono();

// Wallet balance (restricted to self or authenticated session)
economyRoutes.get("/wallet/:userId", async (c) => {
  const userId = c.req.param("userId");
  const authUser = await getAuthenticatedUser(c);

  if (authUser && authUser.id !== userId) {
    return c.json({ error: "Acesso não autorizado à carteira de outro usuário" }, 403);
  }

  const balance = economyService.getBalance(userId);
  return c.json({ userId, balance });
});

// Mercado Pago Webhook (CON-002 & SEC-01)
economyRoutes.post("/wallet/webhook/mercadopago", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const signature = c.req.header("x-signature");
  const requestId = c.req.header("x-request-id");
  const result = mercadoPagoAdapter.processWebhook(body, { signature, requestId });

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
