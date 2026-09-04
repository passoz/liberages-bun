import { Hono } from "hono";
import { creditTokens } from "./wallet";

export const b2bApp = new Hono();

export const claimedTreasuresStore = new Set<string>();

// SPEC section 9.2: Caça ao Tesouro (B2B)
// O Parceiro paga a plataforma para ocultar um "tesouro geolocalizado".
// O usuário o coleta no mapa, ganhando Moedas Virtuais ou descontos reais.
b2bApp.post("/api/b2b/treasure/claim", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { treasureId, spotId, userId, tokenReward } = body;

  if (!treasureId || !userId || !tokenReward) {
    return c.json({ error: "Parâmetros de tesouro inválidos" }, 400);
  }

  const claimKey = `${userId}:${treasureId}`;
  if (claimedTreasuresStore.has(claimKey)) {
    return c.json({ error: "Tesouro já resgatado por este usuário" }, 409);
  }

  claimedTreasuresStore.add(claimKey);
  const credit = creditTokens(userId, tokenReward);

  return c.json({
    claimed: true,
    treasureId,
    spotId,
    tokensAwarded: tokenReward,
    newBalance: credit.balance,
  }, 200);
});
