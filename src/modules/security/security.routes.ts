import { Hono } from "hono";
import { securityService } from "./security.service";

export const securityRoutes = new Hono();

// SPEC section 7.3: Modo Falso (Botão de Pânico)
securityRoutes.post("/panic", (c) => {
  return c.json({
    success: true,
    action: "redirect",
    disguiseUrl: "/disfarce/calculadora",
  });
});

// SPEC section 7.3: Modo Ghost com Temporizador
securityRoutes.post("/ghost", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { userId, durationMinutes, expiresAt } = body;

  if (!userId) {
    return c.json({ error: "userId obrigatório" }, 400);
  }

  const result = securityService.setGhostMode(userId, durationMinutes, expiresAt);
  return c.json({ success: true, ...result, userId });
});
